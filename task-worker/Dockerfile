FROM node:22.18-alpine3.22
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 8003
CMD [ "node","dist/task-worker/src/main.js" ]