import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { SearchModule } from 'src/search/search.module';
import { MovieController } from './movie.controller';
import { MovieSchema } from './movie.model';
import { MovieService } from './movie.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Movie', schema: MovieSchema }]), SearchModule],
  providers: [MovieService],
  controllers: [MovieController],
})
export class MovieModule {}
