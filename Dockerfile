FROM node
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3210
CMD npm start