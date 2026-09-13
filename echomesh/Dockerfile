# Production Dockerfile for EchoMesh Unified Node
FROM node:20-alpine

WORKDIR /app

# Copy root dependencies
COPY package*.json ./
RUN npm install --production

# Copy frontend dependencies and build
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY . .
RUN cd frontend && npm run build

EXPOSE 4000 4001 4002 4003

CMD ["node", "start-mesh.js"]
