# syntax = docker/dockerfile:1.3
FROM hub.saobang.vn/nextpay-common/node:18.17-alpine3.18
RUN mkdir /app
WORKDIR /app

COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .

RUN npm run build && npm prune --production

RUN rm -rf src

ENV NODE_ENV=production

#CMD ["npm", "start"]
CMD ["node","--es-module-specifier-resolution=node", "./dist/index.js"]