/**
 * プロフィールエンティティ。
 * wine-5自身のキャラクター情報。
 */
export class Profile {
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly imageUrl?: string;
  readonly socialLinks: Record<string, string>;

  constructor(
    name: string,
    title: string,
    description: string,
    socialLinks: Record<string, string> = {},
    imageUrl?: string
  ) {
    this.name = name;
    this.title = title;
    this.description = description;
    this.imageUrl = imageUrl;
    this.socialLinks = { ...socialLinks };
  }
}
