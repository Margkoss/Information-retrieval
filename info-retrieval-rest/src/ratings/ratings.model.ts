import { Document, Schema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export const RatingSchema = new Schema({
  userId: { type: String, required: true },
  movieId: { type: String, ref: 'Movie' },
  rating: { type: Number, required: true },
  timestamp: { type: Number, required: true },
});

export interface Rating extends Document {
  userId: string;
  movieId: string;
  rating: number;
  timestamp: number;
}

export class RatingDto {
  @ApiProperty({
    description: 'The id of the user with the current rating',
  })
  userId: string;

  @ApiProperty({
    description: 'The movie id that the rating belongs to',
  })
  movieId: string;

  @ApiProperty({
    description: 'The rating the user gave to the movie',
  })
  rating: number;

  @ApiProperty({
    description: 'The Unix timestamp that the movie rating took place',
  })
  timestamp: number;
}
