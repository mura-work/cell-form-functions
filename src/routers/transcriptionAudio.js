const express = require("express");
const router = express.Router();
const transcriptionController = require("../controllers/transcriptionController");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MBの制限
});

// チャンク処理用の新しいルート
router.post(
  "/transcription-audio-chunk",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  transcriptionController.transcribeAudioChunk
);

module.exports = router;
