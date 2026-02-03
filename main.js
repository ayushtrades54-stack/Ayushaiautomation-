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
// Auto Add Icons to Cards
// ----------------------
document.addEventListener('DOMContentLoaded', function() {
  // Icon mapping based on content keywords
  const iconMap = {
    'instagram': '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>',
    'whatsapp': '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>',
    'automation': '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m5.2-13.2 4.2-4.2m-4.2 4.2-4.2-4.2m13.2 5.2h-6m-6 0H1m13.2 5.2 4.2 4.2m-4.2-4.2-4.2 4.2"></path></svg>',
    'sales': '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
    'funnel': '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>',
    'audit': '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    'setup': '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
    'launch': '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M14 10l6.1-6.1M9 21H3v-6M10 14l-6.1 6.1"></path></svg>',
    'optimize': '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
    'ai': '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
    'demo': '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>',
    'default': '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>'
  };

  // Add icons to service cards
  document.querySelectorAll('.service-card, .card').forEach((card, index) => {
    if (!card.querySelector('.card-icon')) {
      const heading = card.querySelector('h3');
      if (heading) {
        const text = heading.textContent.toLowerCase();
        let iconSvg = iconMap.default;
        
        // Find matching icon
        for (let [key, svg] of Object.entries(iconMap)) {
          if (text.includes(key)) {
            iconSvg = svg;
            break;
          }
        }
        
        const iconDiv = document.createElement('div');
        iconDiv.className = 'card-icon';
        iconDiv.innerHTML = iconSvg;
        card.insertBefore(iconDiv, card.firstChild);
      }
    }
  });

  // Add step numbers
  document.querySelectorAll('.step').forEach((step, index) => {
    if (!step.querySelector('.step-number') && !step.querySelector('.card-icon')) {
      const numberDiv = document.createElement('div');
      numberDiv.className = 'step-number';
      numberDiv.textContent = index + 1;
      step.insertBefore(numberDiv, step.firstChild);
    }
  });
});

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
