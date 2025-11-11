const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

mongoose.connect("mongodb://localhost:27017/usuariosDB")
  .then(() => console.log("✅ Conectado ao MongoDB local"))
  .catch(err => console.error("❌ Erro na conexão", err));

const Usuario = mongoose.model("Usuario", new mongoose.Schema({
  nome: String,
  telefone: String,
  senha: String
}, { versionKey: false }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/cadastrar", async (req, res) => {
  const { nome, telefone, senha } = req.body;
  try {
    const existe = await Usuario.findOne({ telefone });
    if (existe) return res.status(400).json({ erro: "Telefone já cadastrado!" });

    const novo = new Usuario({ nome, telefone, senha });
    await novo.save();

    res.json({ mensagem: "Usuário cadastrado com sucesso!" });

  } catch {
    res.status(500).json({ erro: "Erro ao cadastrar." });
  }
});

app.post("/api/login", async (req, res) => {
  const { telefone, senha } = req.body;

  try {
    const user = await Usuario.findOne({ telefone, senha });
    if (!user) return res.status(401).json({ erro: "Telefone ou senha inválidos." });

    res.json({ mensagem: `Bem-vindo, ${user.nome}!` });

  } catch {
    res.status(500).json({ erro: "Erro ao fazer login." });
  }
});

app.get("/api/listar", async (req, res) => {
  try {
    const usuarios = await Usuario.find({});
    res.json(usuarios);
  } catch {
    res.status(500).json({ erro: "Erro ao listar usuários." });
  }
});

app.delete("/api/excluir/:id", async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.json({ mensagem: "Usuário excluído!" });
  } catch {
    res.status(500).json({ erro: "Erro ao excluir." });
  }
});

app.put("/api/editar/:id", async (req, res) => {
  const { nome, telefone, senha } = req.body;

  try {
    await Usuario.findByIdAndUpdate(req.params.id, { nome, telefone, senha });
    res.json({ mensagem: "Usuário atualizado!" });
  } catch {
    res.status(500).json({ erro: "Erro ao atualizar." });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
