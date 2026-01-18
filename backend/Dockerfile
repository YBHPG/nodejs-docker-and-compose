FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund --no-progress \
	&& npm i -g pm2
COPY --from=builder /app/dist ./dist
COPY ./ecosystem.config.js ./
CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]