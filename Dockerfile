FROM node:16.17.0

WORKDIR /usr/app

ENV JOBS=MAX

COPY package.json package-lock.json ./
RUN npm ci

COPY src src
COPY tsconfig.json ./
RUN npm run build
RUN npm prune --production

COPY resources/img/ ./resources/img/
COPY resources/sfx/ ./resources/sfx/

CMD ["npm", "start"]
