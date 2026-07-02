/**
 * Composition Root。
 * 具象クラスの new と配線はこのファイルだけで行う(他層は interface 依存)。
 */
import { GetGameCollection } from '@application/usecases/GetGameCollection';
import { JsonGameRepository } from '@infrastructure/repositories/JsonGameRepository';
import { App } from '@presentation/App';
import './presentation/styles/main.css';

const baseUrl = import.meta.env.BASE_URL;

const app = new App(
  document.getElementById('app')!,
  new GetGameCollection(new JsonGameRepository(baseUrl)),
);

void app.start('ja');
