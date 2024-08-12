FROM node:18-alpine
LABEL maintainer="Nicolas Marteau <nico_mart@hotmail.fr>"

RUN apk update
RUN apk --no-cache add build-base make py3-setuptools

WORKDIR /heif-converter

COPY . .

RUN npm install --omit-optional
RUN npm run configure
RUN npm run build
RUN npm run test