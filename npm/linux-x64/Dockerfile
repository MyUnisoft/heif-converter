FROM debian:buster
USER root

RUN apt-get update && DEBIAN_FRONTEND=noninteractive
RUN apt-get install -y \
    build-essential \
    curl \
    git \
    zip \
    unzip \
    tar \
    bison \
    nasm \
    pkg-config \
    python3 \
    python3-setuptools \
    python3-mako \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs

RUN git clone https://github.com/microsoft/vcpkg.git && \
    ./vcpkg/bootstrap-vcpkg.sh && \
    ./vcpkg/vcpkg install libheif

WORKDIR heif-converter

COPY . .

RUN npm install -g node-gyp && \
    npm install && \
    node-gyp configure --directory=src && \
    node-gyp build --directory=src

CMD ["/bin/bash"]