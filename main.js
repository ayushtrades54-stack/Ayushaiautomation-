// =============================================
// IMPROVED MAIN.JS WITH ALL UI/UX ENHANCEMENTS
// =============================================

// ----------------------
// Navbar Scroll Effect
// ----------------------
window.addEventListener('scroll', function() {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ----------------------
// Toggle Hamburger Menu - IMPROVED
// ----------------------
function toggleMenu() {
  const menu = document.getElementById("navMenu");
  const hamburger = document.getElementById("hamburger");
  const body = document.body;
  
  menu.classList.toggle("show");
  hamburger.classList.toggle("active");
  
  // Prevent body scroll when menu is open
  if (menu.classList.contains("show")) {
    body.style.overflow = "hidden";
  } else {
    body.style.overflow = "";
  }
}

// Close menu when clicking outside
document.addEventListener('click', function(event) {
  const menu = document.getElementById("navMenu");
  const hamburger = document.getElementById("hamburger");
  const navbar = document.querySelector('.navbar');
  
  if (menu && hamburger && !navbar.contains(event.target)) {
    menu.classList.remove("show");
    hamburger.classList.remove("active");
    document.body.style.overflow = "";
  }
});

// Close menu when clicking on a menu item
document.querySelectorAll('.nav-menu a').forEach(link => {
  link.addEventListener('click', function() {
    const menu = document.getElementById("navMenu");
    const hamburger = document.getElementById("hamburger");
    
    if (menu && hamburger) {
      menu.classList.remove("show");
      hamburger.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
});

// ----------------------
// Smooth Scrolling - IMPROVED
// ----------------------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if(target) {
      const navHeight = document.querySelector('.navbar').offsetHeight;
      const targetPosition = target.offsetTop - navHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ----------------------
// Scroll Reveal Animation
// ----------------------
function revealOnScroll() {
  const reveals = document.querySelectorAll('.service-card, .card, .step, .faq-item');
  
  reveals.forEach(element => {
    const windowHeight = window.innerHeight;
    const elementTop = element.getBoundingClientRect().top;
    const elementVisible = 150;
    
    if (elementTop < windowHeight - elementVisible) {
      element.classList.add('scroll-reveal', 'active');
    }
  });
}

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// ----------------------
// Particles Background - IMPROVED
// ----------------------
const canvas = document.getElementById("automation-bg");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let particlesArray = [];

  function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    particlesArray = [];
    const numberOfParticles = Math.floor((canvas.width * canvas.height) / 12000);

    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 1.2,
        speedY: (Math.random() - 0.5) * 1.2,
        opacity: Math.random() * 0.5 + 0.3
      });
    }
  }
  initCanvas();

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw particles with improved colors
    for (let i = 0; i < particlesArray.length; i++) {
      const p = particlesArray[i];
      
      // Create gradient for particle
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      gradient.addColorStop(0, `rgba(59, 130, 246, ${p.opacity})`);
      gradient.addColorStop(1, `rgba(59, 130, 246, 0)`);
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Draw connecting lines with improved effect
    for (let a = 0; a < particlesArray.length; a++) {
      for (let b = a + 1; b < particlesArray.length; b++) {
        const dx = particlesArray[a].x - particlesArray[b].x;
        const dy = particlesArray[a].y - particlesArray[b].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 120) {
          ctx.beginPath();
          const opacity = (1 - distance / 120) * 0.5;
          ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
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

      // Bounce effect at edges
      if (p.x > canvas.width || p.x < 0) {
        p.speedX *= -1;
      }
      if (p.y > canvas.height || p.y < 0) {
        p.speedY *= -1;
      }
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
}

// ----------------------
// Hero Background Particles - IMPROVED
// ----------------------
const heroCanvas = document.getElementById("hero-bg");
if(heroCanvas){
  const heroCtx = heroCanvas.getContext("2d");
  let heroParticles = [];

  function initHeroCanvas() {
    heroCanvas.width = heroCanvas.offsetWidth || window.innerWidth;
    heroCanvas.height = heroCanvas.offsetHeight || window.innerHeight;

    heroParticles = [];
    const numberOfParticles = Math.floor((heroCanvas.width * heroCanvas.height) / 15000);

    for (let i = 0; i < numberOfParticles; i++) {
      heroParticles.push({
        x: Math.random() * heroCanvas.width,
        y: Math.random() * heroCanvas.height,
        size: Math.random() * 2.5 + 1,
        speedX: (Math.random() - 0.5) * 1.5,
        speedY: (Math.random() - 0.5) * 1.5,
        opacity: Math.random() * 0.6 + 0.4
      });
    }
  }
  initHeroCanvas();

  function drawHeroParticles() {
    heroCtx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);

    // Draw particles with glow effect
    for (let i = 0; i < heroParticles.length; i++) {
      const p = heroParticles[i];
      
      // Create gradient for particle glow
      const gradient = heroCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
      gradient.addColorStop(0, `rgba(59, 130, 246, ${p.opacity})`);
      gradient.addColorStop(0.5, `rgba(59, 130, 246, ${p.opacity * 0.5})`);
      gradient.addColorStop(1, `rgba(59, 130, 246, 0)`);
      
      heroCtx.beginPath();
      heroCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      heroCtx.fillStyle = gradient;
      heroCtx.fill();
    }

    // Draw connecting lines with improved visuals
    for (let a = 0; a < heroParticles.length; a++) {
      for (let b = a + 1; b < heroParticles.length; b++) {
        const dx = heroParticles[a].x - heroParticles[b].x;
        const dy = heroParticles[a].y - heroParticles[b].y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        if(distance < 100){
          heroCtx.beginPath();
          const opacity = (1-distance/100) * 0.6;
          heroCtx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
          heroCtx.lineWidth = 1.5;
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

      // Bounce at edges
      if(p.x > heroCanvas.width || p.x < 0) p.speedX *= -1;
      if(p.y > heroCanvas.height || p.y < 0) p.speedY *= -1;
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

// ----------------------
// Mouse Interaction with Particles
// ----------------------
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', function(event) {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

// ----------------------
// Button Ripple Effect
// ----------------------
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
  button.addEventListener('click', function(e) {
    let ripple = document.createElement('span');
    ripple.classList.add('ripple');
    this.appendChild(ripple);
    
    let x = e.clientX - e.target.offsetLeft;
    let y = e.clientY - e.target.offsetTop;
    
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
});

// ----------------------
// Fade In on Load
// ----------------------
window.addEventListener('load', function() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';
  
  setTimeout(() => {
    document.body.style.opacity = '1';
  }, 100);
});

// ----------------------
// Form Validation Enhancement
// ----------------------
const forms = document.querySelectorAll('form');
forms.forEach(form => {
  form.addEventListener('submit', function(e) {
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!input.value.trim()) {
        isValid = false;
        input.style.borderColor = '#ef4444';
        input.style.animation = 'shake 0.3s ease';
        
        setTimeout(() => {
          input.style.animation = '';
        }, 300);
      } else {
        input.style.borderColor = 'rgba(59, 130, 246, 0.3)';
      }
    });
    
    if (!isValid) {
      e.preventDefault();
    }
  });
});

// ----------------------
// Typing Effect for Hero Title (Optional)
// ----------------------
function typeWriter(element, text, speed = 100) {
  let i = 0;
  element.innerHTML = '';
  
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  type();
}

// Uncomment below to enable typing effect on hero title
// const heroTitle = document.querySelector('.hero-content h1');
// if (heroTitle) {
//   const titleText = heroTitle.textContent;
//   typeWriter(heroTitle, titleText, 50);
// }

// ----------------------
// Lazy Loading Images
// ----------------------
const images = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      observer.unobserve(img);
    }
  });
});

images.forEach(img => imageObserver.observe(img));

// ----------------------
// Counter Animation for Stats
// ----------------------
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);
  
  function updateCounter() {
    start += increment;
    if (start < target) {
      element.textContent = Math.floor(start);
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target;
    }
  }
  
  updateCounter();
}

// Observe elements with counter class
const counters = document.querySelectorAll('[data-counter]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = parseInt(entry.target.dataset.counter);
      animateCounter(entry.target, target);
      counterObserver.unobserve(entry.target);
    }
  });
});

counters.forEach(counter => counterObserver.observe(counter));

// ----------------------
// FAQ Toggle Animation
// ----------------------
document.querySelectorAll('.faq-item').forEach(item => {
  const question = item.querySelector('h3, h4');
  if (question) {
    question.style.cursor = 'pointer';
    question.addEventListener('click', function() {
      const answer = this.nextElementSibling;
      if (answer) {
        answer.style.maxHeight = answer.style.maxHeight ? null : answer.scrollHeight + 'px';
        answer.style.overflow = 'hidden';
        answer.style.transition = 'max-height 0.3s ease';
      }
    });
  }
});

// ----------------------
// Performance Optimization
// ----------------------
// Debounce function for scroll and resize events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Apply debounce to scroll events
window.addEventListener('scroll', debounce(function() {
  revealOnScroll();
}, 10));

// ----------------------
// Console Welcome Message
// ----------------------
console.log('%c🚀 Ayush AI Automation', 'color: #3B82F6; font-size: 24px; font-weight: bold;');
console.log('%cWebsite Improved with Enhanced UI/UX', 'color: #60A5FA; font-size: 14px;');
console.log('%cBlue Theme Applied Successfully ✓', 'color: #10B981; font-size: 12px;');

// ----------------------
// Preloader (Optional)
// ----------------------
window.addEventListener('load', function() {
  const preloader = document.querySelector('.preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 300);
    }, 500);
  }
});
