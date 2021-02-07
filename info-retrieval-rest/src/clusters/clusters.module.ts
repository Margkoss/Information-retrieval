import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RatingsModule } from 'src/ratings/ratings.module';
import { ClustersSchema } from './clusters.model';
import { ClustersService } from './clusters.service';
import { ClustersController } from './clusters.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Cluster', schema: ClustersSchema }]), RatingsModule],
  providers: [ClustersService],
  controllers: [ClustersController],
  exports: [ClustersService],
})
export class ClustersModule {}
