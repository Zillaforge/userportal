OWNER ?= ociscloud
IMAGE_NAME ?= trust-portal
VERSION ?= $(shell sed -n '2p' src/constants/Version.ts | cut -d\' -f2)
PWD := $(shell pwd)
CPU_ARCH ?= $(shell uname -m)

.PHONY: release-image-public
release-image-public:
	@docker build \
	--platform linux/$(CPU_ARCH) \
	--build-arg MODE=public \ 
	-t $(OWNER)/$(IMAGE_NAME):user-pub-$(VERSION) -f Dockerfile .

.PHONY: release-image-private
release-image-private:
	@docker build \
	--platform linux/$(CPU_ARCH) \
	--build-arg MODE=private \
	-t $(OWNER)/$(IMAGE_NAME):user-pri-$(VERSION) -f Dockerfile .

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