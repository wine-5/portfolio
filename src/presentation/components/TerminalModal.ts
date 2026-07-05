import { View } from './View';
import { esc } from '../util/html';
import { t } from '../i18n/uiStrings';
import '../styles/terminal.css';

interface Command {
  name: string;
  description: string;
  details: string;
}

interface TerminalModalProps {
  readonly onClose: () => void;
  readonly commands: readonly Command[];
}

export class TerminalModal extends View<TerminalModalProps> {
  private input?: HTMLInputElement;
  private output?: HTMLElement;
  private commandHistory: string[] = [];
  private historyIndex: number = -1;

  constructor() {
    super('div', 'terminal-modal');
  }

  override render(props: TerminalModalProps): void {
    this.el.innerHTML = `
      <div class="terminal-modal__backdrop"></div>
      <div class="terminal-modal__window">
        <div class="terminal-modal__header">
          <span class="terminal-modal__title">Terminal</span>
          <button class="terminal-modal__close" aria-label="Close terminal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="terminal-modal__body">
          <div class="terminal-modal__output" id="terminal-output"></div>
          <div class="terminal-modal__input-line">
            <span class="terminal-modal__prompt">$ </span>
            <input
              type="text"
              class="terminal-modal__input"
              id="terminal-input"
              spellcheck="false"
              autocomplete="off"
              aria-label="Command input"
            />
          </div>
        </div>
      </div>
    `;

    this.input = this.el.querySelector<HTMLInputElement>('#terminal-input')!;
    this.output = this.el.querySelector<HTMLElement>('#terminal-output')!;

    this.el.querySelector<HTMLButtonElement>('.terminal-modal__close')!.addEventListener('click', props.onClose);
    this.el.querySelector<HTMLElement>('.terminal-modal__backdrop')!.addEventListener('click', props.onClose);

    this.input.addEventListener('keydown', (e) => this.handleInput(e, props.commands));

    this.printOutput('Wine-5 Terminal v1.0', 'system');
    this.printOutput('Type "help" to see available commands.', 'hint');
    this.printOutput('');

    setTimeout(() => this.input?.focus(), 100);
  }

  override mount(parent: HTMLElement): void {
    super.mount(parent);
    document.body.style.overflow = 'hidden';
  }

  override unmount(): void {
    document.body.style.overflow = '';
    super.unmount();
  }

  private handleInput(e: KeyboardEvent, commands: readonly Command[]): void {
    if (e.key === 'Enter') {
      const input = this.input!.value.trim();
      if (!input) return;

      this.printOutput(`$ ${esc(input)}`, 'command');
      this.commandHistory.push(input);
      this.historyIndex = -1;
      this.executeCommand(input, commands);
      this.input!.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.historyIndex = Math.min(this.historyIndex + 1, this.commandHistory.length - 1);
      if (this.historyIndex >= 0) {
        this.input!.value = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex] ?? '';
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.historyIndex = Math.max(this.historyIndex - 1, -1);
      if (this.historyIndex >= 0) {
        this.input!.value = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex] ?? '';
      } else {
        this.input!.value = '';
      }
    }
  }

  private executeCommand(input: string, commands: readonly Command[]): void {
    const parts = input.split(/\s+/);
    const firstWord = (parts[0] ?? '').toLowerCase();

    if (firstWord === 'help') {
      this.printOutput('Available commands:', 'output');
      commands.forEach((cmd) => {
        this.printOutput(`  ${cmd.name.padEnd(35)} - ${cmd.description}`, 'output');
      });
    } else if (firstWord === 'portfolio') {
      this.printOutput('Loading portfolio...', 'output');
      this.printOutput('See the Games section above for all projects.', 'output');
    } else if (firstWord === 'skills') {
      this.printOutput('Loading skills...', 'output');
      this.printOutput('See the Skills section for detailed expertise.', 'output');
    } else if (firstWord === 'contact') {
      this.printOutput('Contact Information:', 'output');
      this.printOutput('Email: yuto.imata.wine@gmail.com', 'output');
      this.printOutput('GitHub: https://github.com/wine-5', 'link');
    } else if (firstWord === 'resume') {
      this.printOutput('Resume/CV:', 'output');
      this.printOutput('See the About section for career summary.', 'output');
    } else if (firstWord === 'whoami') {
      this.printOutput('Wine-5 - Game Developer & Software Engineer', 'output');
      this.printOutput('Specialist in Unity, C#, TypeScript, and full-stack development.', 'output');
    } else if (firstWord === 'status') {
      this.printOutput('Current Status:', 'output');
      this.printOutput('Portfolio: 15 game projects', 'output');
      this.printOutput('Languages: C#, C++, TypeScript, JavaScript, and more', 'output');
      this.printOutput('Tools: Unity, Visual Studio Code, Git, GitHub Actions', 'output');
    } else if (firstWord === 'git') {
      this.executeGitCommand(parts.slice(1), commands);
    } else {
      this.printOutput(`command not found: ${input}`, 'error');
      this.printOutput('Type "help" for available commands.', 'hint');
    }

    this.printOutput('');
    this.output!.scrollTop = this.output!.scrollHeight;
  }

  private executeGitCommand(args: string[], commands: readonly Command[]): void {
    const subcommand = args[0]?.toLowerCase();

    if (subcommand === 'clone') {
      const url = args.slice(1).join(' ') || 'https://github.com/wine-5';
      this.printOutput(`Cloning into '${url}'...`, 'output');
      this.printOutput('remote: Repository found', 'output');
      this.printOutput('Unpacking objects: 100% (256/256), 12.45 MiB | 5.23 MiB/s', 'output');
      this.printOutput(`Repository cloned to ./wine-5`, 'output');
    } else if (subcommand === 'log') {
      this.printOutput('Commit History (Projects by creation date):', 'output');
      this.printOutput('', 'output');
      const projectCmd = commands.find((c) => c.name === 'git log --oneline');
      if (projectCmd) {
        this.printOutput(projectCmd.details, 'output');
      }
    } else if (subcommand === 'status') {
      this.printOutput('On branch: main', 'output');
      this.printOutput('Your branch is up to date with origin/main.', 'output');
      this.printOutput('', 'output');
      this.printOutput('Changes not staged for commit:', 'output');
      this.printOutput('  modified: portfolio (15 games)', 'output');
      this.printOutput('  modified: skills (10+ languages)', 'output');
      this.printOutput('  modified: projects (active development)', 'output');
    } else if (subcommand === 'show') {
      const projectName = args.slice(1).join(' ');
      if (projectName) {
        this.printOutput(`Showing project: ${projectName}`, 'output');
        this.printOutput('See the Games section to view detailed information.', 'output');
      } else {
        this.printOutput('Usage: git show [project-name]', 'error');
      }
    } else {
      this.printOutput(`Unknown git subcommand: ${subcommand || 'none'}`, 'error');
    }
  }

  private printOutput(text: string, type: 'output' | 'command' | 'error' | 'system' | 'hint' | 'link' = 'output'): void {
    const line = document.createElement('div');
    line.className = `terminal-output__line terminal-output__line--${type}`;

    if (type === 'link' && text.includes('http')) {
      const match = text.match(/(https?:\/\/[^\s]+)/);
      if (match && match[1]) {
        const url = match[1];
        const label = text.replace(url, '');
        line.innerHTML = `${esc(label)}<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" class="terminal-output__link">${esc(url)}</a>`;
      } else {
        line.textContent = text;
      }
    } else {
      line.textContent = text;
    }

    this.output!.appendChild(line);
  }
}
