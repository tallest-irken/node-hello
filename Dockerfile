FROM node
COPY ./* ./
ENTRYPOINT ["/usr/local/bin/node"]
CMD ["index.js"]
