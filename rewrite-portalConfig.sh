#!/bin/bash
echo -e "{
  \"API_URL\": \"${API_URL}\", \
  \"BASE_DOMAIN\": \"${BASE_DOMAIN}\", \
  \"DATA_STORAGE\": \"${DATA_STORAGE}\", \
  \"DATA_EXCHANGE\": \"${DATA_EXCHANGE}\", \
  \"DATA_RELEASE\": \"${DATA_RELEASE}\", \
  \"IMAGE_REGISTRY\": \"${IMAGE_REGISTRY}\", \
  \"DOCUMENT_URL\": \"${DOCUMENT_URL}\", \
  \"ADMIN_PANEL\": \"${ADMIN_PANEL}\"\n}" \
> /usr/share/nginx/html/portalConfig.json
