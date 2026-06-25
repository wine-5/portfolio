/**
 * 3Dくるくるゲームアイコン: 3D回転エフェクト付きアイコン表示。
 */
export class Game3DIcon {
  render(imageUrl: string, title: string): HTMLElement {
    const container = document.createElement('div');
    container.className = 'game-3d-icon-container';

    const icon = document.createElement('div');
    icon.className = 'game-3d-icon';

    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = title;
    image.className = 'game-3d-icon__image';

    icon.appendChild(image);
    container.appendChild(icon);

    return container;
  }
}

/**
 * Game3DIcon CSS。
 */
export const GAME_3D_ICON_STYLES = `
.game-3d-icon-container {
  perspective: 1000px;
  width: 120px;
  height: 120px;
  position: relative;
}

.game-3d-icon {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  animation: game3dRotate 6s infinite linear;
  border: 3px solid var(--line);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%);
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.3),
    inset 0 -2px 4px rgba(0, 0, 0, 0.4),
    0 8px 16px rgba(0, 0, 0, 0.4);
}

@keyframes game3dRotate {
  0% {
    transform: rotateY(0deg) rotateX(10deg);
  }
  100% {
    transform: rotateY(360deg) rotateX(10deg);
  }
}

.game-3d-icon__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: pixelated;
  display: block;
}

@media (prefers-reduced-motion: reduce) {
  .game-3d-icon {
    animation: none;
    transform: rotateY(0deg) rotateX(10deg);
  }
}
`;
