const express = require("express");
const router = express.Router();

// 各ルートをインポート
const notionDataRouter = require("./notionData");

// 各エンドポイントにルーターを設定
router.use("/notion-data", notionDataRouter); // http://localhost:3003/api/notion-data

module.exports = router;
