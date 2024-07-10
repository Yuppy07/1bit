const colorWheel = document.getElementById('color-wheel');
const brightnessBar = document.getElementById('brightness-bar');
const selectedColor = document.getElementById('selected-color');
const colorValue = document.getElementById('color-value');
const canvasContainer = document.getElementById('canvas-container');

let hue = 0;
let saturation = 100;
let lightness = 50;
let currentColor = '';
let isEyedropperMode = false;

const colorCursor = document.createElement('div');
colorCursor.id = 'color-cursor';
colorWheel.appendChild(colorCursor);

const brightnessCursor = document.createElement('div');
brightnessCursor.id = 'brightness-cursor';
brightnessBar.appendChild(brightnessCursor);

const wheelCanvas = document.createElement('canvas');
wheelCanvas.width = 300;
wheelCanvas.height = 300;
colorWheel.appendChild(wheelCanvas);
const wheelCtx = wheelCanvas.getContext('2d');

const bitSize = 10; // 1ビットのサイズを10ピクセルに設定
const gridCanvas = document.createElement('canvas');
gridCanvas.width = canvasContainer.clientWidth;
gridCanvas.height = canvasContainer.clientHeight;
canvasContainer.appendChild(gridCanvas);
const gridCtx = gridCanvas.getContext('2d');

function drawColorWheel() {
    const centerX = wheelCanvas.width / 2;
    const centerY = wheelCanvas.height / 2;
    const radius = Math.min(centerX, centerY);

    for (let x = 0; x < wheelCanvas.width; x++) {
        for (let y = 0; y < wheelCanvas.height; y++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= radius) {
                const hue = ((Math.atan2(dy, dx) + Math.PI) / (Math.PI * 2)) * 360;
                const saturation = (distance / radius) * 100;
                wheelCtx.fillStyle = `hsl(${hue}, ${saturation}%, 50%)`;
                wheelCtx.fillRect(x, y, 1, 1);
            }
        }
    }
}

function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function updateColor() {
    const [r, g, b] = hslToRgb(hue, saturation, lightness);
    currentColor = `rgb(${r}, ${g}, ${b})`;
    selectedColor.style.backgroundColor = currentColor;
    colorValue.textContent = `hsl(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`;
}

function updateColorCursor(x, y) {
    colorCursor.style.left = `${x}px`;
    colorCursor.style.top = `${y}px`;
}

function updateBrightnessCursor(x) {
    brightnessCursor.style.left = `${x}px`;
}

function handleColorWheel(e) {
    const rect = colorWheel.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    
    const distance = Math.sqrt(x * x + y * y);
    const maxRadius = Math.min(centerX, centerY);
    
    if (distance <= maxRadius) {
        hue = ((Math.atan2(y, x) + Math.PI) / (Math.PI * 2)) * 360;
        saturation = (distance / maxRadius) * 100;

        updateColorCursor(e.clientX - rect.left, e.clientY - rect.top);
        updateColor();
    }
}

function handleBrightnessBar(e) {
    const rect = brightnessBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    lightness = (x / rect.width) * 100;
    updateBrightnessCursor(x);
    updateColor();
}

function drawGrid() {
    gridCtx.strokeStyle = '#ddd';
    for (let x = 0; x < gridCanvas.width; x += bitSize) {
        gridCtx.beginPath();
        gridCtx.moveTo(x, 0);
        gridCtx.lineTo(x, gridCanvas.height);
        gridCtx.stroke();
    }
    for (let y = 0; y < gridCanvas.height; y += bitSize) {
        gridCtx.beginPath();
        gridCtx.moveTo(0, y);
        gridCtx.lineTo(gridCanvas.width, y);
        gridCtx.stroke();
    }
}

function fillBit(e) {
    const rect = gridCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / bitSize) * bitSize;
    const y = Math.floor((e.clientY - rect.top) / bitSize) * bitSize;
    gridCtx.fillStyle = currentColor;
    gridCtx.fillRect(x, y, bitSize, bitSize);
}

colorWheel.addEventListener('mousedown', handleColorWheel);
colorWheel.addEventListener('mousemove', (e) => {
    if (e.buttons !== 1) return;
    handleColorWheel(e);
});

brightnessBar.addEventListener('mousedown', handleBrightnessBar);
brightnessBar.addEventListener('mousemove', (e) => {
    if (e.buttons !== 1) return;
    handleBrightnessBar(e);
});

gridCanvas.addEventListener('click', fillBit);

window.addEventListener('resize', () => {
    gridCanvas.width = canvasContainer.clientWidth;
    gridCanvas.height = canvasContainer.clientHeight;
    drawGrid();
});



drawColorWheel();
drawGrid();
updateColorCursor(wheelCanvas.width / 2, 0);
updateBrightnessCursor(brightnessBar.offsetWidth / 2);
updateColor();