/**
 * 図鑑ナンバー(値オブジェクト)。
 * No.001 ～ No.999 形式。
 */
export class CodexNo {
  readonly number: number;

  constructor(number: number) {
    if (number < 1 || number > 999 || !Number.isInteger(number)) {
      throw new Error(`CodexNo must be 1-999 integer, got ${number}`);
    }
    this.number = number;
  }

  toString(): string {
    return `No.${String(this.number).padStart(3, '0')}`;
  }

  toJSON(): number {
    return this.number;
  }
}
