// const functions = require('firebase-functions');
const express = require("express");
const axios = require("axios");
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

app.get("/api/notion-data/sales-employees", async (req, res) => {
  const databaseId = "13482b75468c80ec878aec03efd68241"; // 本来であれば定数化するのが好ましい、、、

  try {
    const response = await axios({
      method: "post",
      url: `https://api.notion.com/v1/databases/${databaseId}/query`,
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(
      "Error querying Notion database:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ローカル環境で動作確認したい場合はコメントアウトを外すとサーバーが立ち上がる
// const PORT = process.env.PORT || 3005;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;

// Cloud Functions用
// exports.api = functions.https.onRequest(app);
