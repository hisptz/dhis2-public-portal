FROM oven/bun:1

WORKDIR /app

COPY package*.json bun.lockb* ./

RUN bun install --production

COPY . .

EXPOSE 4002


CMD ["bun", "run", "src/app.ts"]
