# DigitalTide - Production Dockerfile for Google Cloud Run

# Use official Node.js 20 Alpine image (small and secure)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
# Use ci for faster, more reliable installs in production
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/
COPY database/ ./database/

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port 8080 (required by Cloud Run)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "src/index.js"]
