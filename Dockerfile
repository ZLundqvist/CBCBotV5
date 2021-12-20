FROM node:16.13.0

WORKDIR /usr/app

ENV JOBS=MAX

COPY tsconfig.json package.json package-lock.json ./
COPY resources/img/ ./resources/img/
COPY resources/sfx/ ./resources/sfx/

RUN npm ci

COPY src src
RUN npm run build
RUN npm prune --production

CMD ["npm", "start"]
