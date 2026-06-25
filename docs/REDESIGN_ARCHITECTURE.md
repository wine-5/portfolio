# wine-5 Portfolio — RPG 全面リデザイン 設計書

> ステータス: ドラフト（レビュー中 / 2026-06-24）
> 目的: ポートフォリオを「レトロ8bit RPG の世界」に全面リデザインし、
> 同時に**設計力そのものを面接の武器にする**（オニオン/レイヤードアーキテクチャ）。

---

## 0. ゴールと非ゴール

**ゴール**
- 開いた瞬間「この人ゲーム作る人だ」と伝わるレトロRPG世界。
- 主役順: **Games（絶対主役）→ About → Skills**。
- 拡張性の高い設計（作品やスキルを追加してもUIが自動追従）。
- 面接で語れる「層構造・依存方向・SOLID」を実コードで体現。

**非ゴール**
- 実際に遊べるゲームを作ること（あくまで“ゲームっぽい演出”）。
- 載せる情報そのものを増減すること（Updates/Timeline はサブ降格のみ）。

---

## 1. 技術スタック

| 項目 | 採用 | 理由 |
|---|---|---|
| ビルド | **Vite** | 高速・ESモジュール・静的バンドル。GitHub Pages へビルド出力 |
| 言語 | **TypeScript** | 型でドメイン/コンポーネントを安全に。設計力アピール |
| UI土台 | **自作デザインシステム**（CSS変数+コンポーネント） | 独自世界観＆拡張性。NES.css/RPGUI からはアイコン/アイデアのみ借用 |
| コンポーネント | **素のTSビューコンポーネント**（軽量基底クラス + 小さなリアクティブストア） | フレームワーク非依存・依存最小。必要なら後で Lit へ移行可 |
| データ | 既存 `json/locales/{lang}/*.json` を踏襲 | 情報を変えない方針に合致。Infra層のRepositoryが読む |
| メール | EmailJS（既存） | Contact「手紙を送る」の送信に流用 |
| ホスティング | GitHub Pages | `base` を `/portfolio/` に設定、`docs/` へビルド出力 |

**フォント**: 見出し/UI=`DotGothic16`＋英字ロゴ=`Press Start 2P` / 本文=読みやすいゴシック（`BIZ UDPGothic` 等）。`image-rendering: pixelated` でドットをパキッと。

---

## 2. アーキテクチャ（オニオン / レイヤード）

依存は**常に内向き**。Domain は何にも依存しない。外側（Infra/UI）は内側のインターフェース（ポート）に依存し、具体実装は Composition Root で注入する。

```
        ┌─────────────────────────────────────────┐
        │              Presentation (UI)           │  ← DOM / CSS / components
        │   TitleScreen, HudNav, GameCodex, ...     │
        ├─────────────────────────────────────────┤
        │             Infrastructure               │  ← JSON, EmailJS, localStorage
        │   JsonProjectRepository, EmailJsGateway   │
        ├─────────────────────────────────────────┤
        │              Application                 │  ← use-cases / view-models
        │   GetCodexEntries, GetFeaturedGames, ...  │
        ├─────────────────────────────────────────┤
        │                 Domain                   │  ← 純粋TS。フレームワーク非依存
        │   Project, Skill, ExperienceLevel, ports  │
        └─────────────────────────────────────────┘
   依存方向:  UI → Application → Domain
              Infra → Application/Domain（ポート実装）
              wiring は Composition Root のみが知る
```

### 2.1 Domain（中心 / 純粋）
- **Entities**: `Project`(ゲーム作品), `Skill`, `Profile`, `UpdateLog`, `TimelineEntry`
- **Value Objects**: `TechStack`, `Platform`, `ExperienceLevel`(経験月数→Lv/EXP), `FeaturedKind`(`appstore-published` | `store-coming-soon` | `none`), `CodexNo`, `GameStat`(ATK/DEF/INT風メタ)
- **Domain Services**: `SkillLeveling`(月数→レベル/EXPバー), `CodexCatalog`(No.採番・並び), `FeaturedPolicy`(看板判定)
- **Ports（インターフェース）**: `ProjectRepository`, `SkillRepository`, `ProfileRepository`, `LocalizationRepository`

### 2.2 Application（ユースケース）
- `GetCodexEntries`（図鑑一覧VM）/ `GetFeaturedGames`（看板作品VM）/ `GetGameDetail`（ステータス画面VM）
- `GetSkillSheet`（能力値・EXPバーVM）/ `GetProfile`（プレイヤーステータスVM）
- `SubmitContactLetter`（手紙送信）/ `ChangeLanguage` / `ToggleTheme`（昼/夜）/ `RunSpellCommand`（じゅもん/コマンド）
- **ViewModel(DTO)**: UIが必要とする形に整形（Domainを直接UIへ漏らさない）

### 2.3 Infrastructure（アダプタ）
- `JsonProjectRepository` / `JsonSkillRepository` / `JsonProfileRepository`（`json/locales/{lang}/` を fetch）
- `EmailJsContactGateway`（Contact送信）
- `LocalStoragePreferenceStore`（テーマ/言語の永続化）
- `I18nProvider`（日英）

### 2.4 Presentation（UI / 自作デザインシステム）
- **Composition Root**: `app/composition-root.ts` が Infra→App→UI を配線（DI）
- **基底**: `Component`（lifecycle: mount/render/destroy）, `Store`（小さな購読型ステート）, `EventBus`
- **コンポーネント**（節3にセクション対応）

---

## 3. セクション別 UI 仕様（決定事項）

| # | セクション | 演出 | 主なコンポーネント |
|---|---|---|---|
| 0 | 起動 | **PRESS START風タイトルを1秒未満で自動遷移**（入力待ちなし） | `TitleScreen` |
| - | ナビ | 上部バーHUD風（ドット化・LV/HP表示） | `HudNav`, `StatusBar` |
| 1 | **Games（主役）** | **モンスター図鑑風**一覧。上部に**看板作品(FEATURED)を別格表示** | `FeaturedGameBanner`, `GameCodex`, `CodexEntryCard` |
| 1b | Games詳細 | **ステータス画面風**（ジャンル/技術/担当/受賞をパラメータ表示） | `GameStatusModal` |
| 2 | About | **プレイヤーステータス風**（本人を主人公キャラ化） | `PlayerStatusCard` |
| 3 | Skills | **能力値・EXPバー風**（経験月数=Lv/EXP） | `SkillSheet`, `ExpBar` |
| 4 | Updates/Timeline | サブ降格。トップは**「冒険の書」ボタンのみ** | `AdventureLogButton` |
| 5 | Contact | **「手紙を送る」風**フォーム（EmailJS） | `ContactLetter` |
| + | コマンド | 既存デバッグコンソールを**「じゅもん/コマンド入力欄」**として世界観に統合 | `SpellConsole` |

**看板作品（FEATURED）**
- `TofuRunner` … AppStore公開済み → `install`(apps.apple.com/.../tofurunner) を「**PLAY NOW**」リンクに。
- `蝶々反乱` … Store公開予定 → 「**COMING SOON**」バッジ。

**残す機能**: 日英切替 / テーマ切替（昼=light・夜=dark のRPGマップ演出）。
**排除**: Three.js 水面反射タイトルなどレトロに合わないリアル系演出。

---

## 4. ディレクトリ構成（提案）

```
Portfolio/
├─ index.html                 # Viteエントリ
├─ vite.config.ts             # base:'/portfolio/', build.outDir:'docs'
├─ tsconfig.json
├─ package.json
├─ public/                    # そのまま配信（画像・フォント・JSONデータ）
│   ├─ images/  ├─ fonts/  └─ data/locales/{ja,en}/*.json   (現 json/ を移設)
├─ src/
│   ├─ domain/
│   │   ├─ entities/        (Project.ts, Skill.ts, Profile.ts, ...)
│   │   ├─ value-objects/   (ExperienceLevel.ts, FeaturedKind.ts, ...)
│   │   ├─ services/        (SkillLeveling.ts, CodexCatalog.ts)
│   │   └─ repositories/    (ports: ProjectRepository.ts, ...)
│   ├─ application/
│   │   ├─ use-cases/       (GetCodexEntries.ts, ...)
│   │   ├─ view-models/     (CodexEntryVM.ts, GameDetailVM.ts, ...)
│   │   └─ ports/           (ContactGateway.ts, PreferenceStore.ts)
│   ├─ infrastructure/
│   │   ├─ repositories/    (JsonProjectRepository.ts, ...)
│   │   ├─ gateways/        (EmailJsContactGateway.ts)
│   │   ├─ i18n/            (I18nProvider.ts)
│   │   └─ storage/         (LocalStoragePreferenceStore.ts)
│   ├─ presentation/
│   │   ├─ core/            (Component.ts, Store.ts, EventBus.ts)
│   │   ├─ components/      (各UIコンポーネント)
│   │   └─ styles/          (design-system: tokens.css, base, components, sections)
│   ├─ app/
│   │   └─ composition-root.ts   (DI配線)
│   └─ main.ts              (bootstrap)
└─ docs/                      # ★ビルド出力（GitHub Pages配信先）
```

> 既存 `js/` `assets/` `css/` は移行後に削除。`pages/`（timeline/history/legal）は当面そのまま流用し、順次デザイン統合。

---

## 5. データ拡張（最小限）

`projects.json` に看板フラグを追加（情報量は増やさない範囲）:
```jsonc
// TofuRunner
"featured": "appstore-published",   // install を PLAY NOW に
// 蝶々反乱
"featured": "store-coming-soon"     // COMING SOON バッジ
```
図鑑No.・GameStat（ATK/INT等の見せ方）は **Domain側で導出**し、JSONは汚さない。

---

## 6. 進め方（段階）

1. **本設計書の合意**（←今ここ）
2. Vite+TS 雛形・ディレクトリ・デザイントークン（CSS変数/フォント/色）整備
3. Domain → Application → Infrastructure を先に組む（UIなしで型と境界を確定）
4. Presentation: TitleScreen / HudNav → **Games（看板+図鑑+ステータス）** を最優先
5. About → Skills → Contact → SpellConsole → 冒険の書ボタン
6. テーマ(昼/夜)・日英・レスポンシブ・微演出（ドットアニメ）
7. 旧 `js/assets/css` 撤去、`docs/` ビルド & Pages 設定

---

## 7. 確定事項（レビュー済み 2026-06-24）
- [x] データ配置: `json/` → `public/data/locales/` へ移設する
- [x] GitHub Pages 配信元: **gh-pages ブランチ + GitHub Actions で自動デプロイ**（main push トリガ）。`vite.config.ts` の `base` は `/portfolio/`
- [x] コンポーネント: 素TSビュー基底クラスで進める（後で Lit 移行余地あり）
- [x] 図鑑の GameStat: **既存データから自動算出**（期間/チーム規模/技術数/受賞などを Domain で導出。JSONは汚さない）
- [x] 作業ブランチ: 現在の `feature/update-ingame-style` のまま
- [x] ドット素材: **フリー(CC0, Kenney等) のドット素材**を探して活用（不足はCSS描画/絵文字/Font Awesemeで補完）
- [x] サウンド: 入れない
- [x] じゅもん/コマンド入力欄: 初期は実装しない（最後に余裕があれば追加）
