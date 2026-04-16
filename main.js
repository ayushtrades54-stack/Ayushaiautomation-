// =============================================
// IMPROVED MAIN.JS WITH AUTOMATION ANIMATIONS
// =============================================

// ----------------------
// Polyfill for roundRect (for older browsers)
// ----------------------
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    this.beginPath();
    this.moveTo(x + radius, y);
    this.arcTo(x + width, y, x + width, y + height, radius);
    this.arcTo(x + width, y + height, x, y + height, radius);
    this.arcTo(x, y + height, x, y, radius);
    this.arcTo(x, y, x + width, y, radius);
    this.closePath();
    return this;
  };
}

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

// =============================================
// NEW AUTOMATION BACKGROUND ANIMATIONS
// =============================================
const canvas = document.getElementById("automation-bg");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let workflowNodes = [];
  let messageBubbles = [];
  let dataLines = [];
  let floatingIcons = [];

  // Initialize canvas
  function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Create workflow nodes
    workflowNodes = [];
    for (let i = 0; i < 6; i++) {
      workflowNodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 40 + Math.random() * 20,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        pulsePhase: Math.random() * Math.PI * 2,
        connections: []
      });
    }
    
    // Create message bubbles
    messageBubbles = [];
    const messages = [
      { text: "Hi!", type: "ig" },
      { text: "Book a call", type: "bot" },
      { text: "Interested!", type: "wa" },
      { text: "Let's talk", type: "bot" }
    ];
    
    for (let i = 0; i < 8; i++) {
      const msg = messages[i % messages.length];
      messageBubbles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        text: msg.text,
        type: msg.type,
        opacity: 0.6 + Math.random() * 0.4,
        speedY: -0.2 - Math.random() * 0.3,
        lifespan: 0
      });
    }
    
    // Create data flow lines
    dataLines = [];
    for (let i = 0; i < 15; i++) {
      dataLines.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: 50 + Math.random() * 100,
        angle: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1,
        flowProgress: Math.random()
      });
    }
    
    // Create floating automation icons
    floatingIcons = [];
    const icons = ['⚙️', '🤖', '💬', '📊', '✓', '→'];
    for (let i = 0; i < 12; i++) {
      floatingIcons.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        icon: icons[Math.floor(Math.random() * icons.length)],
        size: 20 + Math.random() * 15,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      });
    }
  }
  
  initCanvas();
  
  // Draw workflow nodes with connections
  function drawWorkflowNodes() {
    // Draw connections first (behind nodes)
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < workflowNodes.length; i++) {
      for (let j = i + 1; j < workflowNodes.length; j++) {
        const dx = workflowNodes[j].x - workflowNodes[i].x;
        const dy = workflowNodes[j].y - workflowNodes[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 300) {
          const opacity = (1 - distance / 300) * 0.12;
          ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
          
          ctx.beginPath();
          ctx.moveTo(workflowNodes[i].x, workflowNodes[i].y);
          ctx.lineTo(workflowNodes[j].x, workflowNodes[j].y);
          ctx.stroke();
        }
      }
    }
    
    // Draw nodes
    workflowNodes.forEach(node => {
      const pulse = Math.sin(node.pulsePhase) * 0.2 + 0.8;
      const size = node.size * pulse;
      
      // Outer glow
      const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
      gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.08)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner circle
      ctx.fillStyle = 'rgba(59, 130, 246, 0.12)';
      ctx.beginPath();
      ctx.arc(node.x, node.y, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Center dot
      ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
      ctx.beginPath();
      ctx.arc(node.x, node.y, size * 0.2, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  // Draw message bubbles
  function drawMessageBubbles() {
    messageBubbles.forEach(bubble => {
      const alpha = Math.min(bubble.opacity, 0.15);
      
      // Bubble background
      if (bubble.type === 'ig') {
        ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`;
      } else if (bubble.type === 'wa') {
        ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
      }
      
      ctx.beginPath();
      ctx.roundRect(bubble.x - 40, bubble.y - 15, 80, 30, 15);
      ctx.fill();
      
      // Bubble text
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(bubble.text, bubble.x, bubble.y + 4);
    });
  }
  
  // Draw data flow lines
  function drawDataLines() {
    dataLines.forEach(line => {
      const endX = line.x + Math.cos(line.angle) * line.length;
      const endY = line.y + Math.sin(line.angle) * line.length;
      
      const gradient = ctx.createLinearGradient(line.x, line.y, endX, endY);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0)');
      gradient.addColorStop(line.flowProgress, 'rgba(59, 130, 246, 0.12)');
      gradient.addColorStop(Math.min(line.flowProgress + 0.3, 1), 'rgba(168, 85, 247, 0.08)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(line.x, line.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      // Flow dot
      const dotX = line.x + Math.cos(line.angle) * line.length * line.flowProgress;
      const dotY = line.y + Math.sin(line.angle) * line.length * line.flowProgress;
      
      ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
      ctx.beginPath();
      ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  // Draw floating icons
  function drawFloatingIcons() {
    floatingIcons.forEach(icon => {
      ctx.save();
      ctx.translate(icon.x, icon.y);
      ctx.rotate(icon.rotation);
      
      ctx.font = `${icon.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.fillText(icon.icon, 0, 0);
      
      ctx.restore();
    });
  }
  
  // Update animations
  function updateAnimation() {
    // Update workflow nodes
    workflowNodes.forEach(node => {
      node.x += node.speedX;
      node.y += node.speedY;
      node.pulsePhase += 0.02;
      
      // Bounce off edges
      if (node.x < 0 || node.x > canvas.width) node.speedX *= -1;
      if (node.y < 0 || node.y > canvas.height) node.speedY *= -1;
    });
    
    // Update message bubbles
    messageBubbles.forEach(bubble => {
      bubble.y += bubble.speedY;
      bubble.lifespan += 0.01;
      
      // Fade out at top
      if (bubble.y < -50) {
        bubble.y = canvas.height + 50;
        bubble.x = Math.random() * canvas.width;
        bubble.lifespan = 0;
      }
      
      bubble.opacity = Math.max(0, 1 - bubble.lifespan);
    });
    
    // Update data lines
    dataLines.forEach(line => {
      line.flowProgress += 0.01;
      if (line.flowProgress > 1) {
        line.flowProgress = 0;
      }
    });
    
    // Update floating icons
    floatingIcons.forEach(icon => {
      icon.x += icon.speedX;
      icon.y += icon.speedY;
      icon.rotation += icon.rotationSpeed;
      
      // Wrap around edges
      if (icon.x < -50) icon.x = canvas.width + 50;
      if (icon.x > canvas.width + 50) icon.x = -50;
      if (icon.y < -50) icon.y = canvas.height + 50;
      if (icon.y > canvas.height + 50) icon.y = -50;
    });
  }
  
  // Main animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawDataLines();
    drawWorkflowNodes();
    drawMessageBubbles();
    drawFloatingIcons();
    
    updateAnimation();
    requestAnimationFrame(animate);
  }
  
  animate();
  
  // Resize handler
  window.addEventListener('resize', debounce(() => {
    initCanvas();
  }, 250));
}

// ----------------------
// Mouse Tracking for Interactive Elements
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
console.log('%cAutomation-Themed Background Active ✓', 'color: #60A5FA; font-size: 14px;');
console.log('%cWorkflow Animations Running ✓', 'color: #10B981; font-size: 12px;');

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




// =============================================
// FINAL FIX: Draggable Social + Navbar Brand
// =============================================

document.addEventListener('DOMContentLoaded', function () {

  // --- Navbar brand fix ---
  const brand = document.querySelector('.nav-brand');
  if (brand) {
    brand.style.cssText += `
      font-size: clamp(0.7rem, 1.8vw, 0.95rem) !important;
      white-space: nowrap !important;
      letter-spacing: -0.3px !important;
    `;
  }

  // --- Hide karo purane social buttons ---
  document.querySelectorAll('a[href*="wa.me"], a[href*="instagram.com"]').forEach(a => {
    const parent = a.parentElement;
    const pStyle = window.getComputedStyle(parent);
    if (pStyle.position === 'fixed') {
      parent.style.display = 'none';
    }
  });

  // --- Naya draggable social widget ---
  const widget = document.createElement('div');
  widget.id = 'snap-social';
  widget.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 20px;
    z-index: 99999;
    cursor: grab;
    touch-action: none;
    user-select: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: transform 0.15s ease;
  `;

  widget.innerHTML = `
    <a href="https://instagram.com/ayush.automation" target="_blank"
      style="display:flex;align-items:center;gap:8px;padding:9px 14px 9px 10px;
      border-radius:25px;background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);
      color:white;text-decoration:none;font-size:13px;font-weight:600;
      box-shadow:0 4px 14px rgba(0,0,0,0.3);white-space:nowrap;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2">
        <rect x="2" y="2" width="20" height="20" rx="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="1.2" fill="white" stroke="none"/>
      </svg>
      Instagram
    </a>
    <a href="https://wa.me/919477293867" target="_blank"
      style="display:flex;align-items:center;gap:8px;padding:9px 14px 9px 10px;
      border-radius:25px;background:#25D366;
      color:white;text-decoration:none;font-size:13px;font-weight:600;
      box-shadow:0 4px 14px rgba(0,0,0,0.3);white-space:nowrap;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
      WhatsApp
    </a>
  `;

  document.body.appendChild(widget);

  // --- Snap-to-edge drag logic ---
  let dragging = false;
  let startX, startY, origLeft, origTop;
  const navbar = document.querySelector('.navbar');

  function getNavH() {
    return navbar ? navbar.offsetHeight + 8 : 68;
  }

  function snapToEdge() {
    const ww = window.innerWidth;
    const wh = window.innerHeight;
    const rect = widget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const distLeft = rect.left;
    const distRight = ww - rect.right;
    const distTop = rect.top - getNavH();
    const distBottom = wh - rect.bottom;

    const minDist = Math.min(distLeft, distRight, distTop, distBottom);

    let finalLeft = rect.left;
    let finalTop = rect.top;
    const padding = 14;

    if (minDist === distRight) {
      finalLeft = ww - rect.width - padding;
    } else if (minDist === distLeft) {
      finalLeft = padding;
    } else if (minDist === distBottom) {
      finalTop = wh - rect.height - padding;
    } else {
      finalTop = getNavH() + padding;
    }

    // Boundary clamp
    finalLeft = Math.max(padding, Math.min(finalLeft, ww - rect.width - padding));
    finalTop = Math.max(getNavH() + padding, Math.min(finalTop, wh - rect.height - padding));

    widget.style.transition = 'left 0.3s ease, top 0.3s ease';
    widget.style.left = finalLeft + 'px';
    widget.style.top = finalTop + 'px';
    widget.style.right = 'auto';
    widget.style.bottom = 'auto';
  }

  function startDrag(cx, cy) {
    dragging = true;
    startX = cx;
    startY = cy;
    const rect = widget.getBoundingClientRect();
    origLeft = rect.left;
    origTop = rect.top;
    widget.style.transition = 'none';
    widget.style.cursor = 'grabbing';
  }

  function moveDrag(cx, cy) {
    if (!dragging) return;
    const navH = getNavH();
    let newLeft = origLeft + (cx - startX);
    let newTop = origTop + (cy - startY);

    const maxLeft = window.innerWidth - widget.offsetWidth - 5;
    const maxTop = window.innerHeight - widget.offsetHeight - 5;

    newLeft = Math.max(5, Math.min(newLeft, maxLeft));
    newTop = Math.max(navH, Math.min(newTop, maxTop));

    widget.style.left = newLeft + 'px';
    widget.style.top = newTop + 'px';
    widget.style.right = 'auto';
    widget.style.bottom = 'auto';
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    widget.style.cursor = 'grab';
    snapToEdge(); // Chhod do toh nearest edge pe snap ho
  }

  // Mouse
  widget.addEventListener('mousedown', e => {
    if (e.target.tagName === 'A' || e.target.closest('a')) return;
    startDrag(e.clientX, e.clientY);
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => moveDrag(e.clientX, e.clientY));
  document.addEventListener('mouseup', endDrag);

  // Touch
  widget.addEventListener('touchstart', e => {
    startDrag(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    if (dragging) {
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
      e.preventDefault();
    }
  }, { passive: false });

  document.addEventListener('touchend', endDrag);

});








// ===== TESTIMONIAL SLIDER =====
let currentSlide = 0;
const slides = document.querySelectorAll('.testi-slide');
const dots = document.querySelectorAll('.testi-dot');

function goToSlide(n) {
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = n;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

function changeSlide(dir) {
  let next = (currentSlide + dir + slides.length) % slides.length;
  goToSlide(next);
}

// Auto-slide every 5 seconds
setInterval(() => changeSlide(1), 5000);
// ===== END TESTIMONIAL SLIDER =====






