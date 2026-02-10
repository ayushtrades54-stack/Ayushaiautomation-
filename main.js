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
    'linkedin': '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>',
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
