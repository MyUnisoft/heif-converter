FROM node:18-buster
LABEL maintainer="Nicolas Marteau <nico_mart@hotmail.fr>"

RUN apt-get update && \
    apt-get install -y \
    build-essential \
    python3 \
    python3-setuptools \
    python3-mako \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /heif-converter

COPY . .

RUN npm install
RUN npm run configure
RUN npm run build
RUN npm run test