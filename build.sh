# This file exists for the Jenkins CI/CD.
# To run locally, just do docker compose build.

# echo 'Pulling updates...'
# git pull

# make it so if any command fails, it all goes down
set -e

echo 'Copying over the .env file...'
cp /env/mit-clubs.env .env

echo 'Building docker container...'
docker compose build

echo 'Build successful.'
