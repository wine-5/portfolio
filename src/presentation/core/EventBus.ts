/**
 * 基底: イベントバス。
 * グローバルなイベント通信用。
 */
export type EventListener<T = any> = (event: T) => void;

export class EventBus {
  private listeners: Map<string, Set<EventListener>> = new Map();

  on<T = any>(eventName: string, listener: EventListener<T>): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)!.add(listener as EventListener);

    return () => {
      this.listeners.get(eventName)?.delete(listener as EventListener);
    };
  }

  emit(eventName: string, data?: any): void {
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      listeners.forEach((listener) => listener(data));
    }
  }

  off(eventName: string): void {
    this.listeners.delete(eventName);
  }
}
