FROM node:17
USER root

RUN apt-get update
RUN apt-get install -y yarn

WORKDIR /app

COPY . /app
RUN yarn
CMD ["yarn", "dev"]
