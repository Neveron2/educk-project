require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const winston = require('winston');
const routes = require('./routes');

// Configuração do logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Inicialização do app Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Conexão com o MongoDB
// Nota: Em um ambiente de produção, usaríamos variáveis de ambiente para a string de conexão
// Mas para fins acadêmicos, estou usando uma string direta para facilitar a execução
mongoose.connect('mongodb://localhost:27017/educk', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  logger.info('Conexão com MongoDB estabelecida com sucesso');
})
.catch(err => {
  logger.error('Erro ao conectar ao MongoDB:', err);
  process.exit(1);
});

// Rotas da API
app.use('/api', routes);

// Rota de teste
app.get('/', (req, res) => {
  res.send('API do Educk está funcionando!');
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send('Algo deu errado!');
});

// Definição da porta
const PORT = process.env.PORT || 5000;

// Inicialização do servidor
app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
});

module.exports = app; // Para testes
