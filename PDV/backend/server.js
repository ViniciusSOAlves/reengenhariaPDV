
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

app.post('/createVendedor', async (req, res) => {
    const { nome, login, senha } = req.body;

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
app.post('/realizarVenda', async (req, res) => {
    const { data, codCliente, codVendedor, codProduto, quantidade } = req.body;
    const controleEstoque = [];
    var somaTotal = 0;

    try {

        for (let i = 0; i < codProduto.length; i++) {

            const busca = await prisma.produto.findUnique({
                where: {
                    id: codProduto[i]
                }
            });

            if (!busca) {
                return res.status(404).json({
                    erro: 'Produto não encontrado.',
                    codProduto: codProduto[i]
                });
            }

            if (busca.quantidade < quantidade[i]) {
                controleEstoque.push(busca.descricao);
            }
        }

        if (controleEstoque.length > 0) {
            return res.status(400).json({
                erro: 'Quantidade maior que estoque.',
                controleEstoque
            });
        }

        const create = await prisma.venda.create({
            data: {
                data,
                total: 0,
                codCliente,
                codVendedor
            }
        });

        const id = create.codigo;

        for (let i = 0; i < codProduto.length; i++) {
            const produtoAtual = codProduto[i];
            const qtdAtual = quantidade[i];

            const busca = await prisma.produto.findUnique({
                where: {
                    id: produtoAtual
                }
            });

            if (busca) {
                const createvenda = await prisma.itensvenda.create({
                    data: {
                        codVenda: id,
                        codProduto: busca.id,
                        quantidade: qtdAtual,
                        subtotal: busca.preco * qtdAtual
                    }
                });

                const updateProduto = await prisma.produto.update({
                    where: {
                        id: busca.id
                    },
                    data: {
                        quantidade: {
                            decrement: qtdAtual
                        }
                    }
                });

                somaTotal += busca.preco * qtdAtual;
            }
        }

        const updateVenda = await prisma.venda.update({
            where: {
                codigo: id
            },
            data: {
                total: somaTotal
            }
        });

        return res.status(201).json({
            mensagem: 'Venda realizada com sucesso.',
            venda: updateVenda
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            erro: 'Erro ao realizar venda.'
        });
    }
});







const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Backend vivo na porta ${PORT}`);
});