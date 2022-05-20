/**** <head> *****
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.1/p5.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.1/addons/p5.sound.js"></script>
<style>* {padding: 0; margin: 0}</style>
******************/

let body = document.querySelector('body');
if (body)
    body.innerHTML = "";

// ========== start ========== //

// const DEBUG = true;
const DEBUG = false;

let particles = [], LENGTH = 3;
let colors = [
    [135, 206, 255, 255],
    [155, 48, 255, 255],
    [240, 255, 240, 255],
    [255, 160, 122, 255],
    [255, 231, 186, 255],
    [245, 245, 220, 255],
    [175, 238, 238, 255],
    [255, 250, 250, 255],
    [255, 250, 205, 255],
    [193, 255, 193, 255],
    [255, 228, 225, 255],
    [255, 69, 0, 255],
];

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(30);
    background(0);
    for(let i = 0; i < LENGTH; i++) {
        particles.push(new Particle({
            radius: 30,
            speed:  0.2,
            angle:  ((i+1) / LENGTH) * TWO_PI ,
            color: colors[Math.floor(random(colors.length))],
        }));
    }
    if(DEBUG) {
        console.log(particles);
    }
}

function draw() {
    background(0);
    for(particle of particles) {
        particle.update();
        particle.draw();
    }
    if(DEBUG && frameCount == 3) {
        noLoop();
    }
}

function Particle(params = {}) {
    this.center = params.center || [windowWidth / 2, windowHeight / 2];
    this.radius = params.radius || 100;
    this.BASE_RADIUS = this.radius;
    this.color = params.color || [255, 250, 250, 255];
    this.speed = params.speed || 0.1;
    this.angle = params.angle || random(TWO_PI);
    this.shadow = [];
    this.maxShadow = params.maxShadow || 10;
    this._noise_x = random();
}

Particle.prototype.update = function() {
    this.angle = this.angle + this.speed;
    this.radius = noise(this._noise_x) * 20 + this.BASE_RADIUS;
    this.shadow.splice(0, 0, {
        angle: this.angle,
        radius: this.radius,
    });
    if (this.shadow.length > this.maxShadow) {
        this.shadow.splice(this.shadow.length - 1, 1);
    }
    this._noise_x += 0.4;
}

Particle.prototype.drawPoints = function() {
    let points = [], num_points = Math.floor(this.speed * this.shadow.length * this.radius);
    const calcXY = (r, a)=>{
        return [
            this.center[0] + r * cos(a),
            this.center[1] + r * sin(a),
        ]
    };
    if(this.shadow.length == 1) {
        points.push({
            pos: calcXY(this.shadow[0].radius, this.shadow[0].angle),
            color: this.color,
        });
    }
    if(this.shadow.length > 1) {
        let start_alpha = this.color[3], end_alpha = 0;
        let in_start_alpha = start_alpha;
        for(let i = 1; i < this.shadow.length; i++) {
            // 为每两个shadow插值
            points.push({
                pos: calcXY(this.shadow[i-1].radius, this.shadow[i-1].angle),
                color: [...this.color.slice(0, 3), in_start_alpha],
            });
            let in_end_alpha = Math.floor(map(i, 0, this.shadow.length - 1, in_start_alpha, end_alpha));
            let sigle_shadow_num_points = Math.floor((num_points - this.shadow.length + 1) / 
                                                     (this.shadow.length - 1));
            for(let j = 1; j <= sigle_shadow_num_points; j++) {
                points.push({
                    pos: calcXY(
                        map(j, 0, sigle_shadow_num_points + 1, this.shadow[i-1].radius, this.shadow[i].radius),
                        map(j, 0, sigle_shadow_num_points + 1, this.shadow[i-1].angle, this.shadow[i].angle),
                    ),
                    color: [...this.color.slice(0, 3), 
                            Math.floor(map(j, 0, sigle_shadow_num_points + 1, in_start_alpha, in_end_alpha))],
                });
            }
            in_start_alpha = in_end_alpha;
        }
    }
    return points;
}

Particle.prototype.draw = function() {
    let points = this.drawPoints();
    if(DEBUG) {
        console.log("shadows: ", this.shadow);
        console.log("points: ", points);
    }
    strokeWeight(2);
    for(p of points) {
        stroke(...p.color);
        point(...p.pos);
    }
    // if(points.length == 1) {
    //     stroke(...points[0].color);
    //     point(...points[0].pos);
    // } else if(points.length > 1) {
    //     for(let i = 1; i < points.length; i++) {
    //         stroke(...points[i-1].color);
    //         line(...points[i-1].pos, ...points[i].pos);
    //     }
    // }
}


// ========== end ========== //
new p5();
