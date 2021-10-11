FROM node:16.10.0

RUN apt-get update -y
RUN apt-get install -y --no-install-recommends apt-utils
RUN apt-get install -y --no-install-recommends build-essential libtool autoconf python3 git

WORKDIR /usr/app

COPY src src
COPY tsconfig.json tsconfig.json
COPY package.json package.json

RUN npm install
RUN npm run build
RUN npm prune --production

CMD ["npm", "start"]
