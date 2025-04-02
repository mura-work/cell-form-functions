const axios = require("axios");

exports.summarizeTranscriptionText = async (req, res) => {
  const transcriptionText = req.body.transcriptionText;
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `
						下記のテキストは議事録の文字起こしです。以下の指示に従い、できるだけ原文の意味を変えずに自然で読みやすい日本語の文章体に変換してください。

							1. 箇条書きや箇条書き風の表現は避け、段落を使って文章を構成してください。
							2. 話し言葉の特徴（例：「ええと」「あの」「えー」など）は適宜修正し、よりフォーマルな表現に置き換えてください。ただし、話し言葉による強調のニュアンスはできる限り保持してください。
							3. 専門用語はそのまま使用してください。
							4. 文脈が明確になるように、必要に応じて接続詞や指示語を追加してください。
							5. 変換後のテキストは、元のトランスクリプトの内容を一切要約せず、すべて網羅してください。
							6. 明らかに話題が変わったタイミングがあれば、【〇〇】のようにラベルを付けて段落を区切り、セグメントごとに整理してください。
						`,
          },
          {
            role: "user",
            content: `
							上記のルールを元に、文字起こしテキストを要約してください。
							出力形式を必ず守ってください。

							【文字起こしテキスト】
							${transcriptionText}
					`,
          },
        ],
        temperature: 0,
        max_tokens: 16384,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      status: "success",
      data: response.data.choices[0].message.content,
    });
  } catch (e) {
    console.log(e);
    res.json({
      status: "error",
      message: e.message,
    });
  }
};
