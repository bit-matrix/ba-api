# Install

mkdir /var/lib/docker/volumes/HistoryDataVolumeV2/\_data/new-pool-chart

mkdir /root/github/bit-matrix/new-pool
cd /root/github/bit-matrix/new-pool
git clone https://github.com/bit-matrix/ba-api.git
cd ba-api
git checkout -b v2
git branch --set-upstream-to=origin/v2 ba-api-v2
git pull
docker build -t ba-api-v2 .
docker run -d -p 9902:9902 -v HistoryDataVolumeV2:/historydatavolumev2 ba-api-v2

# Update

cd /root/github/bit-matrix/new-pool/ba-api
git pull
docker build -t ba-api-v2 .
docker run -d -p 9902:9902 -v HistoryDataVolumeV2:/historydatavolumev2 ba-api-v2

## List db files

ls /var/lib/docker/volumes/HistoryDataVolumeV2/

## build

docker build -t ba-api .

## run

docker run -d -v HistoryDataVolumeV2:/historydatavolumev2 --network="host" ba-api

## run interactive

docker run -it -p 9902:9902 -v HistoryDataVolumeV2:/historydatavolumev2 ba-api

## run interactive, remove when stop

docker run -it --rm -p 9902:9902 -v HistoryDataVolumeV2:/historydatavolumev2/new-pool ba-api-new

## image list

docker image ls

# Remove all images at once

docker rmi $(docker images -q)

### Container

## list active images

docker ps

## Stop all running containers

docker stop $(docker ps -a -q)

## Delete all stopped containers:

docker rm $(docker ps -a -q)

### bitmatrix-aggregate-db

DATA_DIR=/ba-api/data-dir/ node dist/app.js

## License

MIT
**Free Software, Hell Yeah!**
