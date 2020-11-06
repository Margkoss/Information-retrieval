import { Document, Schema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export const MovieSchema = new Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  genres: [{ type: String, required: true }],
});

export interface Movie extends Document {
  _id: string;
  title: string;
  genres: string[];
}

export class MovieDto {
  @ApiProperty({
    description: 'Movie id',
  })
  _id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({
    description: 'Genre array of movies',
    type: [String],
  })
  genres: string[];
}
