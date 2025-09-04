# Stage 1: compile typescript
FROM node:latest AS build

WORKDIR /usr/local/app

COPY ./package*.json ./

RUN npm install

COPY *.config.js .

COPY ./server/src ./server/src
COPY ./server/tsconfig.json ./server/tsconfig.json

# CMD ["npm", "run", "compile"]
RUN npm run compile

# Stage 2: prod
FROM node:latest 

WORKDIR /usr/local/app

COPY package*.json ./

RUN npm install --production

COPY --from=build /usr/local/app/server/dist/src ./server

EXPOSE 1251

CMD ["node", "server/server.js"]

# todo: make this not broken
HEALTHCHECK --timeout=2s --retries=3 --interval=5m CMD curl --fail http://localhost:1251 || exit 1
