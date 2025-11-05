# Gebruik Node.js 20 LTS (Alpine voor kleinere image)
FROM node:20-alpine

# Installeer FFmpeg voor Discord audio ondersteuning
RUN apk add --no-cache ffmpeg

# Maak app directory
WORKDIR /app

# Kopieer package files
COPY package*.json ./

# Installeer dependencies (production only voor kleinere image)
RUN npm ci --only=production

# Kopieer applicatie code
COPY . .

# Maak uploads directories aan met juiste permissions
RUN mkdir -p public/upload/audio public/upload/image && \
    chown -R node:node /app

# Switch naar non-root user voor security
USER node

# Expose poort (configureerbaar via docker-compose)
EXPOSE 3030

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3030) + '/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start applicatie
CMD ["npm", "start"]