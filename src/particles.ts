export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface PointerState {
  x: number;
  y: number;
  active: boolean;
}

const MOBILE_BREAKPOINT = 520;
const TABLET_BREAKPOINT = 960;
const MOBILE_PARTICLES = 8;
const TABLET_PARTICLES = 14;
const DESKTOP_PARTICLES = 18;

export function particleCountForWidth(width: number): number {
  if (width <= MOBILE_BREAKPOINT) return MOBILE_PARTICLES;
  if (width <= TABLET_BREAKPOINT) return TABLET_PARTICLES;
  return DESKTOP_PARTICLES;
}

export function createParticle(
  width: number,
  height: number,
  random: () => number = Math.random,
): Particle {
  const angle = random() * Math.PI * 2;
  const speed = 0.018 + random() * 0.026;

  return {
    x: random() * width,
    y: random() * height,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: 0.8 + random() * 1.1,
  };
}

export function applyPointerImpulse(
  particles: Particle[],
  x: number,
  y: number,
  radius = 240,
  strength = 0.72,
): void {
  for (const particle of particles) {
    const dx = particle.x - x;
    const dy = particle.y - y;
    const distance = Math.hypot(dx, dy);

    if (distance === 0 || distance >= radius) continue;

    const force = (1 - distance / radius) * strength;
    particle.vx += (dx / distance) * force;
    particle.vy += (dy / distance) * force;
  }
}

export class ParticleField {
  private readonly context: CanvasRenderingContext2D;
  private readonly particles: Particle[] = [];
  private readonly pointer: PointerState = { x: 0, y: 0, active: false };
  private animationFrame: number | null = null;
  private width = 0;
  private height = 0;
  private previousTime = 0;
  private particleColor = "122, 162, 247";
  private lineColor = "86, 95, 137";

  constructor(private readonly canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error("The particle canvas requires a 2D rendering context.");
    this.context = context;
  }

  start(): void {
    this.readColors();
    this.resize();
    window.addEventListener("resize", this.resize, { passive: true });
    document.addEventListener("pointermove", this.handlePointerMove, {
      passive: true,
    });
    document.addEventListener("pointerdown", this.handlePointerDown, {
      passive: true,
      capture: true,
    });
    document.addEventListener("pointerout", this.handlePointerOut, {
      passive: true,
    });
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    this.resume();
  }

  destroy(): void {
    this.pause();
    window.removeEventListener("resize", this.resize);
    document.removeEventListener("pointermove", this.handlePointerMove);
    document.removeEventListener("pointerdown", this.handlePointerDown, {
      capture: true,
    });
    document.removeEventListener("pointerout", this.handlePointerOut);
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange,
    );
  }

  private readonly resize = (): void => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = particleCountForWidth(this.width);
    this.particles.length = 0;
    for (let index = 0; index < count; index += 1) {
      this.particles.push(createParticle(this.width, this.height));
    }
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    this.pointer.x = event.clientX;
    this.pointer.y = event.clientY;
    this.pointer.active = true;
  };

  private readonly handlePointerDown = (event: PointerEvent): void => {
    this.pointer.x = event.clientX;
    this.pointer.y = event.clientY;
    this.pointer.active = true;
    applyPointerImpulse(this.particles, event.clientX, event.clientY);
  };

  private readonly handlePointerOut = (event: PointerEvent): void => {
    if (event.relatedTarget === null) this.pointer.active = false;
  };

  private readonly handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.pause();
    } else {
      this.resume();
    }
  };

  private readonly frame = (time: number): void => {
    const elapsed = Math.min(time - this.previousTime || 16, 32);
    this.previousTime = time;
    this.update(elapsed);
    this.draw();
    this.animationFrame = window.requestAnimationFrame(this.frame);
  };

  private update(elapsed: number): void {
    for (const particle of this.particles) {
      if (this.pointer.active) {
        const dx = this.pointer.x - particle.x;
        const dy = this.pointer.y - particle.y;
        const distance = Math.hypot(dx, dy);

        if (distance > 0 && distance < 190) {
          const attraction = (1 - distance / 190) * 0.00012 * elapsed;
          particle.vx += (dx / distance) * attraction;
          particle.vy += (dy / distance) * attraction;
        }
      }

      const speed = Math.hypot(particle.vx, particle.vy);
      if (speed > 0.34) {
        particle.vx = (particle.vx / speed) * 0.34;
        particle.vy = (particle.vy / speed) * 0.34;
      }

      particle.vx *= 0.998;
      particle.vy *= 0.998;
      particle.x += particle.vx * elapsed;
      particle.y += particle.vy * elapsed;

      if (particle.x < -10) particle.x = this.width + 10;
      if (particle.x > this.width + 10) particle.x = -10;
      if (particle.y < -10) particle.y = this.height + 10;
      if (particle.y > this.height + 10) particle.y = -10;
    }
  }

  private draw(): void {
    this.context.clearRect(0, 0, this.width, this.height);
    this.drawConnections();

    for (const particle of this.particles) {
      this.context.beginPath();
      this.context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.context.fillStyle = `rgba(${this.particleColor}, 0.72)`;
      this.context.fill();
    }
  }

  private drawConnections(): void {
    const connectionDistance = 148;

    for (
      let firstIndex = 0;
      firstIndex < this.particles.length;
      firstIndex += 1
    ) {
      const first = this.particles[firstIndex];
      if (!first) continue;

      for (
        let secondIndex = firstIndex + 1;
        secondIndex < this.particles.length;
        secondIndex += 1
      ) {
        const second = this.particles[secondIndex];
        if (!second) continue;

        const distance = Math.hypot(first.x - second.x, first.y - second.y);
        if (distance >= connectionDistance) continue;

        const opacity = (1 - distance / connectionDistance) * 0.28;
        this.drawLine(first.x, first.y, second.x, second.y, opacity);
      }

      if (this.pointer.active) {
        const pointerDistance = Math.hypot(
          first.x - this.pointer.x,
          first.y - this.pointer.y,
        );
        if (pointerDistance < 176) {
          const opacity = (1 - pointerDistance / 176) * 0.5;
          this.drawLine(
            first.x,
            first.y,
            this.pointer.x,
            this.pointer.y,
            opacity,
          );
        }
      }
    }
  }

  private drawLine(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    opacity: number,
  ): void {
    this.context.beginPath();
    this.context.moveTo(fromX, fromY);
    this.context.lineTo(toX, toY);
    this.context.lineWidth = 0.8;
    this.context.strokeStyle = `rgba(${this.lineColor}, ${opacity})`;
    this.context.stroke();
  }

  private readColors(): void {
    const styles = getComputedStyle(document.documentElement);
    this.particleColor =
      this.hexToRgb(styles.getPropertyValue("--particle").trim()) ??
      this.particleColor;
    this.lineColor =
      this.hexToRgb(styles.getPropertyValue("--particle-line").trim()) ??
      this.lineColor;
  }

  private hexToRgb(hex: string): string | null {
    const match = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!match?.[1] || !match[2] || !match[3]) return null;
    return `${Number.parseInt(match[1], 16)}, ${Number.parseInt(match[2], 16)}, ${Number.parseInt(match[3], 16)}`;
  }

  private pause(): void {
    if (this.animationFrame === null) return;
    window.cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
  }

  private resume(): void {
    if (this.animationFrame !== null || document.hidden) return;
    this.previousTime = performance.now();
    this.animationFrame = window.requestAnimationFrame(this.frame);
  }
}
