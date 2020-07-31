
let n;
let boundaries;
let borderMode;
let repel;
let radius;
let initVel;
let tempPlates;

function setup() {

  W = window.innerWidth;
  H = window.innerHeight;
  canvas = createCanvas(W, H);

  n = 40;
  borderMode = 1; // [0:ramp wall or 1:solid wall]
  boundaries = [W/10, 9*W/10, H/10, H-H/10];
  repel = 50;
  radius = 100;
  initVel = 2;
  tempPlates = true;
  
  imageMode(CENTER);
  angleMode(RADIANS);
  
  pGs = [];
  generatePointGraphics();

  ps = []
  
  for (var i=0; i<n; i+=1){
	  if (random(0,2)>1){
		  ps.push(new Point(i,random(boundaries[0],boundaries[1]),random(boundaries[2],boundaries[3]),random(-initVel,initVel),random(-initVel,initVel),random(14,30)));
	  } else {
		  ps.push(new Point(i,random(boundaries[0],boundaries[1]),random(boundaries[2],boundaries[3]),random(-initVel,initVel),random(-initVel,initVel),random(5,40)));
	  }
  }
/*
	ps.push(new Point(0,W/2-100,H/2-100,0,0,random(10,30)));
	ps.push(new Point(1,W/2,H/2,0,0,random(10,30)));
	ps.push(new Point(2,W/2+100,H/2+100,0,0,random(10,30)));
*/
  pDs = distancePoints();
}

function generatePointGraphics(){
	let pGCols = [
		[color(87, 74, 240), color(255)],
		[color(52, 75, 217), color(255)],
		[color(43, 111, 194), color(255)],
		[color(54, 155, 173), color(255)],
		[color(56, 186, 88), color(255)],
		[color(102, 176, 39), color(255)],
		[color(194, 199, 66), color(255)],
		[color(207, 175, 56), color(255)],
		[color(246, 115, 24), color(255)],
		[color(245, 23, 21), color(255)],
	];
	for (var i=0; i<10; i+=1){
		pGs.push(createGraphics(20,20));
		pGs[i].stroke(pGCols[i][0]);
		pGs[i].fill(pGCols[i][1]);
		pGs[i].strokeWeight(4);
		pGs[i].ellipse(10,10,14,14);
	}
}

function tempToScale(t){
	return floor(10*((1/PI) * atan((t-20)/4)+0.5));
}


function draw() {
	background(250);
	processPoints();
	if (tempPlates){
		strokeWeight(5);
		stroke(245, 23, 21);
		line(W/2,(H+boundaries[3])/2,boundaries[1],(H+boundaries[3])/2);
		stroke(52, 75, 217);
		line(W/2,boundaries[2]/2,boundaries[0],boundaries[2]/2);
	}
}

class Point{
	constructor(id, x, y, vx, vy, T){
		this.id = id;
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
		this.fvy = vy;
		this.T = T;
		this.Tx = tempToScale(this.T);
		this.fvy = this.vy + (20-this.T)/100;
	}
	
	draw() {
		image(pGs[this.Tx],this.x,this.y);
	}
	
	updatePos() {
		this.x += this.vx;
		this.y += this.fvy;
	}
	
	updateTemp(){
		if (tempPlates){
			if (this.x<W/2 && this.y < 2*boundaries[2]){
				this.T -= 0.02;
			}
			
			if (this.x>W/2 && this.y > H-2*(H-boundaries[3])){
				this.T += 0.02;
			}
		}

		
// 		this.T -= 0.01;
// 		this.vy -= (this.T-20)/100;
		this.Tx = tempToScale(this.T);
// 		this.vy += (this.T-20)/100;
	}
	
	updateVel(Click, ClickFactor) {
		if (!Click){
			strokeWeight(1);
			let d2;
			let f;
			let theta;
			for (var i=0; i<n; i+=1){
				if (i !== this.id){
					d2 = pDs[this.id][i][0]*pDs[this.id][i][0] + pDs[this.id][i][1]*pDs[this.id][i][1];
					if (d2 < radius*radius){
						f = repel/d2;
						if (f<1){
							theta = atan(pDs[this.id][i][1]/pDs[this.id][i][0]);
							this.vx += abs(pDs[this.id][i][0])/pDs[this.id][i][0] * abs(f*cos(theta));
							this.vy += abs(pDs[this.id][i][1])/pDs[this.id][i][1] * abs(f*sin(theta));
							
							if (this.id < i){
								stroke(100,100,100,f*7000);
								line(ps[this.id].x,ps[this.id].y,ps[i].x,ps[i].y);
							}
						}
					}
	// 				print('THETA',this.id,i,theta)
	// 				print('X',this.id,i,abs(pDs[this.id][i][0])/pDs[this.id][i][0] * abs(d*cos(theta)))
	// 				print('Y',this.id,i,abs(pDs[this.id][i][1])/pDs[this.id][i][1] * abs(d*sin(theta)))
				}	
			}
			if (!borderMode){
				if (this.x < boundaries[0]){
					if (this.x>0){
						this.vx += tan(PI/2 * (1 - this.x/boundaries[0]));
						this.vx *= 0.96;
					} else {
						this.vx *= -1;
					}
				}
				if (this.x > boundaries[1]){
					if (this.x<W){
						this.vx -= tan(PI/2 * (1 - (W-this.x)/(W-boundaries[1])));
						this.vx *= 0.96;
					} else {
						this.vx *= -1;
					}
				}
				if (this.y < boundaries[2]){
					if (this.y>0){
						this.vy += tan(PI/2 * (1 - this.y/boundaries[2]));
						this.vy *= 0.96;
					} else {
						this.vy *= -1;
					}
				}
				if (this.y > boundaries[3]){
					if (this.y<H){
						this.vy -= tan(PI/2 * (1 - (H-this.y)/(H-boundaries[3])));
						this.vy *= 0.96;
					} else {
						this.vy *= -1;
					}
				}
			}
			else {
				if (this.x < boundaries[0]){
					this.vx *= -0.9;
					this.x = boundaries[0] + (boundaries[0]-this.x);
				}
				if (this.x > boundaries[1]){
					this.vx *= -0.9;
					this.x = boundaries[1]-(this.x-boundaries[1]);
				}
				if (this.y < boundaries[2]){
					this.vy *= -0.9;
					this.y = boundaries[2] + (boundaries[2]-this.y);
				}
				if (this.y > boundaries[3]){
					this.vy *= -0.9;
					this.y = boundaries[3]-(this.y-boundaries[3]);
				}
			}
			this.vx *= 0.99;
			this.vy *- 0.99;
			
		} else {
			let d2;
			let f;
			let theta;
			d2 = (this.x-mouseX)*(this.x-mouseX) + (this.y-mouseY)*(this.y-mouseY);
			f = ClickFactor*repel/sqrt(d2);
			theta = atan((this.y-mouseY)/(this.x-mouseX));
			this.vx += abs((this.x-mouseX))/(this.x-mouseX) * abs(f*cos(theta));
			this.vy += abs((this.y-mouseY))/(this.y-mouseY) * abs(f*sin(theta));
		}
		this.fvy = this.vy + (20-this.T)/20;
	}
}

function processPoints(){
	for (var p=0; p<ps.length; p+=1){
// 		print(ps[p])
		ps[p].updatePos();
		pDs = distancePoints();
		ps[p].updateTemp();
		ps[p].updateVel(false);
		ps[p].draw();
	}
}

function distancePoints(){
	let dP = [];
	for (var i=0; i<n; i+=1){
		dP.push([]);
		for (var j=0; j<n; j+=1){
			dP[i].push([]);
		}
	}
	for (var i=0; i<n; i+=1){
		for (var j=i+1; j<n; j+=1){
			dP[i][j].push(ps[i].x-ps[j].x);
			dP[i][j].push(ps[i].y-ps[j].y);
			
			dP[j][i].push(ps[j].x-ps[i].x);
			dP[j][i].push(ps[j].y-ps[i].y);
		}
	}
	return dP;
}

window.onresize = function() {
  resizeCanvas(windowWidth, windowHeight);
  W = windowWidth;
  H = windowHeight;
};

function mouseDragged(){
	for (var p=0; p<ps.length; p+=1){
		ps[p].updateVel(true,0.1);
	}
}

function mouseClicked(){
	for (var p=0; p<ps.length; p+=1){
		ps[p].updateVel(true,1);
	}
}