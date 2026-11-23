require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const app = express();

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

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

async function cadastrarCliente(req, res) {
    const { nome, cpf, cidade, estado, email, telefone } = req.body;
    const endereco = req.body.endereco ?? req.body.end;

    try {
        const cliente = await prisma.cliente.create({
            data: {
                nome: nome || null,
                cpf: cpf || null,
                endereco: endereco || null,
                cidade: cidade || null,
                estado: estado || null,
                email: email || null,
                telefone: telefone || null
            }
        });

        return res.status(201).json({
            mensagem: 'Cliente cadastrado com sucesso.',
            cliente
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            erro: 'Erro ao cadastrar cliente.'
        });
    }
}

app.post('/createCriente', cadastrarCliente);
app.post('/clientes', cadastrarCliente);

app.get('/clientes', async (req, res) => {
    try {
        const clientes = await prisma.cliente.findMany({
            orderBy: {
                codigo: 'asc'
            }
        });

        return res.status(200).json(clientes);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            erro: 'Erro ao consultar clientes.'
        });
    }
});

app.get('/clientes/:codigo', async (req, res) => {
    const codigo = Number(req.params.codigo);

    if (!Number.isInteger(codigo) || codigo <= 0) {
        return res.status(400).json({
            erro: 'Código do cliente inválido.'
        });
    }

    try {
        const cliente = await prisma.cliente.findUnique({
            where: {
                codigo
            }
        });

        if (!cliente) {
            return res.status(404).json({
                erro: 'Cliente não encontrado.'
            });
        }

        return res.status(200).json(cliente);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            erro: 'Erro ao consultar cliente.'
        });
    }
});

app.put('/clientes/:codigo', async (req, res) => {
    const codigo = Number(req.params.codigo);

    if (!Number.isInteger(codigo) || codigo <= 0) {
        return res.status(400).json({
            erro: 'Código do cliente inválido.'
        });
    }

    const { nome, cpf, cidade, estado, email, telefone } = req.body;
    const endereco = req.body.endereco ?? req.body.end;

    try {
        const cliente = await prisma.cliente.update({
            where: {
                codigo
            },
            data: {
                nome: nome || null,
                cpf: cpf || null,
                endereco: endereco || null,
                cidade: cidade || null,
                estado: estado || null,
                email: email || null,
                telefone: telefone || null
            }
        });

        return res.status(200).json({
            mensagem: 'Cliente alterado com sucesso.',
            cliente
        });
    } catch (error) {
        console.error(error);

        if (error.code === 'P2025') {
            return res.status(404).json({
                erro: 'Cliente não encontrado.'
            });
        }

        return res.status(500).json({
            erro: 'Erro ao alterar cliente.'
        });
    }
});

app.delete('/clientes/:codigo', async (req, res) => {
    const codigo = Number(req.params.codigo);

    if (!Number.isInteger(codigo) || codigo <= 0) {
        return res.status(400).json({
            erro: 'Código do cliente inválido.'
        });
    }

    try {
        await prisma.cliente.delete({
            where: {
                codigo
            }
        });

        return res.status(200).json({
            mensagem: 'Cliente excluído com sucesso.'
        });
    } catch (error) {
        console.error(error);

        if (error.code === 'P2025') {
            return res.status(404).json({
                erro: 'Cliente não encontrado.'
            });
        }

        if (error.code === 'P2003') {
            return res.status(409).json({
                erro: 'Não é possível excluir este cliente porque há vendas vinculadas.'
            });
        }

        return res.status(500).json({
            erro: 'Erro ao excluir cliente.'
        });
    }
});

function obterDadosProduto(body) {
    const descricao = String(body.descricao ?? '').trim();
    const precoInformado = body.preco;
    const quantidadeInformada = body.quantidade;
    const preco = Number(precoInformado);
    const quantidade = Number(quantidadeInformada);

    if (!descricao) {
        throw new Error('Informe a descrição do produto.');
    }

    if (
        precoInformado === undefined ||
        precoInformado === null ||
        String(precoInformado).trim() === '' ||
        !Number.isFinite(preco) ||
        preco < 0
    ) {
        throw new Error('Informe um preço válido e não negativo.');
    }

    if (
        quantidadeInformada === undefined ||
        quantidadeInformada === null ||
        String(quantidadeInformada).trim() === '' ||
        !Number.isFinite(quantidade) ||
        quantidade < 0
    ) {
        throw new Error('Informe uma quantidade válida e não negativa.');
    }

    return {
        descricao,
        preco,
        quantidade
    };
}

async function cadastrarProduto(req, res) {
    let dados;

    try {
        dados = obterDadosProduto(req.body);
    } catch (error) {
        return res.status(400).json({
            erro: error.message
        });
    }

    try {
        const produto = await prisma.produto.create({
            data: dados
        });

        return res.status(201).json({
            mensagem: 'Produto cadastrado com sucesso.',
            produto
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            erro: 'Erro ao cadastrar produto.'
        });
    }
}

app.post('/createProduto', cadastrarProduto);
app.post('/produtos', cadastrarProduto);

app.get('/produtos', async (req, res) => {
    try {
        const produtos = await prisma.produto.findMany({
            orderBy: {
                codigo: 'asc'
            }
        });

        return res.status(200).json(produtos);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            erro: 'Erro ao consultar produtos.'
        });
    }
});

app.get('/produtos/:codigo', async (req, res) => {
    const codigo = Number(req.params.codigo);

    if (!Number.isInteger(codigo) || codigo <= 0) {
        return res.status(400).json({
            erro: 'Código do produto inválido.'
        });
    }

    try {
        const produto = await prisma.produto.findUnique({
            where: {
                codigo
            }
        });

        if (!produto) {
            return res.status(404).json({
                erro: 'Produto não encontrado.'
            });
        }

        return res.status(200).json(produto);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            erro: 'Erro ao consultar produto.'
        });
    }
});

app.put('/produtos/:codigo', async (req, res) => {
    const codigo = Number(req.params.codigo);

    if (!Number.isInteger(codigo) || codigo <= 0) {
        return res.status(400).json({
            erro: 'Código do produto inválido.'
        });
    }

    let dados;

    try {
        dados = obterDadosProduto(req.body);
    } catch (error) {
        return res.status(400).json({
            erro: error.message
        });
    }

    try {
        const produto = await prisma.produto.update({
            where: {
                codigo
            },
            data: dados
        });

        return res.status(200).json({
            mensagem: 'Produto alterado com sucesso.',
            produto
        });
    } catch (error) {
        console.error(error);

        if (error.code === 'P2025') {
            return res.status(404).json({
                erro: 'Produto não encontrado.'
            });
        }

        return res.status(500).json({
            erro: 'Erro ao alterar produto.'
        });
    }
});

app.delete('/produtos/:codigo', async (req, res) => {
    const codigo = Number(req.params.codigo);

    if (!Number.isInteger(codigo) || codigo <= 0) {
        return res.status(400).json({
            erro: 'Código do produto inválido.'
        });
    }

    try {
        await prisma.produto.delete({
            where: {
                codigo
            }
        });

        return res.status(200).json({
            mensagem: 'Produto excluído com sucesso.'
        });
    } catch (error) {
        console.error(error);

        if (error.code === 'P2025') {
            return res.status(404).json({
                erro: 'Produto não encontrado.'
            });
        }

        if (error.code === 'P2003') {
            return res.status(409).json({
                erro: 'Não é possível excluir este produto porque ele está vinculado a uma venda.'
            });
        }

        return res.status(500).json({
            erro: 'Erro ao excluir produto.'
        });
    }
});

async function cadastrarVendedor(req, res) {
    const nome = String(req.body.nome ?? '').trim();
    const login = String(req.body.login ?? '').trim();
    const senha = String(req.body.senha ?? '');

    if (!nome || !login || !senha) {
        return res.status(400).json({
            erro: 'Preencha nome, login e senha.'
        });
    }

    if (nome.length > 100 || login.length > 45 || senha.length > 50) {
        return res.status(400).json({
            erro: 'Um ou mais campos ultrapassam o tamanho permitido.'
        });
    }

    try {
        const vendedor = await prisma.vendedor.create({
            data: {
                nome,
                login,
                senha
            },
            select: {
                codigo: true,
                nome: true,
                login: true
            }
        });

        return res.status(201).json({
            mensagem: 'Vendedor cadastrado com sucesso.',
            vendedor
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            erro: 'Erro ao cadastrar vendedor.'
        });
    }
}

app.post('/createVendedor', cadastrarVendedor);
app.post('/vendedores', cadastrarVendedor);

app.get('/vendedores', async (req, res) => {
    try {
        const vendedores = await prisma.vendedor.findMany({
            select: {
                codigo: true,
                nome: true,
                login: true
            },
            orderBy: {
                codigo: 'asc'
            }
        });

        return res.status(200).json(vendedores);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            erro: 'Erro ao consultar vendedores.'
        });
    }
});

app.get('/vendedores/:codigo', async (req, res) => {
    const codigo = Number(req.params.codigo);

    if (!Number.isInteger(codigo) || codigo <= 0) {
        return res.status(400).json({
            erro: 'Código do vendedor inválido.'
        });
    }

    try {
        const vendedor = await prisma.vendedor.findUnique({
            where: {
                codigo
            },
            select: {
                codigo: true,
                nome: true,
                login: true
            }
        });

        if (!vendedor) {
            return res.status(404).json({
                erro: 'Vendedor não encontrado.'
            });
        }

        return res.status(200).json(vendedor);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            erro: 'Erro ao consultar vendedor.'
        });
    }
});

app.put('/vendedores/:codigo', async (req, res) => {
    const codigo = Number(req.params.codigo);
    const nome = String(req.body.nome ?? '').trim();
    const login = String(req.body.login ?? '').trim();
    const senha = String(req.body.senha ?? '');

    if (!Number.isInteger(codigo) || codigo <= 0) {
        return res.status(400).json({
            erro: 'Código do vendedor inválido.'
        });
    }

    if (!nome || !login) {
        return res.status(400).json({
            erro: 'Preencha nome e login.'
        });
    }

    if (nome.length > 100 || login.length > 45 || senha.length > 50) {
        return res.status(400).json({
            erro: 'Um ou mais campos ultrapassam o tamanho permitido.'
        });
    }

    const dados = {
        nome,
        login
    };

    if (senha.length > 0) {
        dados.senha = senha;
    }

    try {
        const vendedor = await prisma.vendedor.update({
            where: {
                codigo
            },
            data: dados,
            select: {
                codigo: true,
                nome: true,
                login: true
            }
        });

        return res.status(200).json({
            mensagem: 'Vendedor alterado com sucesso.',
            vendedor
        });
    } catch (error) {
        console.error(error);

        if (error.code === 'P2025') {
            return res.status(404).json({
                erro: 'Vendedor não encontrado.'
            });
        }

        return res.status(500).json({
            erro: 'Erro ao alterar vendedor.'
        });
    }
});

app.delete('/vendedores/:codigo', async (req, res) => {
    const codigo = Number(req.params.codigo);

    if (!Number.isInteger(codigo) || codigo <= 0) {
        return res.status(400).json({
            erro: 'Código do vendedor inválido.'
        });
    }

    try {
        await prisma.vendedor.delete({
            where: {
                codigo
            }
        });

        return res.status(200).json({
            mensagem: 'Vendedor excluído com sucesso.'
        });
    } catch (error) {
        console.error(error);

        if (error.code === 'P2025') {
            return res.status(404).json({
                erro: 'Vendedor não encontrado.'
            });
        }

        if (error.code === 'P2003') {
            return res.status(409).json({
                erro: 'Não é possível excluir este vendedor porque há vendas vinculadas.'
            });
        }

        return res.status(500).json({
            erro: 'Erro ao excluir vendedor.'
        });
    }
});

app.post('/realizarVenda', async (req, res) => {
    const { data, codCliente, codVendedor, codProduto, quantidade } = req.body;

    const codigoCliente = Number(codCliente);
    const codigoVendedor = Number(codVendedor);

    if (!Number.isInteger(codigoCliente) || codigoCliente <= 0) {
        return res.status(400).json({
            erro: 'Código do cliente inválido.'
        });
    }

    if (!Number.isInteger(codigoVendedor) || codigoVendedor <= 0) {
        return res.status(400).json({
            erro: 'Código do vendedor inválido.'
        });
    }

    if (
        !Array.isArray(codProduto) ||
        !Array.isArray(quantidade) ||
        codProduto.length === 0 ||
        codProduto.length !== quantidade.length
    ) {
        return res.status(400).json({
            erro: 'A lista de produtos e quantidades está inválida.'
        });
    }

    const itensAgrupados = new Map();

    for (let i = 0; i < codProduto.length; i++) {
        const codigoProduto = Number(codProduto[i]);
        const quantidadeItem = Number(quantidade[i]);

        if (!Number.isInteger(codigoProduto) || codigoProduto <= 0) {
            return res.status(400).json({
                erro: `Código inválido para o produto na posição ${i + 1}.`
            });
        }

        if (!Number.isFinite(quantidadeItem) || quantidadeItem <= 0) {
            return res.status(400).json({
                erro: `Quantidade inválida para o produto na posição ${i + 1}.`
            });
        }

        const quantidadeAnterior = itensAgrupados.get(codigoProduto) || 0;
        itensAgrupados.set(codigoProduto, quantidadeAnterior + quantidadeItem);
    }

    const dataVenda = data ? new Date(data) : new Date();

    if (Number.isNaN(dataVenda.getTime())) {
        return res.status(400).json({
            erro: 'Data da venda inválida.'
        });
    }

    try {
        const venda = await prisma.$transaction(
            async (tx) => {
                const cliente = await tx.cliente.findUnique({
                    where: {
                        codigo: codigoCliente
                    }
                });

                if (!cliente) {
                    const error = new Error('Cliente não encontrado.');
                    error.status = 404;
                    throw error;
                }

                const vendedor = await tx.vendedor.findUnique({
                    where: {
                        codigo: codigoVendedor
                    }
                });

                if (!vendedor) {
                    const error = new Error('Vendedor não encontrado.');
                    error.status = 404;
                    throw error;
                }

                const itens = [];
                let total = 0;

                for (const [codigoProduto, quantidadeItem] of itensAgrupados) {
                    const produto = await tx.produto.findUnique({
                        where: {
                            codigo: codigoProduto
                        }
                    });

                    if (!produto) {
                        const error = new Error(
                            `Produto com código ${codigoProduto} não encontrado.`
                        );
                        error.status = 404;
                        throw error;
                    }

                    const estoqueDisponivel = Number(produto.quantidade ?? 0);

                    if (estoqueDisponivel < quantidadeItem) {
                        const error = new Error(
                            `Estoque insuficiente para ${produto.descricao}. Disponível: ${estoqueDisponivel}; solicitado: ${quantidadeItem}.`
                        );
                        error.status = 409;
                        throw error;
                    }

                    const subtotal = Math.round(
                        (Number(produto.preco ?? 0) * quantidadeItem + Number.EPSILON) * 100
                    ) / 100;

                    itens.push({
                        codigoProduto,
                        quantidade: quantidadeItem,
                        subtotal
                    });

                    total += subtotal;
                }

                total = Math.round((total + Number.EPSILON) * 100) / 100;

                const vendaCriada = await tx.venda.create({
                    data: {
                        data: dataVenda,
                        total,
                        codCliente: codigoCliente,
                        codVendedor: codigoVendedor
                    }
                });

                for (const item of itens) {
                    const baixaEstoque = await tx.produto.updateMany({
                        where: {
                            codigo: item.codigoProduto,
                            quantidade: {
                                gte: item.quantidade
                            }
                        },
                        data: {
                            quantidade: {
                                decrement: item.quantidade
                            }
                        }
                    });

                    if (baixaEstoque.count !== 1) {
                        const error = new Error(
                            `O estoque do produto ${item.codigoProduto} mudou durante a venda. Consulte o estoque e tente novamente.`
                        );
                        error.status = 409;
                        throw error;
                    }

                    await tx.itensvenda.create({
                        data: {
                            codVenda: vendaCriada.codigo,
                            codProduto: item.codigoProduto,
                            quantidade: item.quantidade,
                            subtotal: item.subtotal
                        }
                    });
                }

                return tx.venda.findUnique({
                    where: {
                        codigo: vendaCriada.codigo
                    },
                    include: {
                        cliente: true,
                        vendedor: true,
                        itensVenda: {
                            include: {
                                produto: true
                            }
                        }
                    }
                });
            },
            {
                maxWait: 5000,
                timeout: 10000
            }
        );

        return res.status(201).json({
            mensagem: 'Venda realizada com sucesso.',
            venda
        });
    } catch (error) {
        console.error(error);

        if (error.status) {
            return res.status(error.status).json({
                erro: error.message
            });
        }

        return res.status(500).json({
            erro: 'Erro ao realizar venda.'
        });
    }
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Backend vivo na porta ${PORT}`);
});