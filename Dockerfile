FROM nginx
# ADD rewrite-portalConfig.sh /docker-entrypoint.d
# RUN /bin/bash -c 'chmod +x /docker-entrypoint.d/rewrite-portalConfig.sh'
ADD dist /usr/share/nginx/html
ADD nginx.conf /etc/nginx/nginx.conf
