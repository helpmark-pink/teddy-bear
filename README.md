# テディベア AI チャットフレンド

AI とチャットができる日本語のチャットアプリケーションです。
3D のテディベアキャラクターとフレンドリーな会話を楽しめます。
https://teddy-bear-nine.vercel.app/


## 機能

- AI とのリアルタイムチャット
- 可愛らしい 3D テディベアキャラクター
- フレンドリーな会話体験
- ユーザーフレンドリーなインターフェース
- 日本語対応

## 技術スタック

- React + TypeScript
- Vite
- Tailwind CSS
- Three.js (3D 表示)
- OpenAI API

## 開発環境のセットアップ

```bash
# リポジトリのクローン
git clone https://github.com/helpmark-pink/teddy-bear.git
cd teddy-bear

# 依存関係のインストール
npm install

# 環境変数の設定
# .env ファイルを作成し、OpenAI APIキーを設定
echo "VITE_OPENAI_API_KEY=your_openai_api_key" > .env

# 開発サーバーの起動
npm run dev
```

## ビルドと本番環境

```bash
# プロジェクトのビルド
npm run build

# ビルドされたアプリケーションのプレビュー
npm run preview
```

## デプロイ

このプロジェクトは[Vercel](https://vercel.com)を使用してデプロイされています。
デプロイ時には、Vercel のプロジェクト設定で環境変数 `VITE_OPENAI_API_KEY` に
OpenAI API キーを設定してください。

## ライセンス

MIT
