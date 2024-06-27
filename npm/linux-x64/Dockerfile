FROM dockcross/linux-x64
ENV PLATFORM=x64-linux

RUN apt-get update && apt-get install -y \
    zip \
    unzip \
    tar \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g node-gyp

WORKDIR ../..

RUN git clone https://github.com/microsoft/vcpkg.git && \
    ./vcpkg/bootstrap-vcpkg.sh && \
    ./vcpkg/vcpkg install libheif

WORKDIR heif-converter

COPY . .

RUN npm install && \
    node-gyp configure --directory=src && \
    node-gyp build --directory=src

CMD ["/bin/bash"]