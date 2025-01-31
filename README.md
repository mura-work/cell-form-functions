# 架電実績フォームのバックエンドサーバー

## 概要

- 架電実績フォームが react で作成された SPA のため、外部の API サービス（主に notion）とやり取りする際にはフロント側からこのサーバーにリクエストを投げ、このバックエンドサーバーから各 API にリクエストを投げる

## 動作確認方法

- ローカル実行時には yarn start 時に NODE_ENV に dev を代入して起動している

```
// 環境変数に応じてサーバーを起動
if (process.env.NODE_ENV === "dev") {
  const PORT = process.env.PORT || 3005;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
```
