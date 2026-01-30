FROM ubuntu:22.04

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    gnupg \
    openjdk-17-jdk \
    maven \
    nginx \
    mysql-server \
    supervisor \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && node -v \
    && npm -v

WORKDIR /app

# Copy application code
COPY backend ./backend
COPY frontend-react ./frontend

# Copy configurations
COPY nginx.conf /etc/nginx/sites-enabled/default
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY init.sql /app/init.sql

# Build Backend
WORKDIR /app/backend
RUN mvn clean package -DskipTests
RUN mkdir -p /app/backend && cp target/*.jar /app/backend/app.jar

# Build Frontend
WORKDIR /app/frontend
# Explicitly use npm ci to be safe, or install if package-lock is missing
RUN npm install
RUN npm run build

# Setup Frontend for Nginx
RUN mkdir -p /var/www/medibook-frontend \
    && cp -r /app/frontend/dist/* /var/www/medibook-frontend

# Expose ports
# 80: Nginx (Frontend)
# 8090: Backend (Spring Boot)
# 3306: MySQL
EXPOSE 80 8090 3306

# Start Supervisor
CMD ["/usr/bin/supervisord"]
