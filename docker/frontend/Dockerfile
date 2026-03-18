FROM node:20-alpine AS builder

ARG VITE_API_URL=/api

WORKDIR /app

COPY . .

RUN npm ci
RUN VITE_API_URL=$VITE_API_URL npm run build --workspace @metalgest/web

FROM nginx:alpine AS runner

RUN apk add --no-cache wget

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY docker/frontend/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
