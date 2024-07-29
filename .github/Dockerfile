ARG PLATFORM

FROM myunisoft91/heif-converter.$PLATFORM
LABEL maintainer="Nicolas Marteau <nico_mart@hotmail.fr>"

WORKDIR heif-converter
COPY . .
RUN npm install
RUN npm run configure -- --target=v18.12.0
RUN npm run build -- --target=v18.12.0
RUN npm run test