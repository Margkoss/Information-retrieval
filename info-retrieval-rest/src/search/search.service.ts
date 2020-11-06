import { HttpException, Injectable, Logger } from '@nestjs/common';
import * as elasticsearch from 'elasticsearch';
import { ConfigService } from '@nestjs/config';
import { Movie } from 'src/movie/movie.model';

@Injectable()
export class SearchService {
  private readonly client: elasticsearch.Client;
  private logger: Logger;

  constructor(private readonly config: ConfigService) {
    // Initialize a logger
    this.logger = new Logger('Search Service');

    // New elastic search client
    this.client = new elasticsearch.Client({
      host: this.config.get('ELASTICSEARCH_NODE'),
    });

    this.client.ping({ requestTimeout: 3000 }).catch(err => {
      throw new HttpException(
        {
          status: 'error',
          message: 'Unable to reach Elasticsearch cluster',
        },
        500,
      );
    });
  }

  public get clientInstance(): elasticsearch.Client {
    return this.client;
  }

  public async createIndex() {
    const exists = await this.client.indices.exists({ index: this.config.get('ELASTICSEARCH_INDEX') });

    if (!exists) {
      this.client.indices.create({
        index: this.config.get('ELASTICSEARCH_INDEX'),
        body: {
          settings: {
            analysis: {
              analyzer: {
                autocomplete_analyzer: {
                  tokenizer: 'autocomplete',
                  filter: ['lowercase'],
                },
                autocomplete_search_analyzer: {
                  tokenizer: 'keyword',
                  filter: ['lowercase'],
                },
              },
              tokenizer: {
                autocomplete: {
                  type: 'edge_ngram',
                  min_gram: 1,
                  max_gram: 30,
                  token_chars: ['letter', 'digit', 'whitespace'],
                },
              },
            },
          },
          mappings: {
            properties: {
              title: {
                type: 'text',
                fields: {
                  complete: {
                    type: 'text',
                    analyzer: 'autocomplete_analyzer',
                    search_analyzer: 'autocomplete_search_analyzer',
                  },
                },
              },
              genres: { type: 'text' },
            },
          },
        },
      });
    } else {
      this.logger.warn('Index already created... Skipping ...');
    }
  }

  public async bulkImport(movies: Movie[]) {
    let body = [];
    movies.forEach(movie => {
      body.push(
        { index: { _index: this.config.get('ELASTICSEARCH_INDEX'), _id: movie._id } },
        {
          title: movie.title,
          genres: movie.genres,
        },
      );
    });

    try {
      const res = await this.client.bulk({
        index: this.config.get('ELASTICSEARCH_INDEX'),
        body,
      });
    } catch (e) {
      this.logger.error(e);
    }
  }

  public async search(query: string) {
    const body = {
      size: 12,
      query: {
        match: {
          'title.complete': {
            query,
          },
        },
      },
    };

    return (await this.client.search({ index: this.config.get('ELASTICSEARCH_INDEX'), body })).hits.hits;
  }

  public async deleteIndexData() {
    await this.client.indices.delete({ index: this.config.get('ELASTICSEARCH_INDEX') });
    await this.createIndex();
  }
}
