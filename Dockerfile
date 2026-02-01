# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
# Copy package files first to leverage cache
COPY frontend-react/package*.json ./
RUN npm ci
# Copy source
COPY frontend-react/ .
RUN npm run build

# Stage 2: Build Backend
FROM maven:3.9.6-eclipse-temurin-17-alpine AS backend-build
WORKDIR /app/backend
# Copy pom.xml and download dependencies
COPY backend/pom.xml .
# Go offline to cache dependencies
RUN mvn dependency:go-offline -B
# Copy source
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Stage 3: Runtime
FROM alpine:3.19

# Install runtime dependencies
# openjdk17-jre: for backend
# nginx: for frontend
# mariadb, mariadb-client: for database
# supervisor: for process management
# bash: for scripts
RUN apk add --no-cache \
    openjdk17-jre \
    nginx \
    mariadb \
    mariadb-client \
    supervisor \
    bash \
    curl

# Setup directories
WORKDIR /app
RUN mkdir -p /var/www/medibook-frontend \
    && mkdir -p /run/mysqld \
    && mkdir -p /run/nginx \
    && mkdir -p /var/lib/mysql \
    && chown -R mysql:mysql /run/mysqld \
    && chown -R nginx:nginx /run/nginx \
    && chown -R mysql:mysql /var/lib/mysql

# Copy Frontend Artifacts
COPY --from=frontend-build /app/frontend/dist /var/www/medibook-frontend

# Copy Backend Artifacts
COPY --from=backend-build /app/backend/target/*.jar /app/backend/app.jar

# Copy Configurations
COPY nginx.conf /etc/nginx/http.d/default.conf
COPY supervisord.conf /etc/supervisord.conf
COPY init.sql /app/init.sql

# Initialize MariaDB Data Directory (needed for Alpine)
RUN mysql_install_db --user=mysql --datadir=/var/lib/mysql

# Expose ports
EXPOSE 80 8090 3306

# Start Supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
