-- =====================================================
-- E-commerce - Programação para Web I (TF02)
-- =====================================================
CREATE DATABASE IF NOT EXISTS ecommerce
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecommerce;

-- Superclasse: dados comuns de Cliente e ADM
CREATE TABLE usuario (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  nome      VARCHAR(100) NOT NULL,
  endereco  VARCHAR(255) NOT NULL,
  email     VARCHAR(120) NOT NULL,
  telefone  VARCHAR(20),
  login     VARCHAR(50)  NOT NULL,
  senha     VARCHAR(255) NOT NULL,  -- guardar HASH (bcrypt), nunca texto puro
  CONSTRAINT uk_usuario_login UNIQUE (login)
) ENGINE=InnoDB;

-- Especialização: administrador
CREATE TABLE adm (
  id INT PRIMARY KEY,
  CONSTRAINT fk_adm_usuario FOREIGN KEY (id)
    REFERENCES usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Especialização: cliente
CREATE TABLE cliente (
  id INT PRIMARY KEY,
  forma_pagamento VARCHAR(30),
  CONSTRAINT fk_cliente_usuario FOREIGN KEY (id)
    REFERENCES usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE categoria (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(80) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE produto (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  descricao    VARCHAR(255) NOT NULL,
  preco        DECIMAL(10,2) NOT NULL CHECK (preco >= 0),
  foto         VARCHAR(255),
  quantidade   INT NOT NULL DEFAULT 0 CHECK (quantidade >= 0),
  id_categoria INT NOT NULL,
  CONSTRAINT fk_produto_categoria FOREIGN KEY (id_categoria)
    REFERENCES categoria(id)
) ENGINE=InnoDB;

CREATE TABLE venda (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  data_hora  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_cliente INT NOT NULL,
  CONSTRAINT fk_venda_cliente FOREIGN KEY (id_cliente)
    REFERENCES cliente(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE venda_produto (
  id_venda   INT NOT NULL,
  id_produto INT NOT NULL,
  preco      DECIMAL(10,2) NOT NULL,  -- preço no momento da compra
  quantidade INT NOT NULL CHECK (quantidade > 0),
  PRIMARY KEY (id_venda, id_produto),
  CONSTRAINT fk_vp_venda   FOREIGN KEY (id_venda)   REFERENCES venda(id) ON DELETE CASCADE,
  CONSTRAINT fk_vp_produto FOREIGN KEY (id_produto) REFERENCES produto(id)
) ENGINE=InnoDB;

-- ---------- Dados iniciais (opcional) ----------
-- O enunciado diz que o ADM pode ser inserido direto no banco.
-- Troque o HASH abaixo por um bcrypt gerado (ex.: node -e "console.log(require('bcryptjs').hashSync('admin123',10))")
-- INSERT INTO usuario (nome, endereco, email, login, senha)
--   VALUES ('Administrador', 'Sede', 'admin@loja.com', 'admin', '<HASH_BCRYPT>');
-- INSERT INTO adm (id) VALUES (LAST_INSERT_ID());
-- INSERT INTO categoria (nome) VALUES ('Eletrônicos'), ('Livros');
