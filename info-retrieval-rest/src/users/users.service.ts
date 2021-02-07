import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDto } from './users.model';
import { RatingsService } from 'src/ratings/ratings.service';
import { ClustersService } from 'src/clusters/clusters.service';
import { MovieService } from 'src/movie/movie.service';
import * as progress from 'cli-progress';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly ratingsService: RatingsService,
    private readonly clusterService: ClustersService,
    private readonly movieService: MovieService,
  ) {}

  public async getUsers(populated?: boolean): Promise<UserDto[]> {
    if (populated) {
      return this.userModel.find().populate('ratings');
    }
    return await this.userModel.find();
  }

  public async addMissingRatings(): Promise<{ acknowledged: boolean; added: number }> {
    const [users, clusters, movies] = await Promise.all([
      this.getUsers(true),
      this.clusterService.getClusters(),
      this.movieService.getMovies(),
    ]);

    const bar1 = new progress.SingleBar({}, progress.Presets.shades_classic);
    bar1.start(movies.length, 0);

    // Iterate through all movies and see what users have rated it
    let iters = 0;
    for (let movie of movies) {
      let newRatings = [];
      iters++;
      bar1.update(iters);
      const movieId = movie._id;

      for (let user of users) {
        const userId = user._id;

        let hasRating = false;
        for (let rating of user.ratings) {
          // This means that user has rated this movie
          if (rating.movieId === movieId) {
            hasRating = true;
            break;
          }
        }

        if (hasRating) {
          continue;
        } else {
          // If he hasn't rated the movie with _id = movieId
          // Create a rating from his cluster's average
          let clusterUsers = [];
          let foundCluster = false;

          for (let cluster of clusters) {
            for (let id of cluster.userIds) {
              if (id === userId) {
                clusterUsers = [...cluster.userIds];
                foundCluster = true;
                break;
              }
            }

            if (foundCluster) break;
          }

          // Now that we have cluster users, iterate through users and get average rating on that movie
          let clusterUsersSum = 0;
          for (let i = 0; i < users.length; i++) {
            if (clusterUsers.includes(users[i]._id)) {
              // Iterate through user's ratings to find the movie
              for (let rating of users[i].ratings) {
                if (rating.movieId === movieId) {
                  clusterUsersSum += rating.rating;
                  break;
                }
              }
            }
          }

          const clusterAverage = clusterUsersSum / clusterUsers.length;
          newRatings.push({ userId, movieId, rating: clusterAverage, timestamp: Math.floor(Date.now() / 1000) });
        }
      }
      const addedRatings = await this.ratingsService.insertMany(newRatings);
      let updates = [];
      for (let added of addedRatings) {
        for (let user of users) {
          if (user._id === added.userId) {
            user.ratings.push(added);
            updates.push({
              updateOne: {
                filter: { _id: user._id },
                update: { $push: { ratings: added._id } },
              },
            });
            break;
          }
        }
      }

      const { modifiedCount } = await this.userModel.bulkWrite(updates);
    }

    bar1.stop();

    return { acknowledged: true, added: 10 };
  }

  public async createUsersFromRatings(): Promise<{ acknowledged: boolean; inserted: number }> {
    const ratings = await this.ratingsService.getRatings();
    const usersObj = {};

    ratings.forEach(rating => {
      usersObj[rating.userId] = [];
    });

    ratings.forEach(rating => {
      usersObj[rating.userId].push(rating._id);
    });

    let users = [];
    for (let userId in usersObj) {
      users.push({ _id: userId, ratings: usersObj[userId] });
    }

    const res = await this.insertManyUsers(users);

    return { acknowledged: true, inserted: users.length };
  }

  public async insertManyUsers(users: UserDto[]): Promise<{ acknowledged: boolean; inserted: number }> {
    await this.userModel.insertMany(users);
    return { acknowledged: true, inserted: users.length };
  }
}
