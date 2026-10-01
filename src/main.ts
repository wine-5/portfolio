/**
 * Composition Root。
 * 具象クラスの new と配線はこのファイルだけで行う(他層は interface 依存)。
 */
import { GetGameCollection } from '@application/usecases/GetGameCollection';
import { GetPlayerProfile } from '@application/usecases/GetPlayerProfile';
import { GetPlayerSkills } from '@application/usecases/GetPlayerSkills';
import { GetNews } from '@application/usecases/GetNews';
import { GetInternships } from '@application/usecases/GetInternships';
import { JsonGameRepository } from '@infrastructure/repositories/JsonGameRepository';
import { JsonProfileRepository } from '@infrastructure/repositories/JsonProfileRepository';
import { JsonSkillRepository } from '@infrastructure/repositories/JsonSkillRepository';
import { JsonNewsRepository } from '@infrastructure/repositories/JsonNewsRepository';
import { JsonInternshipRepository } from '@infrastructure/repositories/JsonInternshipRepository';
import { App } from '@presentation/App';
import { detectLocale } from '@presentation/i18n/localePreference';
import { detectTheme, applyTheme } from '@presentation/theme/themePreference';
import { CyberBackground } from '@presentation/components/CyberBackground';
import { supportsWebGL } from '@presentation/util/webgl';
import { setupSmoothScroll } from '@presentation/managers/SmoothScrollManager';
import './presentation/styles/main.css';

// 描画前にテーマを確定させ、初期表示のちらつきを防ぐ
applyTheme(detectTheme());

// 常時動き続ける背景(言語切り替えの再描画に巻き込まれないよう body 直下に置く)。
// WebGL が使えれば Three.js の奥行き背景、使えなければ 2D Canvas の背景にする。
// Three.js は重いので、初期表示を妨げないよう遅延読み込みする
if (supportsWebGL()) {
  import('@presentation/components/DepthBackground')
    .then(({ DepthBackground }) => new DepthBackground().start(document.body))
    .catch(() => new CyberBackground().start(document.body));
} else {
  new CyberBackground().start(document.body);
}

// アンカーリンククリック時に加速度付きスクロール
setupSmoothScroll();

const baseUrl = import.meta.env.BASE_URL;

const app = new App(
  document.getElementById('app')!,
  new GetGameCollection(new JsonGameRepository(baseUrl)),
  new GetPlayerProfile(new JsonProfileRepository(baseUrl)),
  new GetPlayerSkills(new JsonSkillRepository(baseUrl)),
  new GetNews(new JsonNewsRepository(baseUrl)),
  new GetInternships(new JsonInternshipRepository(baseUrl)),
);

void app.start(detectLocale());
