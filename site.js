const contact = document.getElementById("contact");
const field = document.querySelector(".object-field");
const context = field?.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function decode(values) {
  return String.fromCharCode(...values);
}

if (contact) {
  contact.addEventListener("click", () => {
    const user = decode([104, 101, 108, 108, 111]);
    const domain = decode([104, 114, 111, 110, 105, 114, 46, 100, 101, 118]);
    const address = `${user}${decode([64])}${domain}`;

    contact.querySelector("span").textContent = address;
    window.location.href = `${decode([109, 97, 105, 108, 116, 111, 58])}${address}`;
  });
}

function resizeField() {
  if (!field || !context) {
    return null;
  }

  const ratio = 0.56;
  const width = field.clientWidth;
  const height = field.clientHeight;
  const targetWidth = Math.floor(width * ratio);
  const targetHeight = Math.floor(height * ratio);

  if (field.width !== targetWidth || field.height !== targetHeight) {
    field.width = targetWidth;
    field.height = targetHeight;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  return { width, height };
}

function smoothPulse(value) {
  const clamped = Math.max(0, Math.min(1, value));

  return clamped * clamped * (3 - 2 * clamped);
}

function strokePath(points, color, alpha) {
  context.strokeStyle = color.replace("ALPHA", alpha);
  context.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  });
  context.stroke();
}

function drawObject(cx, cy, size, phase, hueIndex, visibility) {
  const colors = [
    "rgba(53, 240, 228, ALPHA)",
    "rgba(255, 45, 120, ALPHA)",
    "rgba(255, 228, 92, ALPHA)"
  ];
  const color = colors[hueIndex % colors.length];
  const skew = Math.sin(phase) * size * 0.08;
  const width = size * 0.8;
  const height = size * 1.08;
  const outerAlpha = (0.11 + visibility * 0.38).toFixed(3);
  const innerAlpha = (0.08 + visibility * 0.5).toFixed(3);

  context.lineWidth = Math.max(1, size * 0.018);
  strokePath([
    [cx - width * 0.5 + skew, cy - height * 0.5],
    [cx + width * 0.5 + skew, cy - height * 0.37],
    [cx + width * 0.38 - skew, cy + height * 0.5],
    [cx - width * 0.56 - skew, cy + height * 0.35],
    [cx - width * 0.5 + skew, cy - height * 0.5]
  ], color, outerAlpha);

  context.lineWidth = Math.max(1, size * 0.011);
  strokePath([
    [cx - width * 0.28, cy - height * 0.16],
    [cx + width * 0.24, cy - height * 0.08],
    [cx + width * 0.18, cy + height * 0.2],
    [cx - width * 0.32, cy + height * 0.13]
  ], color, innerAlpha);
}

function drawField(time = 0, animate = true) {
  const size = resizeField();

  if (!field || !context || !size) {
    return;
  }

  const { width, height } = size;
  const phase = time * 0.00045;

  context.clearRect(0, 0, width, height);
  context.lineCap = "round";
  context.lineJoin = "round";

  const objects = [
    [0.18, 0.2, 78],
    [0.72, 0.22, 104],
    [0.27, 0.72, 122],
    [0.78, 0.66, 92]
  ];

  objects.forEach(([x, y, objectSize], index) => {
    const cycle = (Math.sin(phase * 1.8 + index * 1.55) + 1) / 2;
    const primary = smoothPulse(cycle);
    const secondary = smoothPulse((Math.sin(phase * 1.8 + index * 1.55 - 0.9) + 1) / 2);
    const cx = width * x + Math.sin(phase + index) * 18;
    const cy = height * y + Math.cos(phase * 0.9 + index * 1.7) * 14;

    drawObject(cx, cy, objectSize, phase + index * 0.7, index, primary);
    drawObject(
      cx + 22 + index * 5,
      cy - 15 + index * 3,
      objectSize * 1.06,
      phase + index * 0.7 + 0.45,
      index + 1,
      secondary
    );
  });

  for (let i = 0; i < 6; i += 1) {
    const y = height * (0.18 + i * 0.12);
    const bend = Math.sin(phase * 1.2 + i) * 24;
    const alpha = (0.08 + smoothPulse((Math.sin(phase * 1.6 + i * 0.8) + 1) / 2) * 0.16).toFixed(3);
    const color = i % 3 === 0 ? "rgba(255, 228, 92, ALPHA)" : "rgba(53, 240, 228, ALPHA)";

    strokePath([
      [width * 0.1, y + bend],
      [width * 0.35, y - bend * 0.5],
      [width * 0.62, y + bend * 0.32],
      [width * 0.9, y - bend]
    ], color, alpha);
  }

  if (animate) {
    requestAnimationFrame((nextTime) => drawField(nextTime, true));
  }
}

if (field && context) {
  resizeField();

  if (reduceMotion) {
    drawField(0, false);
  } else {
    requestAnimationFrame((time) => drawField(time, true));
  }
}
