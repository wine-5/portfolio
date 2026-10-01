/** Type declarations for wine-rig.js (the animated wine-5 profile icon). */

export interface WineRigParams {
  /** head left/right, -30..30 */
  angleX: number;
  /** head up/down, -30..30 (+ = up) */
  angleY: number;
  /** head tilt in degrees-ish, -10..10 */
  angleZ: number;
  /** 0 = closed, 1 = open */
  eyeOpen: number;
  /** -1..1 */
  eyeBallX: number;
  /** -1..1 (+ = up) */
  eyeBallY: number;
  /** 0.55..1, 1 = the drawn open smile */
  mouth: number;
  /** 0..1 */
  breath: number;
}

export interface WineRigOptions {
  /** URL of wine_rig.json. The two .webp files must sit next to it. */
  modelUrl: string;
  /** Where to listen for the mouse (default: window). */
  pointerTarget?: EventTarget;
  /** Fixed parameter values (for screenshots / debugging). */
  params?: Partial<WineRigParams>;
}

export interface WineRigHandle {
  /** Stop drawing and remove listeners. */
  stop(): void;
}

/** true when WebGL is available and the user has not asked for reduced motion. */
export function canRunWineRig(): boolean;

/** Start the rig on a canvas (its CSS size decides the drawing size). Rejects on failure. */
export function startWineRig(canvas: HTMLCanvasElement, options: WineRigOptions): Promise<WineRigHandle>;
