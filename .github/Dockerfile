ARG PLATFORM

FROM myunisoft91/heif-converter.$PLATFORM:v0.0.1
LABEL maintainer="Nicolas Marteau <nico_mart@hotmail.fr>"

WORKDIR heif-converter
COPY . .
RUN npm install
RUN npm run configure
RUN npm run build
RUN npm run test