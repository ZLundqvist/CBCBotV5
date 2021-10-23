FROM node:16.12.0

RUN apt-get update -y
RUN apt-get install -y --no-install-recommends apt-utils
RUN apt-get install -y --no-install-recommends build-essential libtool autoconf python3 git

WORKDIR /usr/app

COPY tsconfig.json tsconfig.json
COPY package.json package.json
COPY package-lock.json package-lock.json

RUN JOBS=MAX npm ci

COPY src src
RUN npm run build
RUN npm prune --production

CMD ["node", "dist/main.js"]
