# Etapa 1: Build do React
FROM node:18 AS build
WORKDIR /app

# Copiar arquivos de dependência e instalar
COPY package*.json ./
RUN npm install

# Copiar todo o projeto e gerar o build
COPY . .
RUN npm run build

# Etapa 2: Servir com Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copiar os arquivos buildados do React
COPY --from=build /app/build /usr/share/nginx/html

# Copiar a configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run exige que o container escute na porta 8080
EXPOSE 8080

# Rodar o Nginx em foreground
CMD ["nginx", "-g", "daemon off;"]
