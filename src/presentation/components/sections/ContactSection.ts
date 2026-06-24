import { Component } from '../../core/Component';
import { root } from '@app/composition-root';

/**
 * Contact セクション: 手紙フォーム + 冒険の書ボタン。
 */
export class ContactSection extends Component {
  render(): HTMLElement {
    const section = document.createElement('section');
    section.id = 'contact';
    section.className = 'contact-section section';

    const title = document.createElement('h2');
    title.className = 'section__title';
    title.textContent = '▸ SEND A LETTER';
    section.appendChild(title);

    const container = document.createElement('div');
    container.className = 'contact-container';

    // 手紙フォーム
    const form = document.createElement('form');
    form.className = 'contact-form';

    const nameGroup = document.createElement('div');
    nameGroup.className = 'form-group';
    const nameLabel = document.createElement('label');
    nameLabel.textContent = '名前:';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.name = 'name';
    nameInput.className = 'form-input';
    nameInput.placeholder = '冒険者の名前...';
    nameGroup.appendChild(nameLabel);
    nameGroup.appendChild(nameInput);
    form.appendChild(nameGroup);

    const emailGroup = document.createElement('div');
    emailGroup.className = 'form-group';
    const emailLabel = document.createElement('label');
    emailLabel.textContent = 'メール:';
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.name = 'email';
    emailInput.className = 'form-input';
    emailInput.placeholder = 'your@example.com';
    emailGroup.appendChild(emailLabel);
    emailGroup.appendChild(emailInput);
    form.appendChild(emailGroup);

    const msgGroup = document.createElement('div');
    msgGroup.className = 'form-group';
    const msgLabel = document.createElement('label');
    msgLabel.textContent = 'メッセージ:';
    const msgTextarea = document.createElement('textarea');
    msgTextarea.name = 'message';
    msgTextarea.className = 'form-textarea';
    msgTextarea.placeholder = '伝言を残す...';
    msgTextarea.rows = 5;
    msgGroup.appendChild(msgLabel);
    msgGroup.appendChild(msgTextarea);
    form.appendChild(msgGroup);

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn btn--primary contact-form__submit';
    submitBtn.textContent = '送信する ▸';
    form.appendChild(submitBtn);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = (nameInput as HTMLInputElement).value;
      const email = (emailInput as HTMLInputElement).value;
      const message = (msgTextarea as HTMLTextAreaElement).value;

      try {
        const result = await root.submitContactLetter.execute(name, email, message);
        if (result.success) {
          alert('手紙を送信しました！ありがとうございます。');
          form.reset();
        } else {
          alert('送信に失敗しました。もう一度お試しください。');
        }
      } catch (err) {
        console.error('Contact form error:', err);
        alert('エラーが発生しました。');
      }
    });

    container.appendChild(form);

    // 冒険の書ボタン
    const logBtn = document.createElement('div');
    logBtn.className = 'adventure-log-button';
    const logBtnLink = document.createElement('a');
    logBtnLink.href = '#update-history';
    logBtnLink.className = 'btn btn--secondary';
    logBtnLink.innerHTML = '📖 冒険の書を読む';
    logBtn.appendChild(logBtnLink);
    container.appendChild(logBtn);

    section.appendChild(container);
    return section;
  }
}

/**
 * Contact Section CSS。
 */
export const CONTACT_SECTION_STYLES = `
.contact-section {
  background: transparent;
}

.contact-container {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.contact-form {
  border: 3px solid var(--line);
  background: var(--bg-window);
  padding: var(--space-6);
  box-shadow: var(--window-shadow);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-group label {
  font-family: var(--font-pixel);
  font-size: var(--fs-sm);
  color: var(--ink);
}

.form-input,
.form-textarea {
  padding: var(--space-2);
  border: 2px solid var(--line);
  background: var(--bg-1);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: var(--fs-sm);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 4px var(--accent);
}

.contact-form__submit {
  padding: var(--space-3) var(--space-4);
  margin-top: var(--space-2);
}

.adventure-log-button {
  text-align: center;
}

.adventure-log-button .btn {
  padding: var(--space-3) var(--space-6);
  font-size: var(--fs-lg);
}

.btn--secondary {
  border: 2px solid var(--line);
  background: var(--bg-1);
  color: var(--ink);
  transition: all 150ms;
}

.btn--secondary:hover {
  background: var(--ink);
  color: var(--bg-primary);
}
`;
