# ポートフォリオ全面リデザイン 設計書(正本)

決定日: 2026-06-24 / 基盤着手: 2026-07-02 / ブランチ: `feature/ts-onion-migration`
**改訂 2026-07-02: 世界観をドット絵(8bit)から近未来(サイバー HUD)調へ変更。**

## 1. コンセプト

ポートフォリオを「ゲームの世界そのもの」に全面リデザインする。
就活・面接官に見せる用途。実際に遊べるゲームではなく「ゲームっぽく見せる演出」。

- 世界観: **近未来/サイバー HUD 調**(ドット絵・8bit デザインは不採用)
- 配色: ダーク基調 + ネオン系アクセント(シアン/マゼンタ)
- フォント: 見出し/UI は近未来的(Orbitron / Rajdhani)、本文は読みやすい Noto Sans JP
- 起動: ブート演出 → 入力待ちせず 1 秒未満で自動遷移
- テーマ切替(light/dark)と JP/EN i18n は維持
- サウンドなし

## 2. セクション構成(主役順)

| 順 | セクション | 演出 |
|---|---|---|
| 1 | **Games(絶対主役)** | モンスター図鑑風一覧(No. 付き・コレクション感)。詳細はステータス風画面。ATK/INT 等は既存データから Domain 層で自動算出(JSON は汚さない) |
| — | FEATURED(別格) | 図鑑上部に大きく配置。**TofuRunner**(PLAY NOW → https://apps.apple.com/jp/app/tofurunner/id6755136719)と**蝶々反乱**(COMING SOON バッジ) |
| 2 | About | プレイヤーステータス風(本人を主人公キャラ化) |
| 3 | Skills | 能力値・EXP バー風(経験月数=レベル) |
| — | ナビ | 上部バー HUD 風(LV/HP 等を追加) |
| — | Updates/Timeline | サブ降格。トップには「冒険の書」ボタンのみ。中身は既存別ページ流用 |
| — | Contact | 「手紙を送る」風(既存 EmailJS フォームを演出) |
| — | コマンド | 既存デバッグコンソールを「じゅもん入力欄」として組込(最後・余裕があれば) |

Three.js 水面タイトルなどレトロに合わない既存演出は排除。

## 3. 技術スタック

- **Vite + TypeScript(strict)**。UI は自作デザインシステム(NES.css/RPGUI はアイデア借用のみ)
- UI コンポーネントは素 TS のビュー基底クラス(将来 Lit 移行の余地を残す)
- 公開: GitHub Pages + GitHub Actions 自動デプロイ。`vite base = '/portfolio/'`

## 4. アーキテクチャ(オニオン/レイヤード)

依存方向は常に内側へ。配線(new)は Composition Root(`src/main.ts`)のみ。

```
src/
├── main.ts                     # Composition Root(唯一の配線場所)
├── domain/                     # 純粋 TS。外部依存ゼロ(DOM/fetch 禁止)
│   ├── entities/               # Game, Skill, Profile など
│   ├── values/                 # GameStats, Level, Badge など値オブジェクト
│   └── services/               # ステータス自動算出などのドメインロジック
├── application/                # ユースケース。domain のみに依存
│   ├── ports/                  # リポジトリ等のインターフェース(依存性逆転の要)
│   └── usecases/               # GetGameCollection, GetPlayerStatus など
├── infrastructure/             # ports の実装。fetch/JSON/localStorage
│   ├── repositories/           # JsonGameRepository など
│   └── i18n/                   # ロケール読込
└── presentation/               # DOM。application の usecase を呼ぶだけ
    ├── components/             # View 基底クラス + 各 UI 部品
    ├── sections/               # games / about / skills / contact
    └── styles/                 # デザイントークン + セクション別 CSS
```

- **domain**: import できるのは domain 内のみ
- **application**: domain のみ import 可。外界は `ports/` のインターフェース越し
- **infrastructure / presentation**: application と domain に依存してよい。相互依存は不可
- データは `public/data/locales/{ja,en}/…json`(既存 `json/locales/` から移設)

## 5. 移行方針

既存サイト(`index.html` + `js/` + `css/`)は移行完了まで壊さず並存させる。
新実装は `src/` に構築し、セクションが揃った段階で `index.html` を差し替え、旧 `js/`・旧 CSS を撤去する。

### フェーズ

1. **基盤**: Vite + tsconfig(strict) + src/ 骨格 + データ移設 ← 今ここ
2. **Domain**: Game/Skill/Profile エンティティ、ステータス算出サービス、テスト
3. **主役 Games**: 図鑑一覧 + FEATURED + 詳細ステータス画面
4. About(プレイヤーステータス) → 5. Skills(EXP バー) → 6. Contact(手紙)
7. テーマ切替 / JP-EN / レスポンシブ
8. 旧コード撤去 + GitHub Actions デプロイ
