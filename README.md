cd /root/github/bit-matrix/ba-api
git pull
docker build -t ba-api .
docker run -d -p 9900:9900 -v DataVolume1:/datavolume1 --network="host" ba-api

## List db files

ls /var/lib/docker/volumes/DataVolume1/

## build

docker build -t ba-api .

## run

docker run -d -p 9900:9900 -v DataVolume1:/datavolume1 --network="host" ba-api

## run interactive

docker run -it -p 9900:9900 -v DataVolume1:/datavolume1 ba-api

## run interactive, remove when stop

docker run -it --rm -p 9900:9900 -v DataVolume1:/datavolume1 ba-api

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
