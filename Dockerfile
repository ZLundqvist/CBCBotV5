FROM node:14.17.6-slim

RUN apt-get update -y
RUN apt-get install -y build-essential libtool autoconf python3

WORKDIR /usr/app

COPY src src
COPY package.json package.json

RUN npm install
RUN npm run build

CMD ["npm", "start"]
