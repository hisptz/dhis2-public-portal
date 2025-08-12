FROM node:20

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

# Set working directory to the service itself
WORKDIR /app/services/data-service

# Copy only the package files first for caching
COPY services/data-service/package.json services/data-service/bun.lockb ./

# Install dependencies with Bun
RUN bun install

# Copy the rest of the monorepo
WORKDIR /app
COPY . .

# Set working dir back to the service for running
WORKDIR /app/services/data-service

EXPOSE 4002

# Start the service using Bun
CMD ["bun", "run", "dev"]
