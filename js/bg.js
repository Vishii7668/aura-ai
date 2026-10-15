/* Aura AI – dreamy aurora background (raw WebGL), custom cursor, scroll reveals */
(function () {
  const cv = document.getElementById("bgGL");
  if (!cv) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gl = cv.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false });
  if (!gl) { cv.style.background = "radial-gradient(80% 60% at 70% 20%, #3a2a00, #000 70%)"; return; }

  const vs = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
  const fs = `precision mediump float;
uniform vec2 r;uniform float t;uniform vec2 m;uniform float s;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float blob(vec2 p,vec2 c,float rad){float d=length(p-c);return exp(-d*d/(rad*rad));}
void main(){
 vec2 uv=gl_FragCoord.xy/r; float asp=r.x/r.y; vec2 p=vec2(uv.x*asp,uv.y);
 float tt=t*.06; float sc=s*1.5;
 vec3 base=vec3(.027,.024,.043);
 vec3 butter=vec3(1.,.90,.54), peach=vec3(1.,.70,.62), lilac=vec3(.72,.64,1.), mint=vec3(.62,.95,.86);
 vec3 c=base;
 c+=butter*.55*blob(p,vec2(asp*(.75+.18*sin(tt*1.1)),.78+.12*cos(tt*.9)-sc*.2),.42);
 c+=lilac*.45*blob(p,vec2(asp*(.18+.15*cos(tt*.8)),.30+.15*sin(tt*1.2)+sc*.1),.48);
 c+=peach*.40*blob(p,vec2(asp*(.48+.22*sin(tt*.7+2.)),.10+.12*cos(tt*1.3)),.40);
 c+=mint*.18*blob(p,vec2(asp*(.95+.1*cos(tt*1.4)),.20+.2*sin(tt*.6)),.30);
 vec2 mp=vec2(m.x*asp,m.y); c+=butter*.18*blob(p,mp,.25);
 float wave=n(p*3.+vec2(tt*2.,-tt))*.08; c*=1.+wave;
 vec2 g=gl_FragCoord.xy/3.; vec2 cell=floor(g/12.); vec2 f=fract(g/12.)-.5;
 float rnd=h(cell); float star=0.;
 if(rnd>.965){ float tw=.5+.5*sin(t*(1.5+rnd*3.)+rnd*40.); vec2 o=vec2(h(cell+1.3),h(cell+7.1))-.5; vec2 q=f-o*.6;
   float d=length(q); star=(smoothstep(.06,0.,d)+ .5*smoothstep(.012,0.,abs(q.x))*smoothstep(.22,0.,abs(q.y)) + .5*smoothstep(.012,0.,abs(q.y))*smoothstep(.22,0.,abs(q.x)))*tw; }
 c+=vec3(1.,.96,.85)*star*.7;
 c*=smoothstep(1.35,.35,length((uv-.5)*vec2(1.15,1.)));
 c=pow(c,vec3(.95));
 gl_FragColor=vec4(c*.78,1.);
}`;
  function sh(type, src) { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return o; }
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { cv.style.background = "#000"; return; }
  gl.useProgram(pr);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uR = gl.getUniformLocation(pr, "r"), uT = gl.getUniformLocation(pr, "t"), uM = gl.getUniformLocation(pr, "m"), uS = gl.getUniformLocation(pr, "s");
  const scale = innerWidth < 760 ? 0.45 : 0.6;
  function resize() { cv.width = Math.max(2, innerWidth * scale | 0); cv.height = Math.max(2, innerHeight * scale | 0); gl.viewport(0, 0, cv.width, cv.height); }
  addEventListener("resize", resize); resize();
  let mx = .5, my = .5, tx = .5, ty = .5, run = true;
  addEventListener("pointermove", e => { tx = e.clientX / innerWidth; ty = 1 - e.clientY / innerHeight; }, { passive: true });
  document.addEventListener("visibilitychange", () => { run = !document.hidden; if (run && !reduce) requestAnimationFrame(loop); });
  function draw(time) {
    mx += (tx - mx) * .04; my += (ty - my) * .04;
    gl.uniform2f(uR, cv.width, cv.height); gl.uniform1f(uT, time * .001); gl.uniform2f(uM, mx, my);
    gl.uniform1f(uS, scrollY / Math.max(1, document.body.scrollHeight - innerHeight));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  function loop(time) { if (!run) return; draw(time); requestAnimationFrame(loop); }
  if (reduce) draw(8000); else requestAnimationFrame(loop);
})();

/* custom cursor (desktop only) */
(function () {
  if (matchMedia("(hover: none)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const dot = document.createElement("div"), ring = document.createElement("div");
  dot.className = "cur-dot"; ring.className = "cur-ring"; document.body.append(dot, ring);
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
  addEventListener("pointermove", e => { x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px,${y}px)`; }, { passive: true });
  document.addEventListener("pointerover", e => { ring.classList.toggle("big", !!(e.target.closest && e.target.closest("a,button,.cat-card,.ins-card,select,input,textarea"))); });
  (function f() { rx += (x - rx) * .18; ry += (y - ry) * .18; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(f); })();
  document.documentElement.classList.add("has-cursor");
})();

/* rotating hero word */
(function () {
  const el = document.getElementById("rotWord"); if (!el) return;
  const words = (el.dataset.words || "").split("|").filter(Boolean); if (words.length < 2) return;
  let i = 0;
  setInterval(() => {
    el.classList.add("out");
    setTimeout(() => { i = (i + 1) % words.length; el.textContent = words[i]; el.classList.remove("out"); el.classList.add("in"); setTimeout(() => el.classList.remove("in"), 500); }, 350);
  }, 2400);
})();

/* scroll reveals */
(function () {
  const els = document.querySelectorAll("main section .sec-head, main section .wrap > *:not(.sec-head), .marquee, footer .foot > div");
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  els.forEach(e => e.classList.add("reveal"));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  els.forEach(e => io.observe(e));
})();

/* pause SVG logo animations for reduced motion */
(function(){ if(matchMedia("(prefers-reduced-motion: reduce)").matches) document.querySelectorAll("svg.aura-mark").forEach(s=>{ try{ s.pauseAnimations(); }catch(e){} }); })();
