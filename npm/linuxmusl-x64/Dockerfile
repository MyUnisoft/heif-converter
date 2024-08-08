FROM node:18-alpine
LABEL maintainer="Nicolas Marteau <nico_mart@hotmail.fr>"

RUN apk --no-cache add \
    g++ \
    gcc \
    git \
    zip \
    tar \
    wget \
    nasm \
    cmake \
    make \
    unzip \
    bison \
    libgcc \
    libstdc++ \
    gettext-dev \
    glib-dev \
    bash \
    py3-setuptools \
    linux-headers \
    build-base \
    curl && \
    ln -sf python3 /usr/bin/python

WORKDIR /heif-converter

COPY . .

RUN npm install
RUN npm run configure
RUN npm run build
RUN npm run test