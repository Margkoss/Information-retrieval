import { Module } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RatingSchema } from './ratings.model';
import { SearchModule } from 'src/search/search.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Ratings', schema: RatingSchema }]), SearchModule],
  providers: [RatingsService],
  controllers: [RatingsController],
  exports: [RatingsService],
})
export class RatingsModule {}
