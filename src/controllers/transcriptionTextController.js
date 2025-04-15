const axios = require("axios");

// === 1. テキストを分割する関数 ===
function chunkText(text, chunkSize = 2000) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    // chunkSizeずつ分割（改行や句点単位での分割など、必要に応じて工夫してください）
    chunks.push(text.slice(start, start + chunkSize));
    start += chunkSize;
  }
  return chunks;
}

async function requestOpenAI(text) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4.1-nano",
        messages: [
          {
            role: "system",
            content: `
            あなたは優れた編集者です。下記のテキストは議事録の文字起こしです。
            以下の指示に従い、できるだけ原文の意味を変えずに自然で読みやすい日本語の文章体に変換してください。

              1. 箇条書きや箇条書き風の表現は避け、段落を使って文章を構成してください。
              2. 話し言葉の特徴（例：「ええと」「あの」「えー」など）は適宜修正し、よりフォーマルな表現に置き換えてください。ただし、話し言葉による強調のニュアンスはできる限り保持してください。
              3. 専門用語はそのまま使用してください。
              4. 文脈が明確になるように、必要に応じて接続詞や指示語を追加してください。
              5. 変換後のテキストは、元のトランスクリプトの内容を一切要約せず、すべて網羅してください。
              6. 各話題ごとに、【〇〇】のようにラベルを付けて段落を区切り、セグメントごとに区切ってください。
              7. 明らかに話題が変わったタイミングがあれば、【〇〇】のようにラベルを付けて段落を区切り、セグメントごとに区切ってください。
            `,
          },
          {
            role: "user",
            content: `
              上記のルールを元に、文字起こしテキストを口語体に変換してください。
              出力形式を必ず守ってください。

              【文字起こしテキスト】
              ${text}
          `,
          },
        ],
        temperature: 0,
        max_tokens: 8192,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (e) {
    console.log(e);
    res.json({
      status: "error",
      message: e.message,
    });
  }
}

exports.summarizeTranscriptionText = async (req, res) => {
  try {
    const transcriptionText = req.body.transcriptionText;

    if (!transcriptionText) {
      return res.status(400).json({ error: "No text provided" });
    }

    // 1) テキストを分割
    const chunks = chunkText(transcriptionText, 2000);

    // 2) 順番に GPT-4 で変換
    const transformedChunks = [];
    for (const chunk of chunks) {
      const result = await requestOpenAI(chunk);
      transformedChunks.push(result);
    }

    // 3) 結合して最終結果にする
    const finalText = transformedChunks.join("\n");

    // 4) クライアントに返す
    res.json({
      status: "success",
      data: finalText,
    });
  } catch (e) {
    console.log(e);
    res.json({
      status: "error",
      message: e.message,
    });
  }
};
