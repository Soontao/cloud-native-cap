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
ENV TZ UTC
# exit after deploy
ENV EXIT true 
WORKDIR /app
RUN npm i -g npm@7
COPY --from=build /app/gen/db/package.json /app/
RUN npm install --production
COPY --from=build /app/gen/db /app

CMD ["npm", "run", "start"]

