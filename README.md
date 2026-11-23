# Reengenharia PDV

Sistema de ponto de venda refeito com **React**, **Node.js**, **Express**, **Prisma** e **MySQL**. A aplicação mantém as funções principais do sistema original em Java: manutenção de clientes, produtos e vendedores, além da realização de vendas com baixa de estoque.

## Funcionalidades

- Cadastro, consulta, alteração e exclusão de clientes.
- Cadastro, consulta, alteração e exclusão de produtos.
- Cadastro, consulta, alteração e exclusão de vendedores.
- Criação de vendas com cliente, vendedor e vários produtos.
- Cálculo de subtotais e do total da venda.
- Verificação e atualização do estoque ao finalizar uma venda.
- Interface web responsiva com cores inspiradas em mercado.

## Tecnologias

- **Frontend:** React e Vite
- **Backend:** Node.js e Express
- **ORM:** Prisma 7
- **Banco de dados:** MySQL ou MariaDB
- **Adaptador do banco:** `@prisma/adapter-mariadb`

## Estrutura do projeto

```text
PDV/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env
│   ├── package.json
│   ├── prisma7.config.js
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Clientes.jsx
│   │   │   ├── Inicial.jsx
│   │   │   ├── Produtos.jsx
│   │   │   ├── Venda.jsx
│   │   │   └── Vendedores.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
├── bd_pdv.sql
└── README.md
```

## Requisitos

- Node.js e npm instalados.
- MySQL ou MariaDB instalado e em execução.
- Um banco de dados local para o PDV.

## Configuração do banco de dados

1. Crie um banco de dados chamado `bd_pdv` no MySQL ou MariaDB.
2. Importe o arquivo `bd_pdv.sql` para esse banco usando uma ferramenta como MySQL Workbench ou phpMyAdmin.

> **Atenção:** o arquivo `bd_pdv.sql` contém comandos para excluir e recriar as tabelas. Importe-o somente em um banco vazio ou quando puder perder os dados existentes.

3. Crie ou edite o arquivo `backend/.env`:

```env
DATABASE_URL="mysql://USUARIO:SENHA@localhost:3306/bd_pdv"
```

Substitua `USUARIO` e `SENHA` pelos dados do seu MySQL ou MariaDB. Se a senha tiver caracteres especiais, talvez seja necessário codificá-los para uso na URL.

Não compartilhe nem envie o arquivo `.env`, pois ele contém as credenciais do banco.

## Instalação

Abra um terminal na pasta do projeto e instale as dependências do backend:

```powershell
cd .\backend
npm install
```

Gere o cliente do Prisma:

```powershell
npx prisma generate --config .\prisma7.config.js
```

Em outro terminal, instale as dependências do frontend:

```powershell
cd .\frontend
npm install
```

## Como executar

Mantenha o banco de dados ligado. Execute o backend em um terminal:

```powershell
cd .\backend
npm run dev
```

O terminal deve permanecer aberto e mostrar:

```text
Backend vivo na porta 5000
```

Execute o frontend em outro terminal:

```powershell
cd .\frontend
npm run dev
```

O Vite mostrará o endereço local da aplicação, normalmente `http://localhost:5173`. Abra esse endereço no navegador.

O backend permite atualmente a origem `http://localhost:5173`. Se o Vite iniciar em outra porta, como `5174`, ajuste a origem permitida no CORS do `backend/server.js`.

## API

O backend usa a porta `5000`.

| Método | Rota | Ação |
|---|---|---|
| `GET` | `/clientes` | Lista clientes |
| `GET` | `/clientes/:codigo` | Consulta um cliente |
| `POST` | `/clientes` | Cadastra um cliente |
| `PUT` | `/clientes/:codigo` | Altera um cliente |
| `DELETE` | `/clientes/:codigo` | Exclui um cliente |
| `GET` | `/produtos` | Lista produtos |
| `GET` | `/produtos/:codigo` | Consulta um produto |
| `POST` | `/produtos` | Cadastra um produto |
| `PUT` | `/produtos/:codigo` | Altera um produto |
| `DELETE` | `/produtos/:codigo` | Exclui um produto |
| `GET` | `/vendedores` | Lista vendedores |
| `GET` | `/vendedores/:codigo` | Consulta um vendedor |
| `POST` | `/vendedores` | Cadastra um vendedor |
| `PUT` | `/vendedores/:codigo` | Altera um vendedor |
| `DELETE` | `/vendedores/:codigo` | Exclui um vendedor |
| `POST` | `/realizarVenda` | Finaliza uma venda |

As rotas de cadastro antigas `/createCriente`, `/createProduto` e `/createVendedor` também foram mantidas como compatibilidade.

### Exemplo de requisição para realizar uma venda

```json
{
  "codCliente": 1,
  "codVendedor": 1,
  "codProduto": [1, 2],
  "quantidade": [2, 1]
}
```

Os códigos e as quantidades são enviados em listas correspondentes: o primeiro produto usa a primeira quantidade, o segundo usa a segunda. Se a data não for informada, o backend usa a data atual.

A venda, seus itens e as baixas de estoque são processados em uma transação. Se uma parte falhar, a operação inteira é desfeita.

## Conferir a conexão com a API

Com o backend ligado, estes endereços devem retornar listas em JSON:

- `http://localhost:5000/clientes`
- `http://localhost:5000/produtos`
- `http://localhost:5000/vendedores`

Uma resposta `[]` significa que a rota respondeu, mas ainda não há registros cadastrados.

## Solução de problemas

### A tela mostra “Failed to fetch”

Confira se o backend está rodando na porta `5000`. Confira também se a origem configurada no CORS corresponde à porta mostrada pelo Vite.

### O terminal do backend mostra “clean exit”

Confirme se `server.js` termina com `app.listen(...)` e se o bloco está fora das rotas e funções.

### A API retorna erro ao consultar registros

Confira se o MySQL/MariaDB está ligado, se o banco `bd_pdv` existe e se a URL em `backend/.env` está correta.

### A exclusão de um registro é recusada

Clientes e vendedores vinculados a vendas e produtos vinculados a itens de venda não podem ser excluídos. Essa restrição é aplicada pelas chaves estrangeiras do banco.
