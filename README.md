# Install

mkdir /var/lib/docker/volumes/DataVolume1/\_data/new-pool-chart

mkdir /root/github/bit-matrix/new-pool
cd /root/github/bit-matrix/new-pool
git clone https://github.com/bit-matrix/ba-api.git
cd ba-api
git checkout -b new-pool
git branch --set-upstream-to=origin/new-pool new-pool
git pull
docker build -t ba-api-new .
docker run -d -p 9901:9901 -v HistoryDataVolume:/historydatavolume ba-api-new

# Update

cd /root/github/bit-matrix/new-pool/ba-api
git pull
docker build -t ba-api-new .
docker run -d -p 9901:9901 -v DataVolume1:/datavolume1 --network="host" ba-api-new

## List db files

ls /var/lib/docker/volumes/DataVolume1/

## build

docker build -t ba-api .

## run

docker run -d -v DataVolume1:/datavolume1 --network="host" ba-api

## run interactive

docker run -it -p 9901:9901 -v DataVolume1:/datavolume1 ba-api

## run interactive, remove when stop

docker run -it --rm -p 9901:9901 -v DataVolume1:/datavolume1/new-pool ba-api-new

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
