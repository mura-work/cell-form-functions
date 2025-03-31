const express = require("express");
const router = express.Router();
const transcriptionTextController = require("../controllers/transcriptionTextController");

/** 文字起こしテキストの要約 */
router.post(
  "/summarize-transcription-text",
  transcriptionTextController.summarizeTranscriptionText
);

module.exports = router;
