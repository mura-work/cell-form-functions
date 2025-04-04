const express = require("express");
const router = express.Router();
const transcriptionController = require("../controllers/transcriptionController");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MBの制限
});

router.post(
  "/transcription-audio",
  upload.single("audio"),
  transcriptionController.transcribeAudio
);

module.exports = router;
