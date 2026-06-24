import { Component } from '../core/Component';

/**
 * 起動画面: PRESS START 風タイトル。
 * 1秒未満で自動でメインへ遷移。
 */
export class TitleScreen extends Component {
  private onComplete: () => void = () => {};

  setOnComplete(callback: () => void): void {
    this.onComplete = callback;
  }

  render(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'title-screen';

    const inner = document.createElement('div');
    inner.className = 'title-screen__inner';

    const logo = document.createElement('h1');
    logo.className = 'title-screen__logo';
    logo.textContent = 'WINE-5';

    const subtitle = document.createElement('p');
    subtitle.className = 'title-screen__subtitle';
    subtitle.textContent = '🎮 RPG WORLD 🎮';

    const prompt = document.createElement('p');
    prompt.className = 'title-screen__prompt';
    prompt.textContent = '> PRESS START';

    inner.appendChild(logo);
    inner.appendChild(subtitle);
    inner.appendChild(prompt);
    container.appendChild(inner);

    return container;
  }

  protected onMounted(): void {
    // 1秒未満で自動遷移
    setTimeout(() => {
      this.onComplete();
    }, 800); // 800ms
  }
}

/**
 * TitleScreen CSS。
 */
export const TITLE_SCREEN_STYLES = `
.title-screen {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-0);
  z-index: 10000;
  font-family: var(--font-pixel-en);
  animation: title-fade-in 0.3s ease-out;
}

@keyframes title-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.title-screen__inner {
  text-align: center;
  animation: title-bounce 0.5s ease-in-out;
}

@keyframes title-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.title-screen__logo {
  font-size: var(--fs-3xl);
  color: var(--accent);
  margin-bottom: var(--space-4);
  letter-spacing: 0.1em;
  text-shadow: 2px 2px 0 var(--line);
}

.title-screen__subtitle {
  font-size: var(--fs-xl);
  color: var(--ink-dim);
  margin-bottom: var(--space-6);
}

.title-screen__prompt {
  font-size: var(--fs-lg);
  color: var(--select);
  animation: title-blink 1s steps(2, end) infinite;
}

@keyframes title-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0.3; }
}
`;
