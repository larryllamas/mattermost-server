# syntax=docker/dockerfile:1
ARG BASE_IMG=ubuntu:20.04
FROM $BASE_IMG

# Setting bash as our shell, and enabling pipefail option
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

ENV DEBIAN_FRONTEND noninteractive

### Install wget, curl, git, unzip, gnupg, locales
RUN apt-get update && \
	apt-get -y install \
	apt-utils \
    curl \
	ca-certificates \
	cmake \
	software-properties-common \
    git \
	gnupg \
	gnupg2 \
	g++ \
	locales  \
	locales-all \
	libc6 \
	libc-bin \
	make \
	tzdata \
	unzip \
	wget \
    && locale-gen en_US.UTF-8 && \
	apt-get clean && \
	rm -rf /var/lib/apt/lists/* && \
	rm -rf /tmp/*

ENV LANGUAGE	en_US.UTF-8
ENV LANG    	en_US.UTF-8
ENV LC_ALL  	en_US.UTF-8
ENV TZ			UTC

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone \
	ldconfig ;

### add a new group + user without root premmsions
ENV WSS_GROUP mattermost
ENV WSS_USER mattermost
ENV WSS_USER_HOME=/home/mattermost

RUN groupadd ${WSS_GROUP} && \
	useradd --gid ${WSS_GROUP} --groups 0 --shell /bin/bash --home-dir ${WSS_USER_HOME} --create-home ${WSS_USER} && \
	passwd -d ${WSS_USER} && mkdir -p /mattermost \
	&& mkdir -p /target \
	&& mkdir -p ${WSS_USER_HOME}/server \
	&& mkdir -p ${WSS_USER_HOME}/mattermost-server \
	&& chown -R mattermost:mattermost ${WSS_USER_HOME} \
	&& chown -R mattermost:mattermost  /target

# We should refrain from running as privileged user
USER ${WSS_USER}

#### Install GO:
ARG GOLANG_VERSION=1.17.5
USER ${WSS_USER}
RUN mkdir -p ${WSS_USER_HOME}/goroot && \
	curl https://storage.googleapis.com/golang/go${GOLANG_VERSION}.linux-amd64.tar.gz | tar xvzf - -C ${WSS_USER_HOME}/goroot --strip-components=1
## Set GO environment variables
ENV GOROOT ${WSS_USER_HOME}/goroot
ENV GOPATH ${WSS_USER_HOME}/gopath
ENV PATH $GOROOT/bin:$GOPATH/bin:$PATH
### Install package managers
#
RUN go install github.com/tools/godep@latest
RUN go install github.com/LK4D4/vndr@latest
RUN go install github.com/kardianos/govendor@latest
#

### Switch User ###
ENV HOME ${WSS_USER_HOME}
WORKDIR ${WSS_USER_HOME}/mattermost-server
USER ${WSS_USER}
#
# app source
# COPY ../node_modules/mattermost-server ${WSS_USER_HOME}/mattermost-server
RUN echo "PWD: $(pwd)"; ls -lah . 
RUN ls -lah /home/mattermost/ 
RUN ls -lah /home/mattermost/server 
RUN echo "Checking /target" ; ls -lah /target/ 
### Build mattermost-custom-binary ###
RUN cd /home/mattermost/mattermost-server && ls -lah . ; echo "PWD: $(pwd)" 