// const functions = require('firebase-functions');
const express = require("express");
const axios = require("axios");
const cors = require('cors');
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/notion-data", async (req, res) => {
  const databaseId = "13482b75468c805d9a4cf67c7112365a";

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

module.exports = app;

// Cloud Functions用
// exports.api = functions.https.onRequest(app);
