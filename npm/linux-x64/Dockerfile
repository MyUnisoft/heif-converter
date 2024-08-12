FROM node:18-buster
LABEL maintainer="Nicolas Marteau <nico_mart@hotmail.fr>"

RUN apt-get update
RUN apt-get install -y build-essential python3-setuptools
RUN rm -rf /var/lib/apt/lists/*

WORKDIR /heif-converter

COPY . .

RUN npm install --omit-optional
RUN npm run configure
RUN npm run build
RUN npm run test