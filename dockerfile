FROM node:16-alpine

# update packages
RUN apk update


# Install Rocksdb - step 1
RUN echo "@testing http://nl.alpinelinux.org/alpine/edge/testing" >>/etc/apk/repositories
RUN apk add --update --no-cache build-base linux-headers git cmake bash perl #wget mercurial g++ autoconf libgflags-dev cmake bash
RUN apk add --update --no-cache zlib zlib-dev bzip2 bzip2-dev snappy snappy-dev lz4 lz4-dev zstd@testing zstd-dev@testing libtbb-dev@testing libtbb@testing
RUN apk add --update --no-cache g++ make python3

# Install Rocksdb - step 2
# installing latest gflags
RUN cd /tmp && \
    git clone https://github.com/gflags/gflags.git && \
    cd gflags && \
    mkdir build && \
    cd build && \
    cmake -DBUILD_SHARED_LIBS=1 -DGFLAGS_INSTALL_SHARED_LIBS=1 .. && \
    make install && \
    cd /tmp && \
    rm -R /tmp/gflags/

# Install Rocksdb - step 3
# Install Rocksdb
RUN cd /tmp && \
    git clone https://github.com/facebook/rocksdb.git && \
    cd rocksdb && \
    git checkout v6.10.2 && \
    make shared_lib && \
    mkdir -p /usr/local/rocksdb/lib && \
    mkdir /usr/local/rocksdb/include && \
    cp librocksdb.so* /usr/local/rocksdb/lib && \
    cp /usr/local/rocksdb/lib/librocksdb.so* /usr/lib/ && \
    cp -r include /usr/local/rocksdb/ && \
    cp -r include/* /usr/include/ && \
    rm -R /tmp/rocksdb/


# create root application folder
WORKDIR /ba-api
RUN mkdir /ba-api/data-dir

# copy configs to /ba-api folder
COPY package*.json ./
COPY tsconfig.json ./
COPY babel.config.js ./

# copy source code to /ba-api/src folder
COPY src ./src

# check files list
RUN ls -a
   
RUN npm install
RUN npm run build

EXPOSE 9901

CMD ["npm", "start"]
