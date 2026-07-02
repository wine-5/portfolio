/**
 * Composition Root。
 * 具象クラスの new と配線はこのファイルだけで行う(他層は interface 依存)。
 */
import { GetGameCollection } from '@application/usecases/GetGameCollection';
import { GetPlayerProfile } from '@application/usecases/GetPlayerProfile';
import { GetNews } from '@application/usecases/GetNews';
import { JsonGameRepository } from '@infrastructure/repositories/JsonGameRepository';
import { JsonProfileRepository } from '@infrastructure/repositories/JsonProfileRepository';
import { JsonNewsRepository } from '@infrastructure/repositories/JsonNewsRepository';
import { App } from '@presentation/App';
import './presentation/styles/main.css';

const baseUrl = import.meta.env.BASE_URL;

const app = new App(
  document.getElementById('app')!,
  new GetGameCollection(new JsonGameRepository(baseUrl)),
  new GetPlayerProfile(new JsonProfileRepository(baseUrl)),
  new GetNews(new JsonNewsRepository(baseUrl)),
);

void app.start('ja');
