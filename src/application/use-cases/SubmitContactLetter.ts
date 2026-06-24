import { ContactGateway, ContactMessage } from '../ports/ContactGateway';

/**
 * ユースケース: 手紙(問い合わせ)を送信。
 */
export class SubmitContactLetter {
  constructor(private contactGateway: ContactGateway) {}

  async execute(name: string, email: string, message: string): Promise<{ success: boolean; messageId?: string }> {
    // バリデーション
    if (!name?.trim()) throw new Error('名前は必須です');
    if (!email?.trim()) throw new Error('メールアドレスは必須です');
    if (!message?.trim()) throw new Error('メッセージは必須です');

    const msg: ContactMessage = {
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    };

    return this.contactGateway.sendContactLetter(msg);
  }
}
