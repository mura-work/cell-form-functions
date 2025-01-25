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

// 法人名（法人番号）の取得
app.get("/api/notion-data/client-companies", async (req, res) => {
  const databaseId = "13182b75468c80678161c6c6912b8d26"; // 本来であれば定数化するのが好ましい、、、

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

// 担当者の取得
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

// 商品の取得
app.get("/api/notion-data/products", async (req, res) => {
  const databaseId = "13182b75468c80a9b766e570b5383762"; // 本来であれば定数化するのが好ましい、、、

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

// シフト管理DBに保存する
app.post("/api/notion-data/shift-management", async (req, res) => {
  const shiftRequestValues = req.body.shiftRequestValues;
  const homeWorkerName = req.body.homeWorkerName;
  const convertedShifts = shiftRequestValues.map(
    ({ date, startTime, endTime }) => {
      // "2025-01-01 09:00" などに結合して返す
      const startAt = `${date} ${startTime}`;
      const endAt = `${date} ${endTime}`;

      // 差分をミリ秒で計算
      const diffMilliseconds = Math.abs(
        new Date(`${date} ${endTime}`).getTime() -
          new Date(`${date} ${startTime}`).getTime()
      );

      // ミリ秒を時間に変換
      const workTime = diffMilliseconds / (1000 * 60 * 60);

      // Dateオブジェクトを受け取り、年と月を取得
      const year = new Date(date).getFullYear();
      const month = String(new Date(date).getMonth() + 1).padStart(2, "0");

      return {
        date,
        yearMonth: `${year}-${month}`,
        workTime,
        startDatetime: startAt,
        endDatetime: endAt,
      };
    }
  );

  const dateValues = convertedShifts.map((value) => {
    return {
      parent: { database_id: process.env.REACT_APP_NOTION_DB_ENDPOINT_ID },
      properties: {
        名前: {
          title: [
            {
              text: { content: homeWorkerName },
            },
          ],
        },
        勤務開始時間: {
          date: { start: value.startDatetime },
        },
        勤務終了時間: {
          date: { start: value.endDatetime },
        },
        勤務時間: {
          number: value.workTime,
        },
        勤務月: {
          rich_text: [
            {
              type: "text",
              text: {
                content: value.yearMonth,
              },
            },
          ],
        },
      },
    };
  });

  try {
    const NOTION_API_URL = "https://api.notion.com/v1/pages";
    await Promise.all(
      dateValues.map(async (dateValue) => {
        await axios.post(NOTION_API_URL, dateValue, {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_NOTION_SHIFT_DB_API_TOKEN}`,
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28", // Notion APIバージョン
          },
        });
      })
    );
  } catch (e) {
    console.error(e);
  }

  res.json({ message: "Success" });
});

// ローカル環境で動作確認したい場合はコメントアウトを外すとサーバーが立ち上がる
// const PORT = process.env.PORT || 3005;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;

// Cloud Functions用
// exports.api = functions.https.onRequest(app);
