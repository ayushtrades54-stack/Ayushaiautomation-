// Toggle Hamburger Menu
function toggleMenu() {
  const menu = document.getElementById("navMenu");
  menu.classList.toggle("show");
}

// Optional: Smooth scrolling for anchor links (if used)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if(target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
// -----------------------------
// Background Particle Automation
// -----------------------------
const canvas = document.getElementById("automation-bg");
const ctx = canvas.getContext("2d");

let particlesArray;

function initCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  particlesArray = [];
  const numberOfParticles = Math.floor((canvas.width * canvas.height) / 15000);

  for (let i = 0; i < numberOfParticles; i++) {
    particlesArray.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 1,
      speedY: (Math.random() - 0.5) * 1
    });
  }
}
initCanvas();

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw particles
  for (let i = 0; i < particlesArray.length; i++) {
    const p = particlesArray[i];
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 255, 224, 0.7)';
    ctx.fill();
  }

  // Draw lines between close particles
  for (let a = 0; a < particlesArray.length; a++) {
    for (let b = a + 1; b < particlesArray.length; b++) {
      const dx = particlesArray[a].x - particlesArray[b].x;
      const dy = particlesArray[a].y - particlesArray[b].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 120) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 255, 224, ${1 - distance / 120})`;
        ctx.lineWidth = 1;
        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
        ctx.stroke();
      }
    }
  }
}

function updateParticles() {
  for (let i = 0; i < particlesArray.length; i++) {
    const p = particlesArray[i];
    p.x += p.speedX;
    p.y += p.speedY;

    if (p.x > canvas.width) p.x = 0;
    if (p.x < 0) p.x = canvas.width;
    if (p.y > canvas.height) p.y = 0;
    if (p.y < 0) p.y = canvas.height;
  }
}

function animate() {
  drawParticles();
  updateParticles();
  requestAnimationFrame(animate);
}
animate();

// Resize canvas on window resize
window.addEventListener('resize', () => {
  initCanvas();
});

const heroCanvas = document.getElementById("hero-bg");
if(heroCanvas){
  const heroCtx = heroCanvas.getContext("2d");
  let heroParticles;

  function initHeroCanvas() {
    heroCanvas.width = heroCanvas.offsetWidth;
    heroCanvas.height = heroCanvas.offsetHeight;

    heroParticles = [];
    const numberOfParticles = Math.floor((heroCanvas.width * heroCanvas.height) / 20000);

    for (let i = 0; i < numberOfParticles; i++) {
      heroParticles.push({
        x: Math.random() * heroCanvas.width,
        y: Math.random() * heroCanvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 1.2,
        speedY: (Math.random() - 0.5) * 1.2
      });
    }
  }
  initHeroCanvas();

  function drawHeroParticles() {
    heroCtx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);

    // Draw particles
    for (let i = 0; i < heroParticles.length; i++) {
      const p = heroParticles[i];
      heroCtx.beginPath();
      heroCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      heroCtx.fillStyle = 'rgba(0,255,224,0.6)';
      heroCtx.fill();
    }

    // Draw lines between particles
    for (let a = 0; a < heroParticles.length; a++) {
      for (let b = a + 1; b < heroParticles.length; b++) {
        const dx = heroParticles[a].x - heroParticles[b].x;
        const dy = heroParticles[a].y - heroParticles[b].y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        if(distance < 100){
          heroCtx.beginPath();
          heroCtx.strokeStyle = `rgba(0,255,224,${1-distance/100})`;
          heroCtx.lineWidth = 1;
          heroCtx.moveTo(heroParticles[a].x, heroParticles[a].y);
          heroCtx.lineTo(heroParticles[b].x, heroParticles[b].y);
          heroCtx.stroke();
        }
      }
    }
  }

  function updateHeroParticles() {
    for(let i=0; i<heroParticles.length; i++){
      const p = heroParticles[i];
      p.x += p.speedX;
      p.y += p.speedY;

      if(p.x > heroCanvas.width) p.x = 0;
      if(p.x < 0) p.x = heroCanvas.width;
      if(p.y > heroCanvas.height) p.y = 0;
      if(p.y < 0) p.y = heroCanvas.height;
    }
  }

  function animateHero() {
    drawHeroParticles();
    updateHeroParticles();
    requestAnimationFrame(animateHero);
  }
  animateHero();

  window.addEventListener('resize', () => {
    initHeroCanvas();
  });
}