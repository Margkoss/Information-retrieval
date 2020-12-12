import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Rating, RatingDto } from './ratings.model';
import { RatingsService } from './ratings.service';

@ApiTags('Ratings')
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

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
  public async postCsvFile(@UploadedFile() file): Promise<any> {
    return await this.ratingsService.parseCsvFile(file.buffer);
  }

  @Get('/:_id')
  public async getRating(@Param('_id') _id: string): Promise<Rating> {
    return await this.ratingsService.getRating(_id);
  }

  @Get('/user/:userId')
  public async getRatingsByUser(@Param('userId') userId: string): Promise<Rating[]> {
    return await this.ratingsService.getRatingsByUser(userId);
  }

  @Get('/movie/:movieId')
  public async getRatingsByMovie(@Param('movieId') movieId: string): Promise<Rating[]> {
    return await this.ratingsService.getRatingsByMovie(movieId);
  }

  @Post()
  public async postRating(@Body() rating: RatingDto) {
    return await this.ratingsService.postRating(rating);
  }
}
