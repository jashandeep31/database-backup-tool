FROM node:latest

WORKDIR /app
COPY . /app/

RUN npm install 
RUN npm run build

CMD ["npm", "start"]