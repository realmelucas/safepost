const canvas = document.getElementById('heroScene');
const ctx = canvas.getContext('2d');

let width = 0;
let height = 0;
let dpr = 1;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function roundedRect(x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawTruck(t) {
  const floorY = height * 0.76;
  const truckX = width * 0.52;
  const truckY = height * 0.2;
  const truckW = width * 0.42;
  const truckH = height * 0.5;

  ctx.fillStyle = '#d8e1ea';
  roundedRect(truckX, truckY, truckW, truckH, 12);
  ctx.fill();

  ctx.fillStyle = '#aebaca';
  ctx.fillRect(truckX + truckW * 0.06, truckY + truckH * 0.08, truckW * 0.88, truckH * 0.84);

  ctx.fillStyle = '#34465c';
  ctx.fillRect(truckX + truckW * 0.11, truckY + truckH * 0.15, truckW * 0.76, truckH * 0.7);

  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i += 1) {
    const x = truckX + truckW * (0.16 + i * 0.09);
    ctx.beginPath();
    ctx.moveTo(x, truckY + truckH * 0.16);
    ctx.lineTo(x, truckY + truckH * 0.84);
    ctx.stroke();
  }

  ctx.fillStyle = '#222f3f';
  ctx.fillRect(0, floorY, width, height - floorY);

  for (let i = 0; i < 18; i += 1) {
    const x = truckX + truckW * 0.15 + i * 34 - ((t * 50) % 34);
    ctx.fillStyle = i % 2 ? '#b67634' : '#cc8944';
    roundedRect(x, floorY - 46 - (i % 3) * 7, 54, 42, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.14)';
    ctx.stroke();
  }
}

function drawWorker(t) {
  const x = width * 0.72;
  const y = height * 0.62;
  const pulse = 1 + Math.sin(t * 5) * 0.05;

  ctx.fillStyle = '#f2b26c';
  ctx.beginPath();
  ctx.arc(x, y - 88, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f59e0b';
  roundedRect(x - 28, y - 66, 56, 86, 12);
  ctx.fill();

  ctx.fillStyle = '#1f2937';
  ctx.fillRect(x - 26, y + 18, 18, 64);
  ctx.fillRect(x + 8, y + 18, 18, 64);

  ctx.fillStyle = '#dc2626';
  roundedRect(x + 20, y - 36, 32, 42, 8);
  ctx.fill();

  ctx.strokeStyle = `rgba(220, 38, 38, ${0.52 + Math.sin(t * 5) * 0.28})`;
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.arc(x + 36, y - 16, (34 + i * 24) * pulse, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawStation(t) {
  const x = width * 0.88;
  const y = height * 0.5;

  ctx.fillStyle = '#e7edf4';
  roundedRect(x - 38, y - 112, 76, 160, 10);
  ctx.fill();
  ctx.fillStyle = '#172b42';
  roundedRect(x - 24, y - 88, 48, 64, 6);
  ctx.fill();

  const alpha = 0.3 + Math.sin(t * 3) * 0.18;
  ctx.strokeStyle = `rgba(37, 99, 235, ${alpha})`;
  ctx.lineWidth = 4;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.arc(x, y - 56, 48 + i * 34, -Math.PI * 0.7, Math.PI * 0.7);
    ctx.stroke();
  }
}

function drawLights(t) {
  for (let i = 0; i < 7; i += 1) {
    const x = width * (0.48 + i * 0.07);
    const y = height * 0.15;
    const glow = 0.45 + Math.sin(t * 2 + i) * 0.18;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 180);
    gradient.addColorStop(0, `rgba(245, 158, 11, ${glow})`);
    gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - 180, y - 40, 360, 300);
  }
}

function render(ms) {
  const t = ms / 1000;
  ctx.clearRect(0, 0, width, height);

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#142235');
  bg.addColorStop(0.45, '#203142');
  bg.addColorStop(1, '#6b7280');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  drawLights(t);
  drawTruck(t);
  drawStation(t);
  drawWorker(t);

  requestAnimationFrame(render);
}

resize();
window.addEventListener('resize', resize);
requestAnimationFrame(render);
