# CLAUDE.md - Tower Defense Browser Game

## Project Overview
タワーディフェンス型ブラウザゲーム。スマホ・PC両対応、1プレイ5〜20分。

## Tech Stack
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Rendering**: HTML5 Canvas（ゲーム画面） + React（UI/HUD）
- **State Management**: React hooks + useReducer（ゲームステート）
- **Styling**: CSS Modules
- **Lint**: ESLint

## Architecture

```
src/
├── main.tsx              # エントリポイント
├── App.tsx               # ルートコンポーネント
├── game/                 # ゲームコアロジック（React非依存）
│   ├── engine.ts         # ゲームループ・更新処理
│   ├── types.ts          # 型定義
│   ├── entities/         # エンティティ（タワー、敵、弾）
│   ├── systems/          # システム（移動、攻撃、衝突判定）
│   ├── maps/             # マップデータ
│   └── balance.ts        # バランスパラメータ
├── rendering/            # Canvas描画
│   ├── renderer.ts       # メインレンダラー
│   ├── sprites.ts        # スプライト描画
│   └── effects.ts        # エフェクト描画
├── components/           # React UIコンポーネント
│   ├── GameCanvas.tsx    # Canvas wrapper
│   ├── HUD.tsx           # ヘッドアップディスプレイ
│   ├── TowerMenu.tsx     # タワー選択メニュー
│   └── screens/          # 画面（タイトル、ステージ選択、リザルト）
├── hooks/                # カスタムフック
└── assets/               # 静的アセット
```

## Conventions
- ゲームロジック（`src/game/`）はReactに依存しない純粋なTypeScript
- UIコンポーネントは関数コンポーネント + hooks
- 型は `src/game/types.ts` に集約
- バランス調整値は `src/game/balance.ts` に集約（マジックナンバー禁止）
- CSS ModulesでスタイリングCSSファイルは `.module.css` 拡張子

## Commands
```bash
npm run dev      # 開発サーバー起動
npm run build    # プロダクションビルド
npm run lint     # ESLint実行
npm run preview  # ビルドプレビュー
```

## Documents
- 企画書: `docs/GAME_DESIGN.md`
- タスク管理: `docs/TASKS.md` — 実装の進捗はここを参照・更新すること

## Workflow
1. 作業開始時に `docs/TASKS.md` を読み、現在のフェーズと未完了タスクを確認する
2. タスク完了時は `docs/TASKS.md` のチェックボックスを `[x]` に更新する
3. フェーズの全タスク完了時は「現在のステータス」セクションを次のフェーズに更新する
