# Start with a Node.js base image for the frontend
FROM node:20 AS frontend-builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the frontend code
COPY src/ src/
COPY public/ public/
COPY tsconfig.json ./

# Build the React app
RUN npm run build

# Start with a Go base image for the backend
FROM golang:1.22 AS backend-builder

# Set working directory
WORKDIR /app

# Copy go.mod and go.sum
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the rest of the backend code
COPY cmd/ cmd/

# Build the Go application
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/main.go

# Final stage
FROM alpine:3.14

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates

# Set working directory
WORKDIR /root/

# Copy the built frontend from the frontend-builder stage
COPY --from=frontend-builder /app/build ./frontend

# Copy the built backend from the backend-builder stage
COPY --from=backend-builder /app/main .

# Expose the port the app runs on
EXPOSE 8080

# Set a default value for PROXY_URL
ENV PROXY_URL=http://localhost:8081

# Command to run the application
CMD ./main -port 8080 -dir frontend -proxy $PROXY_URL