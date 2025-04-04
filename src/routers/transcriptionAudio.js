const express = require("express");
const router = express.Router();
const transcriptionController = require("../controllers/transcriptionController");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MBの制限
});

// 'audio'または'file'という名前のフィールドを受け付ける
router.post(
  "/transcription-audio",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  transcriptionController.transcribeAudio
);

module.exports = router;
