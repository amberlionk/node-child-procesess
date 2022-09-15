FROM node:16-alpine

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
RUN chmod 755 /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY tsconfig.json src ./

RUN yarn build

USER appuser
ENTRYPOINT ["node"]
CMD ["dist/index.js"]
EXPOSE 8080
