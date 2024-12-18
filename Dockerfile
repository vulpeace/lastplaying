FROM node:lts-alpine
ARG PORT
ENV PORT ${PORT?3000}
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package.json ./
USER node
RUN npm install
COPY --chown=node:node app.js .
EXPOSE $PORT
CMD [ "node", "app.js" ]
