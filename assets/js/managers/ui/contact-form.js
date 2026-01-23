/* ===================================
   コンタクトフォーム管理クラス
   =================================== */
class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.emailService = null;
    }

    init() {
        this.initEmailService();
        this.setupFormSubmission();
        this.setupFormValidation();
    }

    initEmailService() {
        try {
            this.emailService = new EmailService();
        } catch (error) {
            // メール送信初期化エラーハンドリング
            this.showMessage('メール送信機能の初期化に失敗しました。', 'error');
        }
    }

    setupFormSubmission() {
        this.form?.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    setupFormValidation() {
        // リアルタイムバリデーション
        const inputs = this.form?.querySelectorAll('.form__input, .form__textarea');
        inputs?.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (field.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = '正しいメールアドレスを入力してください';
                }
                break;
            case 'text':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = '2文字以上入力してください';
                }
                break;
            default:
                if (value.length < 10) {
                    isValid = false;
                    errorMessage = '10文字以上入力してください';
                }
        }

        this.toggleFieldError(field, !isValid, errorMessage);
        return isValid;
    }

    toggleFieldError(field, hasError, message) {
        const errorElement = field.parentNode.querySelector('.field-error');
        
        if (hasError) {
            if (!errorElement) {
                const error = document.createElement('div');
                error.className = 'field-error';
                error.textContent = message;
                error.style.cssText = `
                    color: #ef4444;
                    font-size: 1.2rem;
                    margin-top: 0.5rem;
                `;
                field.parentNode.appendChild(error);
            }
            field.style.borderColor = '#ef4444';
        } else {
            errorElement?.remove();
            field.style.borderColor = '';
        }
    }

    clearFieldError(field) {
        const errorElement = field.parentNode.querySelector('.field-error');
        errorElement?.remove();
        field.style.borderColor = '';
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.emailService) {
            this.showMessage('メール送信機能が利用できません。', 'error');
            return;
        }

        // フォーム全体のバリデーション
        const formData = new FormData(this.form);
        const templateParams = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message'),
            // 追加情報
            timestamp: new Date().toLocaleString('ja-JP'),
            source: 'wine-5 Portfolio Website'
        };

        try {
            // バリデーション
            this.emailService.validateTemplateParams(templateParams);
            
            this.showLoading(true);
            
            // メール送信
            await this.emailService.sendEmail(templateParams);
            
            this.showMessage('メッセージが送信されました！ご連絡ありがとうございます。', 'success');
            this.form.reset();
            this.clearAllFieldErrors();
            
        } catch (error) {
            // メール送信エラーハンドリング
            let errorMessage = '送信に失敗しました。';
            if (error.message.includes('Required fields')) {
                errorMessage = '必須項目を入力してください。';
            } else if (error.message.includes('Invalid email')) {
                errorMessage = '正しいメールアドレスを入力してください。';
            } else {
                errorMessage += 'もう一度お試しください。';
            }
            
            this.showMessage(errorMessage, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    clearAllFieldErrors() {
        const errorElements = this.form?.querySelectorAll('.field-error');
        errorElements?.forEach(error => error.remove());
        
        const inputs = this.form?.querySelectorAll('.form__input, .form__textarea');
        inputs?.forEach(input => {
            input.style.borderColor = '';
        });
    }

    showMessage(message, type) {
        // 既存のメッセージを削除
        const existingMessage = document.querySelector('.form-message');
        existingMessage?.remove();

        // 新しいメッセージを作成
        const messageElement = document.createElement('div');
        messageElement.className = `form-message form-message--${type}`;
        messageElement.textContent = message;
        
        const baseStyles = `
            padding: 1.5rem;
            margin-top: 2rem;
            border-radius: 8px;
            font-weight: 500;
            text-align: center;
            animation: slideInUp 0.3s ease;
        `;
        
        messageElement.style.cssText = baseStyles + (type === 'success' 
            ? 'background-color: #10b981; color: white;' 
            : 'background-color: #ef4444; color: white;');

        this.form?.appendChild(messageElement);

        // アニメーション用CSS追加
        if (!document.querySelector('#message-animation-style')) {
            const style = document.createElement('style');
            style.id = 'message-animation-style';
            style.textContent = `
                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(1rem);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // 5秒後にメッセージを削除
        setTimeout(() => {
            messageElement?.remove();
        }, 5000);
    }

    showLoading(show) {
        const submitButton = this.form?.querySelector('[type="submit"]');
        if (!submitButton) return;

        if (show) {
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            submitButton.style.opacity = '0.7';
        } else {
            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
            submitButton.style.opacity = '1';
        }
    }
}