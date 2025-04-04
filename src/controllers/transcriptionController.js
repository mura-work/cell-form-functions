const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
const os = require("os");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.transcribeAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "音声ファイルが提供されていません" });
    }

    // 一時ファイルを作成
    const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.mp3`);
    fs.writeFileSync(tempFilePath, req.file.buffer);

    // OpenAI Whisper APIを呼び出す
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
    });

    // 一時ファイルを削除
    fs.unlinkSync(tempFilePath);

    res.json({
      transcription: transcription.text,
    });
  } catch (error) {
    console.error("文字起こしエラー:", error);
    res.status(500).json({ error: "文字起こし処理中にエラーが発生しました" });
  }
};
