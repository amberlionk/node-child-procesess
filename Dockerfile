FROM node:16-alpine

WORKDIR /app
COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .

RUN yarn install

COPY src .

RUN yarn build

CMD ["node", "dist/index.js"]
EXPOSE 8080
