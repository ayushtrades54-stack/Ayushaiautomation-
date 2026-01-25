function toggleMenu() {
  const menu = document.getElementById("mobileMenu");
  if (menu.style.display === "flex") {
    menu.style.display = "none";
  } else {
    menu.style.display = "flex";
  }
}

// Background automation flow animation
const canvas = document.getElementById("bg-canvas") || document.createElement("canvas");
canvas.id = "bg-canvas";
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");
let w, h;

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

let particles = Array.from({length: 70}, () => ({
  x: Math.random()*w,
  y: Math.random()*h,
  vx: (Math.random()-0.5)*0.4,
  vy: (Math.random()-0.5)*0.4
}));

function animate() {
  ctx.clearRect(0,0,w,h);

  particles.forEach((p,i) => {
    p.x += p.vx;
    p.y += p.vy;

    if(p.x<0||p.x>w) p.vx*=-1;
    if(p.y<0||p.y>h) p.vy*=-1;

    ctx.beginPath();
    ctx.arc(p.x,p.y,1.5,0,Math.PI*2);
    ctx.fillStyle = "rgba(124,58,237,0.8)";
    ctx.fill();

    for(let j=i+1;j<particles.length;j++){
      let q=particles[j];
      let dx=p.x-q.x, dy=p.y-q.y;
      let dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<130){
        ctx.strokeStyle="rgba(56,189,248,0.15)";
        ctx.lineWidth=1;
        ctx.beginPath();
        ctx.moveTo(p.x,p.y);
        ctx.lineTo(q.x,q.y);
        ctx.stroke();
      }
    }
  });

  requestAnimationFrame(animate);
}
animate();
