# Information Retrieval - School Project

## Start the project up

---

If you have `docker` and `docker-compose` installed, in the root directory run

```bash
docker-compose up --build
```

This will start up all of the project's dependencies. Specifically:

- MongoDB database available at port `27017`
- Elasticsearch single node cluster at port `9300` and `9200`
- REST api at port `3000`. The api is documented using `swagger` at `/api-docs`
- Frontend nginx webserver that serves a frontend to the movies project at port `80`.

#### WARNING

The execution of docker-compose will be blocked if you have any of the afformentioned dependencies running locally on the specific ports. To fix this you can eiter:

- Stop all of the dependency services e.g. `sudo systemctl stop nginx`
- Change the port mappings in the `docker-compose.yml` e.g. for the rest-api

```yml
# ...
ports:
  - 3001:3000
# ...
```

### Alternatively

You can run the project in development mode witch entails:

- Install nodejs
- Install mongodb and run it as a service
- Install elasticsearch and run it as a service
- In the `info-retrieval-rest` edit the example `.env` file that configures the project
- In the `info-retrieval-rest` directory run `npm run start`
- In the `info-retrieval-frontend` directory run `npm run serve`
