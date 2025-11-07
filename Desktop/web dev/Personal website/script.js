// --- Pacman Game Variables ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const infoBox = document.getElementById('infoBox');
const scoreValue = document.getElementById('scoreValue');

const pacman = {
  x: 80,
  y: 80,
  targetX: 80,
  targetY: 80,
  size: 28,
  dir: 'right',
  speed: 4,
  mouthAngle: 0,
  mouthOpen: true
};

let infoBoxOpen = false;
let lastCircleId = null;

const circles = [
  { x: 750, y: 100, label: 'About Me', id: 'about', color: '#ff6b6b', reached: false },
  { x: 150, y: 550, label: 'Achievements', id: 'achievements', color: '#4ecdc4', reached: false },
  { x: 750, y: 550, label: 'Projects', id: 'projects', color: '#95e1d3', reached: false },
  { x: 450, y: 325, label: 'Contact', id: 'contact', color: '#ffd93d', reached: false }
];

const snacks = [
  { x: 250, y: 100 }, { x: 450, y: 100 }, { x: 550, y: 100 },
  { x: 200, y: 250 }, { x: 700, y: 250 },
  { x: 300, y: 400 }, { x: 650, y: 400 },
  { x: 350, y: 550 }, { x: 550, y: 550 },
  { x: 100, y: 350 }, { x: 800, y: 350 }
];

let eatenSnacks = Array(snacks.length).fill(false);
let score = 0;
let keys = {};
let mouthTimer = 0;

// Define maze walls for collision detection
const walls = [
  // Outer border
  {x: 20, y: 20, w: canvas.width - 40, h: 3},
  {x: 20, y: 20, w: 3, h: canvas.height - 40},
  {x: canvas.width - 23, y: 20, w: 3, h: canvas.height - 40},
  {x: 20, y: canvas.height - 23, w: canvas.width - 40, h: 3},
  
  // Simplified interior walls - more open paths
  {x: 150, y: 150, w: 150, h: 3},
  {x: 600, y: 150, w: 150, h: 3},
  {x: 350, y: 250, w: 200, h: 3},
  {x: 150, y: 400, w: 150, h: 3},
  {x: 600, y: 400, w: 150, h: 3},
  
  // Vertical dividers
  {x: 300, y: 100, w: 3, h: 100},
  {x: 600, y: 100, w: 3, h: 100},
  {x: 450, y: 300, w: 3, h: 150},
  {x: 300, y: 450, w: 3, h: 100},
  {x: 600, y: 450, w: 3, h: 100}
];

// --- Draw Functions ---
function drawPacman() {
  ctx.save();
  ctx.translate(pacman.x, pacman.y);
  
  let angle = 0;
  if (pacman.dir === 'right') angle = 0;
  if (pacman.dir === 'down') angle = Math.PI / 2;
  if (pacman.dir === 'left') angle = Math.PI;
  if (pacman.dir === 'up') angle = -Math.PI / 2;
  ctx.rotate(angle);
  
  
  mouthTimer++;
  if (mouthTimer % 10 === 0) {
    pacman.mouthOpen = !pacman.mouthOpen;
  }
  let mouthSize = pacman.mouthOpen ? 0.25 : 0.1;
  
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, pacman.size, mouthSize * Math.PI, (2 - mouthSize) * Math.PI, false);
  ctx.lineTo(0, 0);
  
 
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pacman.size);
  gradient.addColorStop(0, '#fff44f');
  gradient.addColorStop(1, '#ffe600');
  ctx.fillStyle = gradient;
  ctx.fill();
  

  ctx.shadowColor = '#ffe600';
  ctx.shadowBlur = 20;
  ctx.fill();
  ctx.shadowBlur = 0;
  
  
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(pacman.size / 3, -pacman.size / 3, 4, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.restore();
}

function drawCircles() {
  circles.forEach(c => {
   
    let pulse = Math.sin(Date.now() / 300) * 3;
    let radius = 45 + pulse;
    
   
    ctx.save();
    ctx.shadowColor = c.color;
    ctx.shadowBlur = c.reached ? 40 : 20;
    
   
    const gradient = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, radius);
    gradient.addColorStop(0, c.color);
    gradient.addColorStop(1, adjustBrightness(c.color, -40));
    
    ctx.beginPath();
    ctx.arc(c.x, c.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = c.reached ? '#ffe600' : '#fff';
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
    
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px "Press Start 2P", Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 5;
    
  
    const words = c.label.split(' ');
    if (words.length === 1) {
      ctx.fillText(c.label, c.x, c.y);
    } else {
      ctx.fillText(words[0], c.x, c.y - 8);
      ctx.fillText(words[1], c.x, c.y + 8);
    }
    ctx.shadowBlur = 0;
  });
}

function drawSnacks() {
  snacks.forEach((s, i) => {
    if (!eatenSnacks[i]) {
   
      let pulse = Math.sin(Date.now() / 200 + i) * 2;
      ctx.save();
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 10 + pulse;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.restore();
    }
  });
}

function drawBackground() {
 
  ctx.strokeStyle = '#2121DE';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  
  
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
  

  drawMazeLine(150, 150, 300, 150);
  drawMazeLine(600, 150, 750, 150);
  drawMazeLine(350, 250, 550, 250);
  drawMazeLine(150, 400, 300, 400);
  drawMazeLine(600, 400, 750, 400);
  
  
  drawMazeLine(300, 100, 300, 200);
  drawMazeLine(600, 100, 600, 200);
  drawMazeLine(450, 300, 450, 450);
  drawMazeLine(300, 450, 300, 550);
  drawMazeLine(600, 450, 600, 550);
}

function drawMazeLine(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawMazeCorner(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function adjustBrightness(color, amount) {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

function checkWallCollision(x, y, size) {
 
  for (let wall of walls) {
    if (x - size < wall.x + wall.w &&
        x + size > wall.x &&
        y - size < wall.y + wall.h &&
        y + size > wall.y) {
      return true; 
    }
  }
  return false; 
}


function updatePacman() {
  
  const ease = 0.15;
  pacman.x += (pacman.targetX - pacman.x) * ease;
  pacman.y += (pacman.targetY - pacman.y) * ease;
  

  if (keys['ArrowUp']) movePacman(0, -pacman.speed, 'up');
  if (keys['ArrowDown']) movePacman(0, pacman.speed, 'down');
  if (keys['ArrowLeft']) movePacman(-pacman.speed, 0, 'left');
  if (keys['ArrowRight']) movePacman(pacman.speed, 0, 'right');
  
  checkSnackCollision();
  checkCircleCollision();
}

function movePacman(dx, dy, dir) {
  let newX = pacman.targetX + dx;
  let newY = pacman.targetY + dy;
  

  if (checkWallCollision(newX, newY, pacman.size)) {
    return; // Don't move if there's a wall
  }
  
  // Boundaries with padding
  if (newX < pacman.size + 10) newX = pacman.size + 10;
  if (newX > canvas.width - pacman.size - 10) newX = canvas.width - pacman.size - 10;
  if (newY < pacman.size + 10) newY = pacman.size + 10;
  if (newY > canvas.height - pacman.size - 10) newY = canvas.height - pacman.size - 10;
  
  pacman.targetX = newX;
  pacman.targetY = newY;
  pacman.dir = dir;
}

function checkSnackCollision() {
  snacks.forEach((s, i) => {
    if (!eatenSnacks[i]) {
      let dist = Math.hypot(pacman.x - s.x, pacman.y - s.y);
      if (dist < pacman.size) {
        eatenSnacks[i] = true;
        score += 10;
        scoreValue.textContent = score;
        playEatSound();
      }
    }
  });
}

function checkCircleCollision() {
  if (infoBoxOpen) return; // Don't check if info box is already open
  
  circles.forEach(c => {
    let dist = Math.hypot(pacman.x - c.x, pacman.y - c.y);
    if (dist < pacman.size + 45) {
      if (!c.reached) {
        c.reached = true;
        score += 50;
        scoreValue.textContent = score;
        showInfo(c.id);
        lastCircleId = c.id;
      }
    }
  });
}

function playEatSound() {
  // Visual feedback for eating
  const eatEffect = document.createElement('div');
  eatEffect.style.cssText = `
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: #ffe600;
    font-size: 2em;
    pointer-events: none;
    animation: fadeOut 0.5s ease;
  `;
  eatEffect.textContent = '+10';
  document.body.appendChild(eatEffect);
  setTimeout(() => eatEffect.remove(), 500);
}

function showInfo(id) {
  if (infoBoxOpen) return; 
  
  let content = '';
  if (id === 'about') {
    content = `<h2>👋 About Me</h2>
    <p>Hi! I'm Aparna Venkatesh, a Computer Science major currently studying at University of Massachusetts Amherst.</p>
    <p>I'm enthusiastic about technology, programming, and making a positive impact through innovation. I organized the inaugural TEDx event at my school and have completed advanced programming courses including Python and SQL.</p>
    <p><strong>Skills:</strong> Python, SQL, JavaScript, HTML/CSS, MIT App Inventor, Database Management</p>`;
  } else if (id === 'achievements') {
    content = `<h2>🏆 My Achievements</h2>
    <ul>
      <li>Organizer - TEDxGEMS Millennium School (2024-2025)</li>
      <li>First Lego League Internationals Boston - 7th in Robot Game, 16th Overall (2024)</li>
      <li>First Lego League UAE Nationals - 1st Place Robot Game (2024)</li>
      <li>Vice President of School Council</li>
      <li>Speaker at TEDxYouth@OOW (2023)</li>
      <li>GEMS Innovation Challenge - 2nd Place (2023)</li>
      <li>1st Place Inter-house Chess Championship (2023)</li>
      <li>Star Student of the Month (2023)</li>
      <li>Vice-Captain of House (2023)</li>
    </ul>`;
  } else if (id === 'projects') {
    content = `<h2>💻 My Projects</h2>
    <ul>
      <li><strong>Sentiment Analyser for Stock Market</strong> - Python & CSV</li>
      <li><strong>Library Management Website</strong> - HTML</li>
      <li><strong>Password Generator</strong> - Python</li>
      <li><strong>Infinity 3000</strong> - Python</li>
      <li><strong>A-EYE</strong> - MIT App Inventor</li>
      <li><strong>Chlorobot</strong> - Robotics Project</li>
      <li><strong>Cap for Visually Impaired</strong> - Innovation Project (2nd Place)</li>
    </ul>
    <p><strong>Certifications:</strong> University of Helsinki Python Programming, JavaScript 12-hour program, Advanced Oracle PL/SQL</p>`;
  } else if (id === 'contact') {
    content = `<h2>📬 Contact & Resume</h2>
    <p>Want to connect or learn more about my work?</p>
    <ul>
      <li><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/aparna-venkatesh-0a518a303" target="_blank" style="color: #00d9ff;">View My Profile</a></li>
      <li><strong>Resume:</strong> <a href="Aparna_Venkatesh_Resume.pdf" download="Aparna_Venkatesh_Resume.pdf" target="_blank" rel="noopener" style="color: #00d9ff;">Download PDF</a></li>
      <li><strong>Email:</strong> <a href="mailto:aparna@example.com" style="color: #00d9ff;">aparna@example.com</a></li>
    </ul>
    <p>Feel free to reach out for collaborations or opportunities!</p>`;
  }
  
  infoBox.innerHTML = content + '<br><button id="closeBtn">CLOSE</button>';
  infoBox.style.display = 'block';
  
  setTimeout(() => {
    const closeBtn = document.getElementById('closeBtn');
    if (closeBtn) {
      closeBtn.onclick = function() {
        hideInfo();
      };
    }
  }, 0);
  
  infoBox.className = 'show';
  infoBoxOpen = true;
  keys = {}; 
}

function hideInfo() {
  infoBox.className = '';
  infoBoxOpen = false;
 
  setTimeout(() => {
    infoBox.style.display = 'none';
  }, 300);
}

document.addEventListener('keydown', e => {
  if (infoBoxOpen) return; 
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
    keys[e.key] = true;
  }
});

document.addEventListener('keyup', e => {
  keys[e.key] = false;
});


const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    to { opacity: 0; transform: translate(-50%, -70%) scale(1.5); }
  }
`;
document.head.appendChild(style);

// --- Main Loop ---
function gameLoop() {
  clearCanvas();
  drawBackground();
  drawSnacks();
  drawCircles();
  updatePacman();
  drawPacman();
  requestAnimationFrame(gameLoop);
}
gameLoop();

