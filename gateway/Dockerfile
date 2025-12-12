FROM node:22.18-alpine3.22
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 3000
CMD [ "node","dist/gateway/src/main.js" ]