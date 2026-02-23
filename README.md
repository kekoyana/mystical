# AnyGame - Tower Defense

ブラウザで遊べるタワーディフェンスゲーム。

## Features
- スマートフォン・PC 両対応（タッチ & マウス操作）
- 1プレイ 5〜20分のカジュアルなセッション
- 多彩なタワーと敵キャラクター
- ランダム要素のあるウェーブ構成
- ステージクリア型の進行

## Tech Stack
- React 18 + TypeScript
- Vite
- HTML5 Canvas

## Getting Started

```bash
# 依存パッケージインストール
npm install

# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build
```

## Project Structure

```
src/
├── game/         # ゲームコアロジック（React非依存）
├── rendering/    # Canvas描画
├── components/   # React UIコンポーネント
├── hooks/        # カスタムフック
└── assets/       # 静的アセット
```

詳細は [CLAUDE.md](./CLAUDE.md) を参照。
