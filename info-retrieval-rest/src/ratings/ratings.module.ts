import { Module } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RatingSchema } from './ratings.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Ratings', schema: RatingSchema }])],
  providers: [RatingsService],
  controllers: [RatingsController],
})
export class RatingsModule {}
