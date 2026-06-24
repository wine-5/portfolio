// Entities
export { Project } from './entities/Project';
export { Skill } from './entities/Skill';
export { Profile } from './entities/Profile';
export { UpdateLog } from './entities/UpdateLog';

// Value Objects
export { type Category, CATEGORY_ORDER, CATEGORY_TYPE_LABEL, isCategory } from './value-objects/Category';
export { type FeaturedKind, isFeatured, getFeaturedBadgeLabel } from './value-objects/FeaturedKind';
export { type ExperienceLevel, calculateExperienceLevel } from './value-objects/ExperienceLevel';
export { CodexNo } from './value-objects/CodexNo';
export { type GameStat, calculateGameStat } from './value-objects/GameStat';
export { TechStack } from './value-objects/TechStack';

// Services
export { CodexCatalog } from './services/CodexCatalog';
export { ProjectGameStatService } from './services/ProjectGameStatService';

// Repositories (ports)
export type { ProjectRepository } from './repositories/ProjectRepository';
export type { SkillRepository } from './repositories/SkillRepository';
export type { ProfileRepository } from './repositories/ProfileRepository';
export type { UpdateLogRepository } from './repositories/UpdateLogRepository';
