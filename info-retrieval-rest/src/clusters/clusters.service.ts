import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cluster, ClusterDto } from './clusters.model';
import * as kmeans from 'node-kmeans';
import { RatingsService } from 'src/ratings/ratings.service';

@Injectable()
export class ClustersService {
  constructor(
    @InjectModel('Cluster') private readonly clusterModel: Model<Cluster>,
    private readonly ratingsService: RatingsService,
  ) {}

  public async getClusters(poplulated?: boolean): Promise<ClusterDto[]> {
    if (!poplulated) {
      return await this.clusterModel.find();
    } else {
      return await this.clusterModel.find().populate('userIds');
    }
  }

  public async clusterize(): Promise<any> {
    const ratings = await this.ratingsService.getRatings(true);

    // Get all distinct genre
    const genres = {};
    ratings.forEach(rating => {
      (rating.movieId as any).genres.forEach(genre => {
        if (genre === '(no genres listed)') return;

        if (!genres.hasOwnProperty(genre)) {
          genres[genre] = { sum: 0, total_ratings: 0 };
        }
      });
    });

    // Create an object for each user that contains ratings sum and total ratings for each genre
    const distinctUsers = await this.ratingsService.getDistinctUsers();
    const users = {};
    distinctUsers.forEach(user => {
      users[user] = { genres: JSON.parse(JSON.stringify(genres)) };
    });

    // Iterate through ratings ONCE and increment all necessary fields
    ratings.forEach(rating => {
      const userId = rating.userId;

      (rating.movieId as any).genres.forEach(genre => {
        if (genre === '(no genres listed)') return;

        users[userId].genres[genre].sum += rating.rating;
        users[userId].genres[genre].total_ratings += 1;
      });
    });

    // Calculate average for each genre
    let inputData = [];
    for (let user in users) {
      let averageScores = [];
      for (let genre in users[user].genres) {
        if (users[user].genres[genre].total_ratings === 0) {
          users[user].genres[genre].avg = 0;
        } else {
          users[user].genres[genre].avg = users[user].genres[genre].sum / users[user].genres[genre].total_ratings;
        }
        averageScores.push(users[user].genres[genre].avg);
      }
      inputData.push(averageScores);
    }

    // Utilizing the elbow method we will dervive the optimum number of clusters
    let scores = [];
    for (let i = 1; i <= 500; i++) {
      const clusters: any[] = await new Promise((resolve, reject) => {
        kmeans.clusterize(inputData, { k: i }, (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      });

      // Calculate the mean distance between cluster points and their centroids
      let meanDistances = [];
      clusters.forEach(cluster => {
        const { centroid } = cluster;
        let distances = [];
        cluster.cluster.forEach(point => {
          let squareSum = 0;
          for (let j = 0; j < point.length; j++) squareSum += Math.pow(point[j] - centroid[j], 2);
          distances.push(squareSum);
        });

        meanDistances.push(distances.reduce((a, b) => a + b, 0) / distances.length);
      });
      scores.push(meanDistances.reduce((a, b) => a + b, 0) / meanDistances.length);
    }

    // Once we have the scores we can calculate the maximum distance betwee the scores and the theoritical line between first and last value of scores
    let distancesFromLine = [];
    scores.forEach((score, index) => {
      var A = index - 0;
      var B = score - scores[0];
      var C = scores.length - 1 - 0;
      var D = scores[scores.length - 1] - scores[0];

      var dot = A * C + B * D;
      var len_sq = C * C + D * D;
      var param = -1;
      if (len_sq != 0)
        //in case of 0 length line
        param = dot / len_sq;

      var xx, yy;

      if (param < 0) {
        xx = 0;
        yy = scores[0];
      } else if (param > 1) {
        xx = scores.length - 1;
        yy = scores[scores.length - 1];
      } else {
        xx = 0 + param * C;
        yy = scores[0] + param * D;
      }

      var dx = index - xx;
      var dy = score - yy;

      distancesFromLine.push(Math.sqrt(dx * dx + dy * dy));
    });

    // The largest distance from the line is the elbow point, and the index will give us the K needed.
    let max = { val: 0, index: 0 };
    distancesFromLine.forEach((distance, index) => {
      if (distance > max.val) {
        max.val = distance;
        max.index = index;
      }
    });

    // The best k value is k = max.index
    const clusters: any[] = await new Promise((resolve, reject) => {
      kmeans.clusterize(inputData, { k: max.index }, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });

    let finalClusters = [];
    clusters.forEach(cluster => {
      finalClusters.push({
        cluster: cluster.cluster,
        centroid: cluster.centroid,
        userIds: cluster.clusterInd.map(el => (el + 1).toString()),
      });
    });
    await this.clusterModel.insertMany(finalClusters);

    return { acknowledged: true, added: clusters.length };
  }

  public async deleteAll(): Promise<any> {
    await this.clusterModel.remove({});

    return { acknowledged: true };
  }
}
