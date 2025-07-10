OWNER ?= ociscloud
IMAGE_NAME ?= trust-portal
VERSION ?= $(shell sed -n '2p' src/constants/Version.ts | cut -d\' -f2)
PWD := $(shell pwd)
CPU_ARCH ?= $(shell uname -m)

IS_DIRTY := $(shell git diff-index --quiet HEAD ':!.env.*' ':!Makefile'  || echo "-dirty")
TAG_OR_COMMIT := $(shell git describe --contains `git rev-parse --short HEAD` 1>&2 2> /dev/null || git rev-parse --short HEAD)

sed = sed
ifeq ("$(shell uname -s)", "Darwin")	# BSD sed, like MacOS
	sed += -i ''
else	# GNU sed, like LinuxOS
	sed += -i''
endif

.PHONY: set-version
set-version:
	@echo "Patching version from $(VERSION) to ${TAG_OR_COMMIT}${IS_DIRTY}"
	@$(sed) "s/${VERSION}/${TAG_OR_COMMIT}${IS_DIRTY}/g" src/constants/Version.ts

.PHONY: release-image-public
release-image-public: set-version
	@docker build \
	--platform linux/$(CPU_ARCH) \
	--build-arg MODE=public \
	-t $(OWNER)/$(IMAGE_NAME):user-pub-${TAG_OR_COMMIT}${IS_DIRTY} -f Dockerfile .
	@git checkout src/constants/Version.ts

.PHONY: release-image-private
release-image-private: set-version
	@docker build \
	--platform linux/$(CPU_ARCH) \
	--build-arg MODE=private \
	-t $(OWNER)/$(IMAGE_NAME):user-pri-${TAG_OR_COMMIT}${IS_DIRTY} -f Dockerfile .
	@git checkout src/constants/Version.ts

.PHONY: run-public-container
run-public-container:
	@docker run -d --rm \
	-p 9999:80 \
	-e API_URL=http://api.127-0-0-1.nip.io:7777 \
	-e ADMIN_PANEL=http://admin.127-0-0-1.nip.io:8888 \
	-e DATA_STORAGE=http://api.127-0-0-1.nip.io:7777 \
	--name user-portal-pub \
	$(OWNER)/$(IMAGE_NAME):user-pub-${TAG_OR_COMMIT}${IS_DIRTY}
	@docker exec user-portal-pub sh -c "sed -i '/Content-Security-Policy/d' /etc/nginx/nginx.conf"
	@docker exec user-portal-pub sh -c "nginx -s reload"

.PHONY: run-private-container
run-private-container:
	@docker run -d --rm \
	-p 9999:80 \
	-e API_URL=http://api.127-0-0-1.nip.io:7777 \
	-e ADMIN_PANEL=http://admin.127-0-0-1.nip.io:8888 \
	$(OWNER)/$(IMAGE_NAME):user-pri-${TAG_OR_COMMIT}${IS_DIRTY} \
	--name user-portal-pri \
	@docker exec user-portal-pri sh -c "sed -i '/Content-Security-Policy/d' /etc/nginx/nginx.conf"
	@docker exec user-portal-pri sh -c "nginx -s reload"
