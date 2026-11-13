import { ParticleField } from "./particles";

const canvas = document.querySelector<HTMLCanvasElement>("#particle-field");

if (canvas) {
  const particleField = new ParticleField(canvas);
  particleField.start();
}
