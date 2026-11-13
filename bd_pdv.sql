SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;

DROP TABLE IF EXISTS itensvenda;
DROP TABLE IF EXISTS venda;
DROP TABLE IF EXISTS produto;
DROP TABLE IF EXISTS cliente;
DROP TABLE IF EXISTS vendedor;

CREATE TABLE cliente (
  codigo int NOT NULL AUTO_INCREMENT,
  nome varchar(200) DEFAULT NULL,
  cpf varchar(45) DEFAULT NULL,
  endereco varchar(200) DEFAULT NULL,
  cidade varchar(45) DEFAULT NULL,
  estado varchar(2) DEFAULT NULL,
  email varchar(100) DEFAULT NULL,
  telefone varchar(45) DEFAULT NULL,
  PRIMARY KEY (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE produto (
  codigo int NOT NULL AUTO_INCREMENT,
  descricao varchar(100) DEFAULT NULL,
  quantidade float DEFAULT NULL,
  preco float DEFAULT NULL,
  PRIMARY KEY (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE vendedor (
  codigo int NOT NULL AUTO_INCREMENT,
  nome varchar(100) DEFAULT NULL,
  login varchar(45) DEFAULT NULL,
  senha varchar(50) DEFAULT NULL,
  PRIMARY KEY (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE venda (
  codigo int NOT NULL AUTO_INCREMENT,
  data date DEFAULT NULL,
  total float DEFAULT NULL,
  codCliente int NOT NULL,
  codVendedor int NOT NULL,
  PRIMARY KEY (codigo),
  KEY fk_venda_cliente_idx (codCliente),
  KEY fk_venda_vendedor1_idx (codVendedor),
  CONSTRAINT fk_venda_cliente FOREIGN KEY (codCliente) REFERENCES cliente (codigo),
  CONSTRAINT fk_venda_vendedor1 FOREIGN KEY (codVendedor) REFERENCES vendedor (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE itensvenda (
  codVenda int NOT NULL,
  codProduto int NOT NULL,
  quantidade float DEFAULT NULL,
  subtotal float DEFAULT NULL,
  PRIMARY KEY (codVenda,codProduto),
  KEY fk_venda_has_produto_produto1_idx (codProduto),
  KEY fk_venda_has_produto_venda1_idx (codVenda),
  CONSTRAINT fk_venda_has_produto_produto1 FOREIGN KEY (codProduto) REFERENCES produto (codigo),
  CONSTRAINT fk_venda_has_produto_venda1 FOREIGN KEY (codVenda) REFERENCES venda (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

COMMIT;
SET FOREIGN_KEY_CHECKS = 1;
