FROM alpine
LABEL maintainer="Nicolas Marteau <nico_mart@hotmail.fr>"

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

WORKDIR /heif-converter
COPY . .

RUN git clone https://github.com/ninja-build/ninja.git /tmp/ninja \
    && cd /tmp/ninja \
    && git checkout v1.10.2 \
    && cmake -Bbuild-cmake -H. \
    && cmake --build build-cmake \
    && cp build-cmake/ninja /usr/local/bin/ninja \
    && rm -rf /tmp/ninja

RUN git clone https://github.com/microsoft/vcpkg.git && \
    ./vcpkg/bootstrap-vcpkg.sh && \
    ./vcpkg/vcpkg install