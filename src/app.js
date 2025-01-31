// const functions = require('firebase-functions');
const express = require("express");
const routers = require("./routers"); // ルーティングのエントリーポイント
const cors = require("cors");
require("dotenv").config();

const app = express();
const corsOptions = {
  origin: ["http://localhost:3003", "https://call-record-form-92dac.web.app"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// APIルート
app.use("/api", routers);

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// ローカル環境で動作確認したい場合はコメントアウトを外すとサーバーが立ち上がる
// const PORT = process.env.PORT || 3005;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;

// Cloud Functions用
// exports.api = functions.https.onRequest(app);
