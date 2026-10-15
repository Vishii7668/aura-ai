/* Aura AI – scroll-driven 3D particle story (three.js r128) */
(function () {
  const stage = document.getElementById("story");
  const holder = document.getElementById("storyCanvas");
  if (!stage || !holder || typeof THREE === "undefined") { if (stage) stage.classList.add("story-static"); return; }

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = innerWidth < 760;
  const N = mobile ? 4200 : 9000;

  /* ---------- shapes (each returns Float32Array of N*3) ---------- */
  const rnd = (a, b) => a + Math.random() * (b - a);
  function cloud() {
    const p = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const r = rnd(2.5, 7), t = rnd(0, Math.PI * 2), u = rnd(-1, 1);
      p[i*3] = r * Math.sqrt(1-u*u) * Math.cos(t) * 1.4; p[i*3+1] = r * u * 0.8; p[i*3+2] = r * Math.sqrt(1-u*u) * Math.sin(t); }
    return p;
  }
  function brain() { // fibonacci sphere with folds
    const p = new Float32Array(N * 3), g = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y*y), th = g * i;
      let x = Math.cos(th) * r, z = Math.sin(th) * r;
      const fold = 1 + 0.07 * Math.sin(x * 14) * Math.sin(y * 12) * Math.cos(z * 10);
      const R = 2.3 * fold * (0.92 + Math.random() * 0.08);
      p[i*3] = x * R * 1.15; p[i*3+1] = y * R * 0.95; p[i*3+2] = z * R;
    }
    return p;
  }
  function inPoly(x, y, poly) { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c; } return c; }
  function logo() { // the Aura AI "A" mark: two legs, feet and the rising curve
    const L = [[51,8],[66,8],[39,104],[17,104]], Rr = [[54,8],[69,8],[103,104],[81,104]];
    const feet = [[[8,102],[48,102],[48,110],[8,110]], [[72,102],[112,102],[112,110],[72,110]]];
    const p = new Float32Array(N * 3); let i = 0;
    const curveN = Math.floor(N * 0.22);
    while (i < N - curveN) {
      const x = rnd(0, 120), y = rnd(0, 120);
      if (inPoly(x, y, L) || inPoly(x, y, Rr) || inPoly(x, y, feet[0]) || inPoly(x, y, feet[1])) {
        p[i*3] = (x - 60) / 22; p[i*3+1] = -(y - 58) / 22; p[i*3+2] = rnd(-0.35, 0.35); i++; }
    }
    for (; i < N; i++) { // bezier M14 84 C40 82, 62 74, 98 44 + node
      let t = Math.random(), x, y;
      if (t < 0.85) { t = t / 0.85; const u = 1 - t;
        x = u*u*u*14 + 3*u*u*t*40 + 3*u*t*t*62 + t*t*t*98; y = u*u*u*84 + 3*u*u*t*82 + 3*u*t*t*74 + t*t*t*44;
        x += rnd(-2, 2); y += rnd(-2, 2);
      } else { const a = rnd(0, Math.PI*2), r = rnd(6, 9); x = 101 + Math.cos(a)*r; y = 41 + Math.sin(a)*r; }
      p[i*3] = (x - 60) / 22; p[i*3+1] = -(y - 58) / 22; p[i*3+2] = rnd(-0.25, 0.25) + 0.4;
    }
    return p;
  }
  function chip() { // processor: square die, pins, traces
    const p = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const k = Math.random(); let x, y, z = 0;
      if (k < 0.35) { x = rnd(-1.2, 1.2); y = rnd(-1.2, 1.2); z = rnd(0, 0.35); }
      else if (k < 0.55) { const side = Math.floor(rnd(0, 4)), s = Math.round(rnd(-5, 5)) * 0.22, d = rnd(1.25, 1.75);
        [x, y] = [[s, d], [s, -d], [d, s], [-d, s]][side]; z = rnd(-0.02, 0.05); }
      else { const lane = Math.round(rnd(-7, 7)) * 0.3, len = rnd(1.8, 3.6), dir = Math.floor(rnd(0, 4));
        const a = lane, b = (dir < 2 ? 1 : -1) * len; [x, y] = dir % 2 ? [a, b] : [b, a]; z = rnd(-0.03, 0.03); }
      p[i*3] = x; p[i*3+1] = y; p[i*3+2] = z;
    }
    // tilt the board
    for (let i = 0; i < N; i++) { const y = p[i*3+1], z = p[i*3+2]; p[i*3+1] = y * 0.55 - z * 0.8; p[i*3+2] = y * 0.8 + z * 0.55; }
    return p;
  }
  function growth() { // rising bars with a curve on top
    const p = new Float32Array(N * 3), H = [0.5, 0.85, 1.3, 1.95, 2.8, 3.9];
    const curveN = Math.floor(N * 0.2);
    for (let i = 0; i < N - curveN; i++) {
      const b = Math.floor(rnd(0, 6)), h = H[b];
      p[i*3] = -3 + b * 1.2 + rnd(-0.32, 0.32); p[i*3+1] = -2 + rnd(0, h); p[i*3+2] = rnd(-0.32, 0.32);
    }
    for (let i = N - curveN; i < N; i++) { const t = Math.random(), e = (Math.exp(3 * t) - 1) / (Math.exp(3) - 1);
      p[i*3] = -3.4 + t * 6.9 + rnd(-0.05, 0.05); p[i*3+1] = -1.9 + e * 4.3 + rnd(-0.06, 0.06); p[i*3+2] = 0.5 + rnd(-0.05, 0.05); }
    return p;
  }
  const SHAPES = [cloud(), brain(), logo(), chip(), growth()];

  /* ---------- three.js scene ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  holder.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 11);

  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3); pos.set(SHAPES[0]);
  const col = new Float32Array(N * 3), delay = new Float32Array(N), seed = new Float32Array(N);
  const gold = new THREE.Color("#FFD24A"), cream = new THREE.Color("#F7F2DC"), amber = new THREE.Color("#C98A00");
  for (let i = 0; i < N; i++) {
    const r = Math.random(), c = r < 0.55 ? gold : r < 0.85 ? cream : amber;
    col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b; delay[i] = Math.random() * 0.35; seed[i] = Math.random() * 100;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));

  // soft round sprite
  const sc = document.createElement("canvas"); sc.width = sc.height = 64; const sx = sc.getContext("2d");
  const gr = sx.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,.8)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  sx.fillStyle = gr; sx.fillRect(0, 0, 64, 64);
  const mat = new THREE.PointsMaterial({ size: mobile ? 0.075 : 0.06, map: new THREE.CanvasTexture(sc), vertexColors: true, transparent: true,
    depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.95, sizeAttenuation: true });
  const points = new THREE.Points(geo, mat);
  const group = new THREE.Group(); group.add(points); scene.add(group);

  // faint orbit ring for depth
  const ringGeo = new THREE.RingGeometry(3.6, 3.62, 128);
  const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xffe58a, transparent: true, opacity: 0.12, side: THREE.DoubleSide }));
  ring.rotation.x = Math.PI / 2.3; group.add(ring);

  let wide = innerWidth >= 761;
  function resize() {
    wide = innerWidth >= 761;
    const w = holder.clientWidth, h = holder.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.position.z = w < 760 ? 14 : 11; camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize); resize();

  /* ---------- scroll + pointer ---------- */
  const captions = [...stage.querySelectorAll(".story-cap")];
  const dots = [...stage.querySelectorAll(".story-dots i")];
  let target = 0, prog = 0, mx = 0, my = 0, visible = true;
  function readScroll() {
    const r = stage.getBoundingClientRect(), total = stage.offsetHeight - innerHeight;
    target = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
  }
  addEventListener("scroll", readScroll, { passive: true }); readScroll();
  addEventListener("pointermove", e => { mx = (e.clientX / innerWidth - 0.5); my = (e.clientY / innerHeight - 0.5); }, { passive: true });
  new IntersectionObserver(es => es.forEach(e => visible = e.isIntersecting), { rootMargin: "200px" }).observe(stage);

  const ease = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
  const S = SHAPES.length - 1;
  let last = -1;
  function frame(time) {
    requestAnimationFrame(frame);
    if (!visible) return;
    prog += (target - prog) * (reduce ? 1 : 0.08);
    const f = prog * S, seg = Math.min(S - 1, Math.floor(f)), lt = f - seg;
    const A = SHAPES[seg], B = SHAPES[seg + 1], tt = time * 0.001;
    for (let i = 0; i < N; i++) {
      const d = delay[i], t = ease(Math.min(1, Math.max(0, (lt - d) / (1 - 0.35))));
      const burst = Math.sin(t * Math.PI) * 1.3; // particles fly outward mid-transition
      const i3 = i*3, ax = A[i3], ay = A[i3+1], az = A[i3+2], bx = B[i3], by = B[i3+1], bz = B[i3+2];
      const s = seed[i], n = reduce ? 0 : 0.035;
      pos[i3]   = ax + (bx - ax) * t + Math.sin(s + tt) * n + Math.sin(s * 3.1) * burst;
      pos[i3+1] = ay + (by - ay) * t + Math.cos(s * 1.3 + tt) * n + Math.cos(s * 2.3) * burst * 0.8;
      pos[i3+2] = az + (bz - az) * t + Math.sin(s * 0.7 + tt) * n + Math.sin(s * 1.7) * burst;
    }
    geo.attributes.position.needsUpdate = true;
    const idle = reduce ? 0 : Math.sin(tt * 0.5) * 0.22;           // gentle sway, always returns to face the viewer
    const swing = Math.sin(ease(lt) * Math.PI) * 1.4;              // turns during each transition, faces front when settled
    group.rotation.y = swing + idle + mx * 0.6;
    group.rotation.x = my * 0.35 + Math.sin(lt * Math.PI) * 0.25;
    group.position.x += ((wide ? 2.7 : 0) - group.position.x) * 0.1;
    group.position.y += ((wide ? 0 : 1.3) - group.position.y) * 0.1;
    ring.rotation.z = tt * 0.05; ring.material.opacity = 0.06 + 0.1 * Math.sin(prog * Math.PI);
    renderer.render(scene, camera);
    const idx = Math.round(f);
    if (idx !== last) { last = idx; captions.forEach((c, k) => c.classList.toggle("on", k === idx)); dots.forEach((d, k) => d.classList.toggle("on", k === idx)); }
  }
  requestAnimationFrame(frame);
})();

/* ---------- 3D tilt on cards ---------- */
(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia("(hover: none)").matches) return;
  document.addEventListener("pointermove", e => {
    const card = e.target.closest && e.target.closest(".cat-card, .ins-card, .stat, .step, .plant");
    document.querySelectorAll(".tilt-on").forEach(c => { if (c !== card) { c.classList.remove("tilt-on"); c.style.transform = ""; } });
    if (!card) return;
    const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    card.classList.add("tilt-on");
    card.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateY(-3px)`;
    card.style.setProperty("--gx", ((x + 0.5) * 100).toFixed(1) + "%"); card.style.setProperty("--gy", ((y + 0.5) * 100).toFixed(1) + "%");
  }, { passive: true });
})();
