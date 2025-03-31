# 架電実績フォームのバックエンドサーバー

## 概要

- 架電実績フォームが react で作成された SPA のため、外部の API サービス（主に notion）とやり取りする際にはフロント側からこのサーバーにリクエストを投げ、このバックエンドサーバーから各 API にリクエストを投げる

## デプロイコマンド

- vercel を使用している
- main ブランチにマージした状態で下記のコマンドを実行

```
$ vercel --prod
```
