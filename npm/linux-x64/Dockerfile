FROM centos/devtoolset-7-toolchain-centos7:7
USER 0

RUN curl -fsSL https://rpm.nodesource.com/setup_16.x | bash - && \
    yum install -y make nodejs zip unzip tar wget bison zlib-devel libffi-devel nasm && \
    sed -i 's/#!\/usr\/bin\/python/#!\/usr\/bin\/python2/' /usr/bin/yum && \
    sed -i 's/#! \/usr\/bin\/python/#! \/usr\/bin\/python2/' /usr/libexec/urlgrabber-ext-down && \
    ln -sf python3 /usr/bin/python && \
    yum clean all && \
    rm -rf /var/cache/yum

RUN wget https://opensource.wandisco.com/centos/7/git/x86_64/wandisco-git-release-7-2.noarch.rpm && \
    yum -y install wandisco-git-release-7-2.noarch.rpm && \
    yum -y install git

RUN wget https://www.python.org/ftp/python/3.7.0/Python-3.7.0.tgz && \
    tar xzf Python-3.7.0.tgz && \
    cd Python-3.7.0 && \
    ./configure && \
    make && \
    make install && \
    cd .. && \
    rm -rf Python-3.7.0 Python-3.7.0.tgz

ENV HOME /home/node
ENV NO_UPDATE_NOTIFIER true
ENV npm_config_update_notifier false

RUN git clone https://github.com/microsoft/vcpkg.git && \
    ./vcpkg/bootstrap-vcpkg.sh && \
    ./vcpkg/vcpkg install libheif

WORKDIR heif-converter

COPY . .

RUN npm install -g node-gyp && \
    npm install && \
    node-gyp configure --directory=src
    node-gyp build --directory=src

CMD ["/bin/bash"]