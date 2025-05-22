# Educk - Plataforma Educacional para Compartilhamento de Cursos

## 📋 Sobre o Projeto

Educk é uma plataforma educacional completa desenvolvida como projeto acadêmico para a disciplina de UPX (Usina de Projetos Experimentais) da FACENS. A plataforma conecta professores e alunos em um ambiente virtual de aprendizado dinâmico e interativo, permitindo o compartilhamento e monetização de conhecimento.

### 🎯 Objetivos

- Criar uma plataforma intuitiva para compartilhamento de cursos online
- Permitir que professores monetizem seu conhecimento
- Oferecer aos alunos acesso a conteúdo educacional de qualidade
- Implementar sistema de avaliação e feedback para melhoria contínua
- Desenvolver uma solução completa com frontend, backend e banco de dados

## 🚀 Tecnologias Utilizadas

### Frontend
- **React Native**: Framework para desenvolvimento mobile multiplataforma
- **TypeScript**: Superset tipado de JavaScript
- **CSS/SCSS**: Estilização de componentes
- **Axios**: Cliente HTTP para requisições à API

### Backend
- **Node.js**: Ambiente de execução JavaScript server-side
- **Express**: Framework web para Node.js
- **MongoDB**: Banco de dados NoSQL
- **JWT**: Autenticação baseada em tokens
- **Mongoose**: ODM para MongoDB

### Landing Page
- **HTML5**: Estruturação do conteúdo
- **CSS3**: Estilização e responsividade
- **JavaScript**: Interatividade e animações

## 🏗️ Arquitetura do Projeto

O projeto segue uma arquitetura cliente-servidor com separação clara entre frontend e backend:

```
projeto_educk/
├── documentacao/       # Documentação acadêmica
├── artigo/             # Artigo científico
├── codigo/
│   ├── frontend/       # Aplicativo React Native
│   └── backend/        # API Node.js + MongoDB
├── landing_page/       # Site institucional
├── apresentacao/       # Slides de apresentação
└── diagramas/          # Diagramas UML e wireframes
```

## ✨ Funcionalidades Principais

### Para Alunos
- Cadastro e autenticação
- Navegação pelo catálogo de cursos
- Visualização de detalhes dos cursos
- Carrinho de compras
- Acesso aos cursos adquiridos
- Sistema de avaliação e comentários

### Para Professores
- Criação e edição de cursos
- Upload de conteúdo (vídeos, documentos, quizzes)
- Dashboard com estatísticas
- Gerenciamento de alunos
- Acompanhamento de receitas

### Para Administradores
- Painel administrativo
- Aprovação de cursos
- Gerenciamento de usuários
- Relatórios e métricas
- Configurações da plataforma

## 🔧 Instalação e Configuração

### Pré-requisitos
- Node.js (v14+)
- MongoDB
- React Native CLI
- Android Studio / Xcode (para desenvolvimento mobile)

### Backend
```bash
# Navegar para o diretório do backend
cd codigo/backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Iniciar servidor
npm start
```

### Frontend
```bash
# Navegar para o diretório do frontend
cd codigo/frontend/educk-app

# Instalar dependências
npm install

# Iniciar aplicativo em modo de desenvolvimento
npm start
```

## 🤝 Contribuição

Este é um projeto acadêmico desenvolvido por Renato Galli Barbosa Giglio para a disciplina de UPX da FACENS. Contribuições não são esperadas, mas sugestões são bem-vindas.


## 👨‍💻 Autor

- **Renato Galli Barbosa Giglio** 
## 🏫 Instituição

**FACENS - Faculdade de Engenharia de Sorocaba**  
Curso: Análise e Desenvolvimento de Sistemas  
Disciplina: UPX - Usina de Projetos Experimentais  

---

<p align="center">
  Desenvolvido com ❤️ como projeto acadêmico | 2025
</p>
