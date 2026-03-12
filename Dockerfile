# Stage 1: Build React frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source and shared types
COPY frontend/ ./
COPY shared/ ../shared/

# Build React application
RUN npm run build

# Stage 2: Setup Deno backend
FROM denoland/deno:latest

WORKDIR /app

# Copy backend source
COPY backend/ ./backend/
COPY shared/ ./shared/
COPY deno.json ./

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist/

# Expose port
EXPOSE 3001

# Set environment variables
ENV DENO_ENV=production

# Cache backend dependencies
RUN cd backend && deno cache main.ts

# Run the application
WORKDIR /app/backend
CMD ["deno", "task", "start"]
