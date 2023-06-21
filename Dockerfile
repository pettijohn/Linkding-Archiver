FROM zenika/alpine-chrome:with-node

ENV PUPPETEER_SKIP_DOWNLOAD 1
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser
WORKDIR /code
# Dockerfile template https://github.com/Zenika/alpine-chrome/blob/master/with-puppeteer/Dockerfile 

# COPY --chown=chrome package.json package-lock.json ./
# RUN npm install
# COPY --chown=chrome . ./
# ENTRYPOINT ["tini", "--"]
# CMD ["node", "/usr/src/app/src/pdf"]

ENTRYPOINT [ "sh" ]

