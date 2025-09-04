FROM node:latest AS build

WORKDIR /usr/local/app

COPY ./package*.json ./

RUN npm install

COPY *.config.* .
COPY ./.env .env

COPY ./client/src ./client/src
# COPY ./client/public ./client/public
COPY ./client/index.html ./client/index.html
COPY ./client/favicon.png ./client/favicon.png

RUN npm run build

# Stage 2: prod
FROM nginx:latest

WORKDIR /usr/local/app

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/local/app/client/dist /static

EXPOSE 1250


