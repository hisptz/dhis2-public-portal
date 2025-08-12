FROM node:18

WORKDIR /app/services/data-service

COPY package.json yarn.lock /app/

WORKDIR /app
RUN yarn install --production

COPY . /app

EXPOSE 4002

CMD ["yarn", "workspace", "data-service", "dev"]