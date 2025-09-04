# This file exists for Jenkins CI/CD.
# It assumes that the app is deployed on the same server,
# which may change in the future.

set -e

echo "Shutting down existing containers..." 
docker compose down

echo "Starting new deployment..."
docker compose up -d

echo "Done!"

