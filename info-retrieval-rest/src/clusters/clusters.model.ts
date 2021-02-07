import { Document, Schema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from 'src/users/users.model';

export const ClustersSchema = new Schema({
  centroid: { type: [Number], required: true },
  cluster: { type: [[Number]], required: true },
  userIds: [{ type: String, ref: 'User' }],
});

export interface Cluster extends Document {
  centroid: number[];
  cluster: number[][];
  userIds: string[];
}

export class ClusterDto {
  @ApiProperty({
    description: 'The centroid of the cluster',
  })
  centroid: number[];

  @ApiProperty({
    description: 'All of the points in the cluster',
  })
  cluster: number[][];

  @ApiProperty({
    description: 'User ids in cluster',
  })
  userIds: string[] | UserDto[];
}
