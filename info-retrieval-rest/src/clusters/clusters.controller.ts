import { Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClusterDto } from './clusters.model';
import { ClustersService } from './clusters.service';

@ApiTags('Clusters')
@Controller('clusters')
export class ClustersController {
  constructor(private readonly clustersService: ClustersService) {}

  @Get()
  public async getClusters(): Promise<ClusterDto[]> {
    return await this.clustersService.getClusters();
  }

  @Post('/clusterize')
  public async clusterize(): Promise<any> {
    return await this.clustersService.clusterize();
  }

  @Delete()
  public async deleteClusters(): Promise<any> {
    return await this.clustersService.deleteAll();
  }
}
