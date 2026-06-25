/**
 * 基底: シンプルな購読型ストア。
 */
export type Listener<T> = (state: T) => void;

export class Store<T> {
  private state: T;
  private listeners: Set<Listener<T>> = new Set();

  constructor(initialState: T) {
    this.state = initialState;
  }

  getState(): T {
    return this.state;
  }

  setState(newState: T | ((prev: T) => T)): void {
    const updated = typeof newState === 'function' ? (newState as (prev: T) => T)(this.state) : newState;
    this.state = updated;
    this.notifyListeners();
  }

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }
}
