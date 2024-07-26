ARG PLATFORM
ARG ARCH
FROM myunisoft91/heif-converter.$PLATFORM:v0.0.1
LABEL maintainer="Nicolas Marteau <nico_mart@hotmail.fr>"

WORKDIR heif-converter
COPY . .
RUN npm install
RUN npm run configure -- --arch=${ARCH:-x64}
RUN npm run build -- --arch=${ARCH:-x64}
RUN npm run test