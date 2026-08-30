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

  const ratio = window.devicePixelRatio || 1;
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

function drawObject(cx, cy, size, phase, hueIndex) {
  const colors = [
    "rgba(53, 240, 228, ALPHA)",
    "rgba(255, 45, 120, ALPHA)",
    "rgba(255, 228, 92, ALPHA)"
  ];
  const color = colors[hueIndex % colors.length];
  const skew = Math.sin(phase) * size * 0.08;
  const width = size * 0.8;
  const height = size * 1.08;

  context.lineWidth = Math.max(1, size * 0.018);
  strokePath([
    [cx - width * 0.5 + skew, cy - height * 0.5],
    [cx + width * 0.5 + skew, cy - height * 0.37],
    [cx + width * 0.38 - skew, cy + height * 0.5],
    [cx - width * 0.56 - skew, cy + height * 0.35],
    [cx - width * 0.5 + skew, cy - height * 0.5]
  ], color, "0.34");

  context.lineWidth = Math.max(1, size * 0.011);
  strokePath([
    [cx - width * 0.28, cy - height * 0.16],
    [cx + width * 0.24, cy - height * 0.08],
    [cx + width * 0.18, cy + height * 0.2],
    [cx - width * 0.32, cy + height * 0.13]
  ], color, "0.52");
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

  for (let i = 0; i < 9; i += 1) {
    const depth = i / 8;
    const cx = width * (0.22 + depth * 0.64) + Math.sin(phase + i) * 22;
    const cy = height * (0.22 + Math.sin(i * 1.7) * 0.18 + depth * 0.22);
    const objectSize = 54 + depth * 130;

    drawObject(cx, cy, objectSize, phase + i * 0.9, i);
    drawObject(cx + 16 + depth * 18, cy - 11 + depth * 6, objectSize * 1.03, phase + i * 0.9 + 0.35, i + 1);
  }

  context.lineWidth = 1;
  for (let i = 0; i < 11; i += 1) {
    const y = height * (0.13 + i * 0.067);
    const bend = Math.sin(phase * 1.7 + i) * 28;
    const color = i % 3 === 0 ? "rgba(255, 228, 92, ALPHA)" : "rgba(53, 240, 228, ALPHA)";

    strokePath([
      [width * 0.08, y + bend],
      [width * 0.38, y - bend * 0.55],
      [width * 0.66, y + bend * 0.35],
      [width * 0.93, y - bend]
    ], color, i % 3 === 0 ? "0.16" : "0.12");
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
