import { View } from './View';

/** システムブート風の起動画面。入力待ちせず 1 秒未満で自動的に消える */
export class BootScreen extends View {
  private static readonly DURATION_MS = 900;

  override render(): void {
    this.el.className = 'boot-screen';
    this.el.innerHTML = `
      <div class="boot-screen__inner">
        <p class="boot-screen__title">Wine-5 Portfolio</p>
        <div class="boot-screen__press" role="presentation"></div>
      </div>
    `;
  }

  /** 表示して自動遷移し、完了を resolve する */
  play(parent: HTMLElement): Promise<void> {
    this.render();
    this.mount(parent);
    return new Promise((resolve) => {
      window.setTimeout(() => {
        this.el.classList.add('boot-screen--out');
        window.setTimeout(() => {
          this.unmount();
          resolve();
        }, 200);
      }, BootScreen.DURATION_MS);
    });
  }
}
