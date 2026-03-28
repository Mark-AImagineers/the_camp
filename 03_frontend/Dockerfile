FROM 10.43.68.80:5050/aimagineers/the_camp/node:20-alpine AS build

WORKDIR /app

ARG VITE_API_URL

ENV VITE_API_URL=$VITE_API_URL

COPY 03_frontend/package*.json ./
RUN rm -f package-lock.json && npm install

COPY 03_frontend/ .
RUN npm run build

FROM 10.43.68.80:5050/aimagineers/the_camp/nginx:1-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY 03_frontend/nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 3000

ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/conf.d

CMD ["nginx", "-g", "daemon off;"]
