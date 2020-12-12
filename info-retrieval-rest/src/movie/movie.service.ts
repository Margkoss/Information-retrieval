import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Movie, MovieDto } from './movie.model';
import * as csvToJson from 'csvtojson';
import { SearchService } from 'src/search/search.service';
import { RatingsService } from 'src/ratings/ratings.service';

@Injectable()
export class MovieService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel('Movie') private readonly movieModel: Model<Movie>,
    private readonly searchService: SearchService,
    private readonly ratingsService: RatingsService,
  ) {}

  public async getMovies(): Promise<Movie[]> {
    return await this.movieModel.find();
  }

  public async postMovie(movie: MovieDto): Promise<Movie> {
    const newMovie = new this.movieModel({
      _id: movie._id,
      title: movie.title,
      genres: movie.genres,
    });

    return await newMovie.save();
  }

  public async getMovie(_id: string): Promise<Movie> {
    const res = await this.movieModel.findById(_id);
    if (!res) {
      throw new NotFoundException({ message: `Movie by _id ${_id} not found` });
    }

    return res;
  }

  public async parseCsvFile(buffer: Buffer): Promise<any> {
    const movieRows = await csvToJson({ output: 'csv' }).fromString(buffer.toString());
    const movies = movieRows.map(row => {
      return { _id: row[0], title: row[1], genres: row[2].split('|') };
    });

    const dbres = await this.movieModel.insertMany(movies);
    this.searchService.bulkImport(dbres);
    return { inserted: dbres.length, total: movies.length, response: 'OK' };
  }

  public async search(query: string) {
    return this.searchService.search(query);
  }

  public async deleteAll() {
    this.searchService.deleteIndexData();
    this.connection.dropDatabase();
  }

  public async searchQuestion2(searchQuery: string, userId: string) {
    // Get all the users ratings
    const userRatings = await this.ratingsService.getRatingsByUser(userId);
    // Get the average rating for a movie

    const avgRating = await this.ratingsService.getAvgMovieRating('1');

    return { usrRat: userRatings, avg: avgRating, movie: await this.getMovie('1') };
  }
}
