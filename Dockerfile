FROM node:latest

# Add PostgreSQL repository
RUN echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list

# Import repository signing key
RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -

# Update package lists
RUN apt-get  update -y

# Install PostgreSQL
RUN apt-get -y install postgresql

WORKDIR /app
COPY . /app

RUN apt-get update 


RUN npm install
RUN npm run build
RUN npm start