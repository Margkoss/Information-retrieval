FROM node:latest As development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:latest as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

RUN chmod +x wait-for-it.sh

ENTRYPOINT [ "/bin/bash", "-c" ]

EXPOSE 3000

#Add waitforit utility that waits for service to be available

CMD ["./wait-for-it.sh elasticsearch:9200 && node dist/main"]
