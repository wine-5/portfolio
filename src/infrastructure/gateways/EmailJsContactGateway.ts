import type { ContactGateway, ContactMessage } from '@application/ports/ContactGateway';

/**
 * 実装: EmailJS を使用した問い合わせ送信ゲートウェイ。
 */
export class EmailJsContactGateway implements ContactGateway {
  private serviceId = 'service_a4l75fb';
  private templateId = 'template_hm3yktf';

  async sendContactLetter(msg: ContactMessage): Promise<{ success: boolean; messageId?: string }> {
    try {
      // EmailJS は window.emailjs のグローバルを使用
      const emailjs = (window as any).emailjs;
      if (!emailjs) {
        throw new Error('EmailJS not loaded');
      }

      const response = await emailjs.send(this.serviceId, this.templateId, {
        from_name: msg.name,
        from_email: msg.email,
        message: msg.message,
        to_email: 'yuto.imata.wine@gmail.com',
      });

      return {
        success: true,
        messageId: response.status === 200 ? (response as any).text : undefined,
      };
    } catch (error) {
      console.error('EmailJsContactGateway error:', error);
      return { success: false };
    }
  }
}
