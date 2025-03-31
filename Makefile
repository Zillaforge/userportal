OWNER ?= ociscloud
IMAGE_NAME ?= trust-portal
VERSION ?= $(shell sed -n '2p' src/constants/Version.ts | cut -d\' -f2)
PWD := $(shell pwd)

.PHONY: release-image-public
release-image-public: 
	@docker rm -f build-env
	@docker run --rm --name build-env -v $(PWD):/home/portal -w /home/portal node:18.20.7-slim /bin/bash -c "mkdir -p /tmp/node_modules/; ln -s /tmp/node_modules /home/portal/node_modules; yarn install; yarn build:public; rm -f /home/portal/node_modules"
	@docker build -f Dockerfile-public -t $(OWNER)/$(IMAGE_NAME):user-pub-$(VERSION) .

.PHONY: release-image-private
release-image-private: 
	@docker rm -f build-env
	@docker run --rm --name build-env -v $(PWD):/home/portal -w /home/portal node:18.20.7-slim /bin/bash -c "mkdir -p /tmp/node_modules/; ln -s /tmp/node_modules /home/portal/node_modules; yarn install; yarn build:private; rm -f /home/portal/node_modules"
	@docker build -f Dockerfile-private -t $(OWNER)/$(IMAGE_NAME):user-pri-$(VERSION) .

.PHONY: run-mockup-server
run-mockup-server:
	mockoon-cli start --data ./mockup/trust_cloud.json


renew-develop-certificate:
	@mkcert api.trusted-cloud.nchc.org.stg
	@mv api.trusted-cloud.nchc.org.stg-key.pem mockup/api.trusted-cloud.nchc.org.stg.key
	@mv api.trusted-cloud.nchc.org.stg.pem mockup/api.trusted-cloud.nchc.org.stg.crt


.PHONY: run-mockup-server-container
run-mockup-server-container:
	@yq -iP '.tlsOptions.enabled = true' mockup/trust_cloud.json -o json
	@docker run -ti --rm  \
	-v $(PWD)/mockup/:/mockup/ \
	-p 443:3000 \
	mockoon/cli:latest --data /mockup/trust_cloud.json --port 3000