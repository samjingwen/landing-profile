import { describe, expect, it } from "vitest";
import {
  applyPointerImpulse,
  createParticle,
  particleCountForWidth,
  type Particle,
} from "../../src/particles";

describe("particleCountForWidth", () => {
  it.each([
    [390, 8],
    [520, 8],
    [768, 14],
    [960, 14],
    [1440, 18],
  ])("uses %i particles at %i pixels", (width, expected) => {
    expect(particleCountForWidth(width)).toBe(expected);
  });
});

describe("createParticle", () => {
  it("creates a particle inside the viewport", () => {
    const particle = createParticle(1000, 800, () => 0.5);

    expect(particle.x).toBe(500);
    expect(particle.y).toBe(400);
    expect(particle.radius).toBeGreaterThanOrEqual(0.8);
    expect(particle.radius).toBeLessThanOrEqual(1.9);
  });
});

describe("applyPointerImpulse", () => {
  it("moves nearby particles without affecting distant ones", () => {
    const nearby: Particle = { x: 20, y: 0, vx: 0, vy: 0, radius: 1 };
    const distant: Particle = { x: 300, y: 0, vx: 0, vy: 0, radius: 1 };

    applyPointerImpulse([nearby, distant], 0, 0, 100, 1);

    expect(nearby.vx).toBeGreaterThan(0);
    expect(nearby.vy).toBe(0);
    expect(distant.vx).toBe(0);
    expect(distant.vy).toBe(0);
  });
});
