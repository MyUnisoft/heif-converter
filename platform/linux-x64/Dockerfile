FROM debian:buster
LABEL maintainer="Nicolas Marteau <nico_mart@hotmail.fr>"
USER root

RUN apt-get update && \
    apt-get install -y \
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

RUN git clone https://github.com/microsoft/vcpkg.git && \
    ./vcpkg/bootstrap-vcpkg.sh && \
    ./vcpkg/vcpkg install libheif