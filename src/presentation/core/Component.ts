/**
 * 基底: UIコンポーネント。
 * シンプルなライフサイクル管理。
 */
export abstract class Component {
  protected element: HTMLElement | null = null;

  abstract render(): HTMLElement;

  mount(parentSelector: string | HTMLElement): void {
    const parent = typeof parentSelector === 'string' ? document.querySelector(parentSelector) : parentSelector;
    if (!parent) throw new Error('Parent element not found');

    this.element = this.render();
    parent.appendChild(this.element);
    this.onMounted();
  }

  unmount(): void {
    if (this.element?.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.onUnmounted();
  }

  protected onMounted(): void {}
  protected onUnmounted(): void {}
}
