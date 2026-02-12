# Build stage 
FROM golang:alpine AS builder 

WORKDIR /app 

# Install build tools 
RUN apk add --no-cache git 

# Copy go.mod and go.sum first (better caching) 
COPY go.mod go.sum ./ 
RUN go mod download 

# Copy the rest of the source 
COPY . . 

RUN go build -o server ./cmd/server

RUN go build -o seed ./cmd/seed

# Runtime stage 
FROM alpine:3.19 

WORKDIR /app

COPY --from=builder /app/server .
COPY --from=builder /app/seed .

COPY data data

# Expose your API port 
EXPOSE 8880 

CMD [".server"]

