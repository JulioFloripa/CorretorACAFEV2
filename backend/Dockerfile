FROM python:3.11-slim

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libffi-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Definir diretório de trabalho
WORKDIR /app

# Copiar requirements primeiro (cache Docker)
COPY requirements.txt .

# Instalar dependências Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código da aplicação
COPY . .

# Copiar explicitamente a pasta static (mesmo que já venha acima, é garantido)
COPY static ./static

# Expor porta
EXPOSE 8080

# Comando para executar
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
