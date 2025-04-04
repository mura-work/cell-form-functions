const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
const os = require("os");

exports.transcribeAudio = async (req, res) => {
  try {
    // audio または file フィールドからファイルを取得
    let fileBuffer;

    if (req.files) {
      // upload.fields を使った場合
      if (req.files.audio && req.files.audio.length > 0) {
        fileBuffer = req.files.audio[0].buffer;
      } else if (req.files.file && req.files.file.length > 0) {
        fileBuffer = req.files.file[0].buffer;
      }
    } else if (req.file) {
      // upload.single を使った場合（互換性のため）
      fileBuffer = req.file.buffer;
    }

    if (!fileBuffer) {
      return res
        .status(400)
        .json({ error: "音声ファイルが提供されていません" });
    }

    // 一時ファイルを作成
    const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.mp3`);
    fs.writeFileSync(tempFilePath, fileBuffer);

    const openai = new OpenAI({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    });

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
