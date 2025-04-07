OWNER ?= ociscloud
IMAGE_NAME ?= trust-portal
VERSION ?= $(shell sed -n '2p' src/constants/Version.ts | cut -d\' -f2)
PWD := $(shell pwd)

.PHONY: release-image-public
release-image-public:
	@docker rm -f build-env
	@docker run --rm --name build-env -v $(PWD):/home/portal -w /home/portal node:18.20.6-alpine3.21 /bin/sh -c "yarn install; yarn build:public"
	@docker build -f Dockerfile-public -t $(OWNER)/$(IMAGE_NAME):user-pub-$(VERSION) .

.PHONY: release-image-private
release-image-private:
	@docker rm -f build-env
	@docker run --rm --name build-env -v $(PWD):/home/portal -w /home/portal node:18.20.6-alpine3.21 /bin/sh -c "yarn install; yarn build:private"
	@docker build -f Dockerfile-private -t $(OWNER)/$(IMAGE_NAME):user-pri-$(VERSION) .

.PHONY: run-public-container
run-public-container:
	@docker run -ti --rm \
	-p 80:80 \
	-e API_URL=https://api.trusted-cloud.nchc.org.stg \
	$(OWNER)/$(IMAGE_NAME):user-pub-$(VERSION)

.PHONY: run-private-container
run-private-container:
	@docker run -ti --rm \
	-p 80:80 \
	-e API_URL=https://api.trusted-cloud.nchc.org.stg \
	$(OWNER)/$(IMAGE_NAME):user-pri-$(VERSION)