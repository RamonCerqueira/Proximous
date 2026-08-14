# Dockerfile para o backend Proximous
FROM python:3.11-slim

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código da aplicação
COPY . .

# Criar diretório para banco de dados
RUN mkdir -p /app/data

# Expor porta
EXPOSE 5000

# Variáveis de ambiente
ENV FLASK_APP=src/main.py
ENV FLASK_ENV=production
ENV DATABASE_URL=sqlite:///data/proximous.db

# Comando para iniciar a aplicação
CMD ["python", "src/main.py"]

