/* ===================================
   EmailJS設定ファイル
   =================================== */

// EmailJSの設定情報
const EMAIL_CONFIG = {
    // EmailJS Public Key
    publicKey: 'JrulMP-Mi8egamGmO',
    
    // EmailJS Service ID  
    serviceId: 'service_b21lewr',
    
    // Template IDs
    notificationTemplateId: 'template_5459usq',  // ForMe (wine-5受信用)
    autoReplyTemplateId: 'template_4wiqzmg'      // ForOpponent (自動返信用)
};

/* ===================================
   EmailJS初期化とメール送信機能
   =================================== */
class EmailService {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    init() {
        try {
            if (typeof emailjs !== 'undefined') {
                emailjs.init(EMAIL_CONFIG.publicKey);
                this.isInitialized = true;
            } else {
                // EmailJSライブラリ未読み込み
            }
        } catch (error) {
        }
    }

    async sendEmail(templateParams) {
        if (!this.isInitialized) {
            throw new Error('EmailJS not initialized');
        }

        try {
            // 通知メール送信（wine-5受信用）- ForMe Template
            const notificationData = {
                user_name: templateParams.name,
                user_email: templateParams.email,
                message: templateParams.message,
                submit_time: templateParams.timestamp
            };

            const notificationResponse = await emailjs.send(
                EMAIL_CONFIG.serviceId,
                EMAIL_CONFIG.notificationTemplateId,
                notificationData
            );

            // 自動返信メール送信（お問い合わせ者向け）- ForOpponent Template
            const autoReplyData = {
                to_name: templateParams.name,
                to_email: templateParams.email,
                user_message: templateParams.message,
                submit_time: templateParams.timestamp,
                reply_to: 'yuto.imata.wine@gmail.com'  // wine-5の返信用メールアドレス
            };

            const autoReplyResponse = await emailjs.send(
                EMAIL_CONFIG.serviceId,
                EMAIL_CONFIG.autoReplyTemplateId,
                autoReplyData
            );
            
            return { notificationResponse, autoReplyResponse };
        } catch (error) {
            throw error;
        }
    }

    // テンプレートパラメータの検証
    validateTemplateParams(params) {
        const required = ['name', 'email', 'message'];
        const missing = required.filter(field => !params[field] || params[field].trim() === '');
        
        if (missing.length > 0) {
            throw new Error(`Required fields missing: ${missing.join(', ')}`);
        }

        // メールアドレスの簡単な検証
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(params.email)) {
            throw new Error('Invalid email address');
        }

        return true;
    }
}

// グローバルに公開
window.EmailService = EmailService;