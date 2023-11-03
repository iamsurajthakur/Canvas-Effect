const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight - 4;

window.addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight - 4;
});

//!       <--------- variable ----------->

let colorArr = [
  '#dc2f02',
  '#fca311',
  '#0466c8',
  '#c2dfe3',
  '#e01a4f',
  '#22007c',
  '#72b01d',
  '#ff4d6d'
]
let particles = [];
let radius = 13;

class mouse{
  x
  y
}

addEventListener('mousemove',(e)=>{
    mouse.x = e.clientX;
    mouse.y = e.clientY;
})
function getDistance(x1, y1, x2, y2) {
  xDistance = x2 - x1;
  yDistance = y2 - y1;

  return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

function rotate(velocity, angle) {
  const rotatedVelocities = {
      x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
      y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
  };

  return rotatedVelocities;
}


function resolveCollision(particle, otherParticle) {
  const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
  const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

  const xDist = otherParticle.x - particle.x;
  const yDist = otherParticle.y - particle.y;

  // Prevent accidental overlap of particles
  if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

      // Grab angle between the two colliding particles
      const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

      // Store mass in var for better readability in collision equation
      const m1 = particle.mass;
      const m2 = otherParticle.mass;

      // Velocity before equation
      const u1 = rotate(particle.velocity, angle);
      const u2 = rotate(otherParticle.velocity, angle);

      // Velocity after 1d collision equation
      const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
      const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

      // Final velocity after rotating axis back to original location
      const vFinal1 = rotate(v1, -angle);
      const vFinal2 = rotate(v2, -angle);

      // Swap particle velocities for realistic bounce effect
      particle.velocity.x = vFinal1.x;
      particle.velocity.y = vFinal1.y;

      otherParticle.velocity.x = vFinal2.x;
      otherParticle.velocity.y = vFinal2.y;
  }
}

//!       <--------- main ----------->

function Particle(x, y,radius, color) {
  this.x = x;
  this.y = y;
  this.velocity = {
    x: (Math.random() * -2) * 3,
    y: (Math.random() * -2) * 3,
  };
  this.radius = radius;
  this.color = color;
  this.mass = 1;
  this.opacity = 0;

  this.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2, false);
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = this.color;
    ctx.stroke();
    ctx.closePath;
  };

  this.update = function () {

    for(let i=0;i<particles.length;i++){
      if(this === particles[i]) continue;

      if (getDistance(this.x, this.y, particles[i].x, particles[i].y) - this.radius * 2 < 0){
      resolveCollision(this,particles[i]);
      }
    }
    if (this.x + this.radius >= innerWidth || this.x - this.radius <= 0) {
      this.velocity.x = -this.velocity.x;
    }
    if (this.y + this.radius >= innerHeight || this.y - this.radius <= 0) {
      this.velocity.y = -this.velocity.y;
    }
    if(getDistance(mouse.x,mouse.y,this.x,this.y) < 120 && this.opacity < 0.6){
      this.opacity = 0.5;
    }
    else{
      this.opacity -= 0.1;
      this.opacity = Math.max(0,this.opacity)
    }
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.draw();
  };
}

for (let i = 0; i < 300; i++) {
  let x = Math.random() * (canvas.width - radius - 100 + 1) + 100;
  let y = Math.random() * (canvas.height - radius - 100 + 1) + 100;
  let color = colorArr[Math.floor(Math.random() * colorArr.length)];

  //* code for generating particles but never overlapping

  if (i !== 0) {
    for (let j = 0; j < particles.length; j++) {
      if (getDistance(x, y, particles[j].x, particles[j].y) - radius * 2 < 0) {
        x = Math.random() * (canvas.width - radius - 100 + 1) + 100;
        y = Math.random() * (canvas.height - radius - 100 + 1) + 100;
        j = -1;
      }
    }
  }

  particles.push(new Particle(x, y, radius, color));
}

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, innerWidth, innerHeight);

  particles.forEach((particle) => {
    particle.update();
  });
}

animate();