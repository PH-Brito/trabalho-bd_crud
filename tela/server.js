// server.js
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

// 🔗 Conexão com o MongoDB local
mongoose.connect("mongodb://localhost:27017/usuariosDB")
  .then(() => console.log("✅ Conectado ao MongoDB local"))
  .catch(err => console.error("❌ Erro ao conectar no MongoDB:", err));

// 🧱 Modelo do usuário
const Usuario = mongoose.model("Usuario", {
  nome: String,
  telefone: String,
  senha: String
});

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// 🔐 Rota de login
app.post("/api/login", async (req, res) => {
  const { telefone, senha } = req.body;
  try {
    const user = await Usuario.findOne({ telefone, senha });
    if (!user) return res.status(401).json({ erro: "Telefone ou senha inválidos." });
    res.json({ mensagem: `Bem-vindo, ${user.nome}!` });
  } catch {
    res.status(500).json({ erro: "Erro no servidor." });
  }
});

// 🧾 Rota de cadastro
app.post("/api/cadastrar", async (req, res) => {
  const { nome, telefone, senha } = req.body;
  try {
    const existente = await Usuario.findOne({ telefone });
    if (existente) return res.status(400).json({ erro: "Telefone já cadastrado!" });

    const novo = new Usuario({ nome, telefone, senha });
    await novo.save();
    res.json({ mensagem: "Usuário cadastrado com sucesso!" });
  } catch {
    res.status(500).json({ erro: "Erro no servidor." });
  }
});

// 🗑️ Rota para excluir conta
app.delete("/api/excluir", async (req, res) => {
  const { telefone } = req.body;
  try {
    await Usuario.deleteOne({ telefone });
    res.json({ mensagem: "Conta excluída com sucesso." });
  } catch {
    res.status(500).json({ erro: "Erro ao excluir conta." });
  }
});

// 🧾 Rota para listar todos os cadastros
app.get("/api/listar", async (req, res) => {
  try {
    const usuarios = await Usuario.find({}, "nome telefone -_id"); // traz nome e telefone, sem _id
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar usuários." });
  }
});

// 🚀 Inicializa o servidor
const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
