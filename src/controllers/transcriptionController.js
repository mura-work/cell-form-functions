const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
const os = require("os");

// チャンク処理用の新しい関数
exports.transcribeAudioChunk = async (req, res) => {
  try {
    // チャンク情報を取得
    const { chunkIndex, totalChunks, sessionId } = req.body;

    if (!chunkIndex || !totalChunks || !sessionId) {
      return res.status(400).json({
        error:
          "チャンク情報が不足しています（chunkIndex, totalChunks, sessionId が必要です）",
      });
    }

    // audio または file フィールドからファイルを取得
    let fileBuffer;

    if (req.files) {
      if (req.files.audio && req.files.audio.length > 0) {
        fileBuffer = req.files.audio[0].buffer;
      } else if (req.files.file && req.files.file.length > 0) {
        fileBuffer = req.files.file[0].buffer;
      }
    } else if (req.file) {
      fileBuffer = req.file.buffer;
    }

    if (!fileBuffer) {
      return res
        .status(400)
        .json({ error: "音声ファイルが提供されていません" });
    }

    // セッション用の一時ディレクトリを作成
    const tempDir = path.join(os.tmpdir(), sessionId);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // チャンクファイルを保存
    const chunkFilePath = path.join(tempDir, `chunk-${chunkIndex}.mp3`);
    fs.writeFileSync(chunkFilePath, fileBuffer);

    // 最後のチャンク以外は成功を返す
    if (parseInt(chunkIndex) < parseInt(totalChunks) - 1) {
      return res.json({
        success: true,
        message: `チャンク ${chunkIndex + 1}/${totalChunks} を受信しました`,
      });
    }

    // 最後のチャンクの場合、すべてのチャンクを結合して処理
    const openai = new OpenAI({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    });

    // すべてのチャンクファイルを結合
    const combinedFilePath = path.join(tempDir, `combined-${Date.now()}.mp3`);
    const combinedStream = fs.createWriteStream(combinedFilePath);

    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(tempDir, `chunk-${i}.mp3`);
      if (fs.existsSync(chunkPath)) {
        const chunkData = fs.readFileSync(chunkPath);
        combinedStream.write(chunkData);
      }
    }

    combinedStream.end();

    // ストリームの完了を待つ
    await new Promise((resolve) => {
      combinedStream.on("finish", resolve);
    });

    // OpenAI Whisper APIを呼び出す
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(combinedFilePath),
      model: "whisper-1",
    });

    // すべての一時ファイルを削除
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(tempDir, `chunk-${i}.mp3`);
      if (fs.existsSync(chunkPath)) {
        fs.unlinkSync(chunkPath);
      }
    }

    fs.unlinkSync(combinedFilePath);

    // 一時ディレクトリを削除
    fs.rmdirSync(tempDir);

    res.json({
      transcription: transcription.text,
    });
  } catch (error) {
    console.error("文字起こしエラー:", error);
    res.status(500).json({ error: "文字起こし処理中にエラーが発生しました" });
  }
};
