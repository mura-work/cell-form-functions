const express = require("express");
const router = express.Router();

// 各ルートをインポート
const notionDataRouter = require("./notionData");
const transcriptionTextRouter = require("./transcriptionText");
const transcriptionAudioRouter = require("./transcriptionAudio");
const larkDataRouter = require("./larkData");
const spreadsheetRouter = require("./spreadsheetRouter");

// 各エンドポイントにルーターを設定
router.use("/notion-data", notionDataRouter); // http://localhost:3003/api/notion-data
router.use("/transcription", transcriptionTextRouter); // http://localhost:3003/api/transcription
router.use("/", transcriptionAudioRouter); // http://localhost:3003/api/transcription-audio
router.use("/lark-data", larkDataRouter); // http://localhost:3003/api/lark-data
router.use("/spreadsheet", spreadsheetRouter); // http://localhost:3003/api/spreadsheet
module.exports = router;
