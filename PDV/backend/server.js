
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const app = express();

// Configuração do banco de dados
const dbUrl = new URL(process.env.DATABASE_URL);

const adapter = new PrismaMariaDb({
    host: dbUrl.hostname,
    port: Number(dbUrl.port || 3306),
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    database: decodeURIComponent(dbUrl.pathname.slice(1)),
    connectionLimit: 5
});

const prisma = new PrismaClient({ adapter });

// Middlewares
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());


app.post('/createCriente', async (req, res) => {

    const { nome, cpf, end, cidade, estado, email, telefone } = req.body

    try {
        const insert = await prisma.cliente.create({
            data: {
                nome: nome || null,
                cpf: cpf || null,
                endereco: end || null,
                cidade: cidade || null,
                estado: estado || null,
                email: email || null,
                telefone: telefone || null
            }
        });
        res.status(200).json({ message: 'Cadastro realizado!' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Erro no cadastro!' });
    }
});

app.post('/createProduto', async (req, res) => {
    const { descricao, quantidade, preco } = req.body;

    try {
        const insert = await prisma.produto.create({
            data: {
                descricao: descricao || null,
                quantidade: Number(quantidade) || 0,
                preco: Number(preco) || 0
            }
        });
        res.status(200).json({ message: 'Cadastro realizado!' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Erro no cadastro!' });
    }
});

app.post('/createVendedor', async (req, res) =>{
    const {nome, login, senha} = req.body;

    
    try {
        const insert = await prisma.vendedor.create({
            data: {
                nome: nome || null,
                login: login || null,
                senha: senha || null
            }
        });
        res.status(200).json({ message: 'Cadastro realizado!' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Erro no cadastro!' });
    }
});






const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Backend vivo na porta ${PORT}`);
});