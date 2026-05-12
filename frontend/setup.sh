#!/bin/bash

# ============================================
# Script de Setup e Teste - Conexxa Platform
# ============================================

echo "🚀 Iniciando setup da plataforma Conexxa..."
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar Node.js
echo -e "${BLUE}1. Verificando Node.js...${NC}"
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓ Node.js $(node -v) encontrado${NC}"
else
    echo -e "${RED}✗ Node.js não encontrado${NC}"
    echo "Instale Node.js de https://nodejs.org"
    exit 1
fi

echo ""

# Verificar npm
echo -e "${BLUE}2. Verificando npm...${NC}"
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✓ npm $(npm -v) encontrado${NC}"
else
    echo -e "${RED}✗ npm não encontrado${NC}"
    exit 1
fi

echo ""

# Instalar dependências
echo -e "${BLUE}3. Instalando dependências...${NC}"
if [ -d "backend" ]; then
    cd backend
    if [ -f "package.json" ]; then
        npm install
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Dependências instaladas${NC}"
        else
            echo -e "${RED}✗ Erro ao instalar dependências${NC}"
            exit 1
        fi
    fi
    cd ..
else
    echo -e "${YELLOW}⚠ Diretório backend não encontrado${NC}"
fi

echo ""

# Criar arquivo .env
echo -e "${BLUE}4. Configurando variáveis de ambiente...${NC}"
if [ ! -f ".env" ]; then
    echo "PORT=3000" > .env
    echo "JWT_SECRET=conexxa-secret-key-desenvolvimento" >> .env
    echo "NODE_ENV=development" >> .env
    echo -e "${GREEN}✓ Arquivo .env criado${NC}"
else
    echo -e "${YELLOW}⚠ Arquivo .env já existe${NC}"
fi

echo ""

# Inicializar banco de dados
echo -e "${BLUE}5. Inicializando banco de dados...${NC}"
if [ -d "database" ]; then
    echo -e "${GREEN}✓ Diretório database existe${NC}"
else
    mkdir -p database
    echo -e "${GREEN}✓ Diretório database criado${NC}"
fi

echo ""

# Resumo
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ Setup concluído com sucesso!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

echo -e "${BLUE}Próximas etapas:${NC}"
echo ""
echo -e "${YELLOW}Terminal 1 - Backend:${NC}"
echo "  cd backend"
echo "  npm start"
echo ""
echo -e "${YELLOW}Terminal 2 - Frontend:${NC}"
echo "  cd frontend"
echo "  python -m http.server 8000"
echo "  # ou"
echo "  npx http-server"
echo ""
echo -e "${YELLOW}Browser:${NC}"
echo "  http://localhost:8000/login.html"
echo ""
echo -e "${YELLOW}Testes:${NC}"
echo "  http://localhost:8000/test.html"
echo ""
