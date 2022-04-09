FROM node:17
USER root

RUN apt-get update
RUN apt-get install -y yarn

WORKDIR /app

COPY . /app
RUN yarn
RUN yarn build
ENV CHAIN_ID=${CHAIN_ID}
CMD ["yarn", "start:docker"]
