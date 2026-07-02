/**
 * Composition Root。
 * 具象クラスの new と配線はこのファイルだけで行う(他層は interface 依存)。
 */
import { GetGameCollection } from '@application/usecases/GetGameCollection';
import { GetPlayerSkills } from '@application/usecases/GetPlayerSkills';
import { JsonGameRepository } from '@infrastructure/repositories/JsonGameRepository';
import { JsonSkillRepository } from '@infrastructure/repositories/JsonSkillRepository';
import { App } from '@presentation/App';
import './presentation/styles/main.css';

const baseUrl = import.meta.env.BASE_URL;

const app = new App(
  document.getElementById('app')!,
  new GetGameCollection(new JsonGameRepository(baseUrl)),
  new GetPlayerSkills(new JsonSkillRepository(baseUrl)),
);

void app.start('ja');
