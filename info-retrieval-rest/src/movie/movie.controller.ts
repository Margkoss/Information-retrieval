import { Body, Controller, Delete, Get, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { ApiBody, ApiConsumes, ApiTags, ApiQuery } from '@nestjs/swagger';
import { Movie, MovieDto } from './movie.model';
import { MovieService } from './movie.service';

@ApiTags('Movies')
@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post()
  public async postMovie(@Body() movie: MovieDto) {
    return await this.movieService.postMovie(movie);
  }

  @Post('/csv')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  public async postCsvFile(@UploadedFile() file): Promise<string[]> {
    return await this.movieService.parseCsvFile(file.buffer);
  }

  @Get('/:_id')
  public async getMovie(@Param('_id') _id: string): Promise<Movie> {
    return await this.movieService.getMovie(_id);
  }

  @Get()
  @ApiQuery({ name: 'search_query', required: false })
  public async getMovies(@Query('search_query') searchQuery?: string) {
    if (!searchQuery) {
      return await this.movieService.getMovies();
    } else {
      return await this.movieService.search(searchQuery);
    }
  }

  @Delete('/all')
  public async dropDatabase() {
    await this.movieService.deleteAll();
    return {
      acknowledged: true,
    };
  }
}
