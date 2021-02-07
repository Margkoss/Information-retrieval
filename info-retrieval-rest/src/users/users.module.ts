import { forwardRef, Module, OnModuleInit } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserSchema } from './users.model';
import { MongooseModule } from '@nestjs/mongoose';
import { RatingsModule } from 'src/ratings/ratings.module';
import { UsersController } from './users.controller';
import { ClustersModule } from 'src/clusters/clusters.module';
import { MovieModule } from 'src/movie/movie.module';

@Module({
  imports: [
    ClustersModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    RatingsModule,
    MovieModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
