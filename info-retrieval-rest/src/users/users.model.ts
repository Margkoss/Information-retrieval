import { Document, Schema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Rating } from 'src/ratings/ratings.model';

export const UserSchema = new Schema({
  _id: { type: String, required: true },
  ratings: [{ type: Schema.Types.ObjectId, ref: 'Ratings' }],
});

export interface User extends Document {
  _id: string;
  ratings: Rating[];
}

export class UserDto {
  @ApiProperty({
    description: 'The user id',
  })
  _id: string;

  @ApiProperty({
    description: 'Ratings the user has',
  })
  ratings: Rating[];
}
