FROM node:alpine

RUN apk update && apk add yarn

WORKDIR /teleinvest

COPY package.json /teleinvest
COPY yarn.lock /teleinvest

RUN yarn && yarn build

COPY . /teleinvest

CMD ["yarn", "start"]
