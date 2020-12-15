import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as csvToJson from 'csvtojson';
import { Model } from 'mongoose';
import { SearchService } from 'src/search/search.service';
import { Rating, RatingDto } from './ratings.model';

@Injectable()
export class RatingsService {
  constructor(
    @InjectModel('Ratings') private readonly ratingModel: Model<Rating>,
    private readonly searchService: SearchService,
    private config: ConfigService,
  ) {}

  public async getRating(_id: string): Promise<Rating> {
    const res = await this.ratingModel.findById(_id);

    if (!res) {
      throw new NotFoundException({ message: `Rating by _id ${_id} not found` });
    }

    return res;
  }

  public async getRatings(): Promise<Rating[]> {
    return await this.ratingModel.find();
  }

  public async parseCsvFile(buffer: Buffer): Promise<any> {
    const ratingsRows = await csvToJson({ output: 'csv' }).fromString(buffer.toString());

    // Format data
    const ratings = ratingsRows.map(row => {
      return {
        userId: row[0],
        movieId: row[1],
        rating: Number.parseFloat(row[2]),
        timestamp: Number.parseInt(row[3], 10),
      };
    });

    const dbres = await this.ratingModel.insertMany(ratings);
    return { inserted: dbres.length, total: ratingsRows.length, response: 'OK' };
  }

  public async postRating(rating: RatingDto): Promise<Rating> {
    const newRating = new this.ratingModel({
      userId: rating.userId,
      movieId: rating.movieId,
      rating: rating.rating,
      timestamp: rating.timestamp,
    });

    return await newRating.save();
  }

  public async getRatingsByUser(userId: string): Promise<Rating[]> {
    const dbRes = await this.ratingModel.find({ userId: userId }).exec();

    return dbRes;
  }

  public async getRatingsByMovie(movieId: string): Promise<Rating[]> {
    const dbRes = await this.ratingModel.find({ movieId: movieId });

    return dbRes;
  }

  public async getAvgMovieRating(movieId: string): Promise<any> {
    const dbres = await this.ratingModel.aggregate([
      { $match: { movieId: movieId } },
      { $group: { _id: movieId, avgRating: { $avg: '$rating' } } },
    ]);

    const ratings = (await this.getRatingsByMovie(movieId)).map(rating => rating.rating);

    const calculatedAvg = ratings.reduce((a, b) => a + b, 0) / ratings.length;

    return { dbAvg: dbres, calculatedAvg };
  }

  public async reindex() {
    const ratings = await this.getRatings();

    let body = [];
    ratings.forEach(rating => {
      body.push(
        { update: { _id: rating.movieId, _index: 'movie-index', retry_on_conflict: 3 } },
        {
          script: {
            source: 'ctx._source.ratings.add(params.rating)',
            lang: 'painless',
            params: { rating: { rating: rating.rating, timestamp: rating.timestamp, userId: rating.userId } },
          },
        },
      );
    });

    try {
      const res = await this.searchService.clientInstance.bulk({
        index: this.config.get('ELASTICSEARCH_INDEX'),
        body,
      });
    } catch (e) {
      console.error(e);
    }

    return { acknowledged: true };
  }
}
