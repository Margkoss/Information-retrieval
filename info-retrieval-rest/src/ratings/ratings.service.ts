import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as csvToJson from 'csvtojson';
import { Model } from 'mongoose';
import { Rating, RatingDto } from './ratings.model';

@Injectable()
export class RatingsService {
  constructor(@InjectModel('Ratings') private readonly ratingModel: Model<Rating>) {}

  public async getRating(_id: string): Promise<Rating> {
    const res = await this.ratingModel.findById(_id);

    if (!res) {
      throw new NotFoundException({ message: `Movie by _id ${_id} not found` });
    }

    return res;
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
}
