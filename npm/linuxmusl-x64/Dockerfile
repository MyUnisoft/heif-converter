FROM node:16-alpine

ENV VCPKG_FORCE_SYSTEM_BINARIES 1
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

RUN git clone https://github.com/ninja-build/ninja.git /tmp/ninja \
    && cd /tmp/ninja \
    && git checkout v1.10.2 \
    && cmake -Bbuild-cmake -H. \
    && cmake --build build-cmake \
    && cp build-cmake/ninja /usr/local/bin/ninja \
    && rm -rf /tmp/ninja

RUN git clone https://github.com/microsoft/vcpkg.git && \
    ./vcpkg/bootstrap-vcpkg.sh && \
    ./vcpkg/vcpkg install libheif

WORKDIR heif-converter

COPY . .

RUN npm install -g node-gyp && \
    npm install && \
    node-gyp configure -C src && \
    node-gyp build -C src

CMD ["/bin/sh"]