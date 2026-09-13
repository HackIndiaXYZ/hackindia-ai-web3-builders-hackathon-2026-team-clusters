# Production Dockerfile for EchoMesh Unified Node (Root Level for Render / Cloud)
FROM node:20-alpine

WORKDIR /app

# Copy root dependencies
COPY echomesh/package*.json ./
RUN npm install --production

# Copy frontend dependencies and build
COPY echomesh/frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copy full source and build frontend
COPY echomesh/ .
RUN cd frontend && npm run build

EXPOSE 4000 4001 4002 4003

ENV PORT=4000
CMD ["node", "start-mesh.js"]
