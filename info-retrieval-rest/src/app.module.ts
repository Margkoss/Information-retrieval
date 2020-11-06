import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { AppController } from './app.controller';
import { MovieModule } from './movie/movie.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGO_CONNECTION_URI'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    MovieModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
