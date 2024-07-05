ARG PLATFORM
ARG LIBHEIF_V
FROM myunisoft91/heif-converter.$PLATFORM:$LIBHEIF_V
LABEL maintainer="Nicolas Marteau <nico_mart@hotmail.fr>"

WORKDIR heif-converter
COPY . .
RUN npm install && \
    npm run build && \
    npm run test