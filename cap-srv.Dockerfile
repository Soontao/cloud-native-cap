FROM node:14 as build

WORKDIR /app
RUN npm i -g npm@7
COPY package.json package-lock.json /app/
RUN npm install
COPY . /app/
RUN npm run build


FROM node:14-alpine
LABEL maintainer="Theo Sun"
ENV NODE_ENV production
ENV PORT 8080
ENV TZ UTC
WORKDIR /app
RUN npm i -g npm@7
COPY package.json package-lock.json /app/
RUN npm install --production
COPY --from=build /app/gen/srv /app
EXPOSE 8080

CMD ["npm", "run", "start"]

