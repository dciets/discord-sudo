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
COPY --chown=node:node --from=build /app/node_modules /app/node_modules

RUN npm prune

ENTRYPOINT [ "node", "/app/index.js" ]