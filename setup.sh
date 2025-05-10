#!/bin/bash

mkdir -p ssl

if [ -f /etc/nginx/beaverclubs.crt ] && [ -f /etc/nginx/beaverclubs.key ]; then
    echo "Found existing SSL certificates, copying them..."
    cp /etc/nginx/beaverclubs.crt ssl/
    cp /etc/nginx/beaverclubs.key ssl/
else
    echo "WARNING: SSL certificates not found at /etc/nginx/"
    echo "Please place your SSL certificate files in the ./ssl directory:"
    echo "  - ssl/beaverclubs.crt"
    echo "  - ssl/beaverclubs.key"
fi

if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    echo "You can install it with:"
    echo "  sudo apt-get update"
    echo "  sudo apt-get install docker.io"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    echo "You can install it with:"
    echo "  sudo apt-get install docker-compose"
    exit 1
fi

echo "Setup complete! You can now run:"
echo "  sudo docker-compose up -d"
echo "to start your application." 