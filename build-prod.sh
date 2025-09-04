# This file runs *after* the app is deployed on staging.
# The containers are rebuilt with the updated env variables,
# and sent off to the prod server.
# Note that actually updating prod is still manual.

# make it so if any command fails, it all goes down
set -e

# REPLACE the .env file with the prod version
# This should *not* affect existing containers! 
# Triggering a new build will swap this file back to original
echo 'Copying over the production .env file...'
cp /env/mit-clubs-prod.env .env

echo 'Rebuilding docker container...'
docker compose build

echo 'Build successful.'

echo 'Compiling images...'
docker save -o ~/images/mit-clubs-deploy-proxy.tar mit-clubs-proxy
docker save -o ~/images/mit-clubs-deploy-server.tar mit-clubs-server

echo 'Copying images to production server...'
scp ~/images/mit-clubs-deploy-proxy.tar mitclubs:~/images/
scp ~/images/mit-clubs-deploy-server.tar mitclubs:~/images/

echo 'Copying docker compose and env files...'
scp ./docker-compose-prod.yaml mitclubs:~/mit-clubs/docker-compose.yaml
scp ./.env mitclubs:~/mit-clubs/.env

echo 'Images have been copied. Now, SSH onto the prod server to run them.'

# echo 'Cleaning up after myself...'
# yes | docker image prune

echo 'DONE'
