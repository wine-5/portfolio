/**
 * 全 UI コンポーネントの基底クラス。
 * 素 TS で最小限に保ち、将来 Lit 等へ移行できる形にしておく。
 */
export abstract class View<TProps = void> {
  protected readonly el: HTMLElement;

  constructor(tagName = 'div', className = '') {
    this.el = document.createElement(tagName);
    if (className) this.el.className = className;
  }

  /** props から DOM を(再)構築する */
  abstract render(props: TProps): void;

  mount(parent: HTMLElement): void {
    parent.appendChild(this.el);
  }

  unmount(): void {
    this.el.remove();
  }
}
