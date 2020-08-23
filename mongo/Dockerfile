FROM ubuntu:20.04 AS build

RUN apt-get update
RUN apt install -y \
    git \
    python3-dev python3 python3-venv python3-pip \
    build-essential libcurl4-gnutls-dev libssl-dev lzma-dev

RUN git clone --depth=1 https://github.com/mongodb/mongo /app
WORKDIR /app

ENV VIRTUAL_ENV=/app/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

RUN pip install -r etc/pip/compile-requirements.txt

RUN python3 buildscripts/scons.py \
    DESTDIR=/opt/mongo \
    MONGO_VERSION=4.9.9-$(arch) \
    --disable-warnings-as-errors \
    install-mongod