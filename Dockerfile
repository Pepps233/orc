FROM node:22-slim
RUN apt-get update && apt-get install -y python3 python3-pip git curl jq && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY src/agent/ /app/
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
