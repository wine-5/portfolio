/**
 * ポート: 問い合わせ送信ゲートウェイ。
 * EmailJS など外部サービスを抽象化。
 */
export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export interface ContactGateway {
  sendContactLetter(msg: ContactMessage): Promise<{ success: boolean; messageId?: string }>;
}
