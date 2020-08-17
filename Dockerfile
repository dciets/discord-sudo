FROM node:erbium AS build

RUN mkdir /app && chown node:node /app
WORKDIR /app
USER node

COPY --chown=node:node . /app

RUN npm i
RUN npm run build

FROM node:erbium

ENV NODE_ENV production

RUN mkdir /app && chown node:node /app
WORKDIR /app
USER node

COPY --chown=node:node --from=build /app/out /app

RUN npm i

ENTRYPOINT [ "node", "/app/index.js" ]