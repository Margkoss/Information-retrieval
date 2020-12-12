import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { RatingsModule } from 'src/ratings/ratings.module';
import { SearchModule } from 'src/search/search.module';
import { MovieController } from './movie.controller';
import { MovieSchema } from './movie.model';
import { MovieService } from './movie.service';

@Module({
  imports: [RatingsModule, MongooseModule.forFeature([{ name: 'Movie', schema: MovieSchema }]), SearchModule],
  providers: [MovieService],
  controllers: [MovieController],
})
export class MovieModule {}
