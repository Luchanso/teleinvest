FROM node:alpine

RUN apk update && apk add yarn

WORKDIR /teleinvest

COPY package.json /teleinvest
COPY yarn.lock /teleinvest
COPY src /teleinvest/src
COPY .babelrc /teleinvest

RUN yarn && yarn build

CMD ["yarn", "start"]
