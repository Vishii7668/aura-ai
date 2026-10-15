/* Aura AI – hero 3D scene: a gold "A" with floating objects that burst apart on scroll */
(function () {
  const hero = document.getElementById("hero"), holder = document.getElementById("heroGL");
  if (!hero || !holder || typeof THREE === "undefined") return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = innerWidth < 760;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  holder.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 200);
  camera.position.set(0, 0, 16);

  /* studio reflections without external files */
  const env = new THREE.Scene();
  const envGeo = new THREE.PlaneGeometry(10, 10);
  [[0, 12, 0, -Math.PI / 2, 0, 0xffffff, 3], [14, 2, 0, 0, -Math.PI / 2, 0xffe58a, 2.2], [-14, 4, 4, 0, Math.PI / 2, 0xfff2cc, 1.4], [0, 2, -14, 0, 0, 0xffc933, 1.2]]
    .forEach(([x, y, z, rx, ry, c, k]) => { const m = new THREE.Mesh(envGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); env.add(m); });
  setTimeout(() => { const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(env, 0.04).texture; pm.dispose(); }, 400); // build reflections after first paint
  scene.add(new THREE.HemisphereLight(0xfff3d1, 0x111111, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(5, 8, 6); scene.add(key);
  const rim = new THREE.PointLight(0xffc933, 2.2, 40); rim.position.set(-6, -2, 4); scene.add(rim);

  const M = {
    gold: new THREE.MeshStandardMaterial({ color: 0xffc94a, metalness: 1, roughness: 0.22 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xf2efe6, metalness: 1, roughness: 0.12 }),
    cream: new THREE.MeshStandardMaterial({ color: 0xf7f2dc, metalness: 0, roughness: 0.55 }),
    ink: new THREE.MeshStandardMaterial({ color: 0x0b0b0b, metalness: 0.6, roughness: 0.25 }),
    glow: new THREE.MeshStandardMaterial({ color: 0xffe58a, emissive: 0xffd24a, emissiveIntensity: 0.9, roughness: 0.4 })
  };

  /* the "A" logo, extruded */
  const S = 1 / 14;
  const shape = (pts) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => i ? s.lineTo((x - 60) * S, -(y - 58) * S) : s.moveTo((x - 60) * S, -(y - 58) * S)); return s; };
  const ext = { depth: 0.9, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.08, bevelSegments: 4 };
  const logo = new THREE.Group();
  [[[51, 8], [66, 8], [39, 104], [17, 104]], [[54, 8], [69, 8], [103, 104], [81, 104]], [[8, 102], [48, 102], [48, 110], [8, 110]], [[72, 102], [112, 102], [112, 110], [72, 110]]]
    .forEach((pts, k) => logo.add(new THREE.Mesh(new THREE.ExtrudeGeometry(shape(pts), ext), k === 1 || k === 3 ? M.chrome : M.gold)));
  const curve = new THREE.CubicBezierCurve3(...[[14, 84], [40, 82], [62, 74], [98, 44]].map(([x, y]) => new THREE.Vector3((x - 60) * S, -(y - 58) * S, 1.25)));
  logo.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.17, 16, false), M.glow));
  const node = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.14, 16, 48), M.glow); node.position.set((101 - 60) * S, -(41 - 58) * S, 1.25); logo.add(node);
  logo.children.forEach(c => { if (c.geometry.type === "ExtrudeGeometry") c.position.z = -0.45; });
  scene.add(logo);
  /* the "aura": a glowing orbit ring with a spark circling the logo */
  const aura = new THREE.Group();
  const auraRing = new THREE.Mesh(new THREE.TorusGeometry(4.6, 0.04, 12, 160), M.glow);
  const auraRing2 = new THREE.Mesh(new THREE.TorusGeometry(5.2, 0.018, 8, 160), new THREE.MeshBasicMaterial({ color: 0xffe58a, transparent: true, opacity: 0.35 }));
  const spark = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 24), M.glow);
  const sparkLight = new THREE.PointLight(0xffd24a, 2.5, 8); spark.add(sparkLight);
  aura.add(auraRing, auraRing2, spark); aura.rotation.set(1.25, 0.25, 0); logo.add(aura);

  /* sticker chips with text (Gen Z labels) */
  function chipTex(txt) {
    const c = document.createElement("canvas"); c.width = 512; c.height = 200; const x = c.getContext("2d");
    x.fillStyle = "#FFE58A"; const r = 90; x.beginPath(); x.moveTo(r, 10); x.arcTo(502, 10, 502, 190, r); x.arcTo(502, 190, 10, 190, r); x.arcTo(10, 190, 10, 10, r); x.arcTo(10, 10, 502, 10, r); x.fill();
    x.lineWidth = 10; x.strokeStyle = "#000"; x.stroke();
    x.fillStyle = "#000"; x.font = "800 88px 'Bricolage Grotesque', Archivo, Arial, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(txt, 256, 104);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
  }
  const labels = ["PROMPT", "8D", "PPT", "Excel", "OEE", "GST", "AI ✦", "PPAP", "MIS", "CAD"];
  const geos = [new THREE.SphereGeometry(0.55, 40, 40), new THREE.BoxGeometry(0.85, 0.85, 0.85, 4, 4, 4), new THREE.TorusGeometry(0.5, 0.2, 24, 64),
    new THREE.TorusKnotGeometry(0.42, 0.14, 120, 16), new THREE.CylinderGeometry(0.35, 0.35, 1.1, 40), new THREE.IcosahedronGeometry(0.6, 0), new THREE.OctahedronGeometry(0.55, 0)];
  const mats = [M.gold, M.chrome, M.cream, M.ink, M.gold, M.glow];
  const items = [];
  const COUNT = mobile ? 18 : 34;
  for (let i = 0; i < COUNT; i++) {
    let mesh;
    if (i < (mobile ? 5 : 9)) {
      const m = new THREE.MeshStandardMaterial({ map: chipTex(labels[i % labels.length]), roughness: 0.5, metalness: 0, transparent: true, side: THREE.DoubleSide });
      mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.74), m);
    } else mesh = new THREE.Mesh(geos[i % geos.length], mats[i % mats.length]);
    const a = Math.random() * Math.PI * 2, ring = 3.2 + Math.random() * 3.6, yy = (Math.random() - 0.5) * 6.5;
    const home = new THREE.Vector3(Math.cos(a) * ring * 1.05 + (mobile ? 0 : 1.6), yy, Math.sin(a) * ring * 0.6 - 1);
    const dir = home.clone().setZ(home.z + 3).normalize();
    const sc = 0.55 + Math.random() * 0.75; mesh.scale.setScalar(sc);
    mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    items.push({ mesh, home, dir, spd: 0.3 + Math.random() * 0.7, ph: Math.random() * 6.28, spin: new THREE.Vector3(Math.random() - .5, Math.random() - .5, Math.random() - .5).multiplyScalar(0.8), far: 9 + Math.random() * 10 });
    scene.add(mesh);
  }

  function resize() {
    const w = holder.clientWidth, h = holder.clientHeight; renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.position.z = w < 760 ? 22 : 16; camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize); resize();

  let prog = 0, target = 0, mx = 0, my = 0, visible = true;
  const copy = hero.querySelector(".hero-copy"), stats = hero.querySelector(".hero-stats");
  function readScroll() { const r = hero.getBoundingClientRect(), tot = hero.offsetHeight - innerHeight; target = Math.min(1, Math.max(0, -r.top / Math.max(1, tot))); }
  addEventListener("scroll", readScroll, { passive: true }); readScroll();
  addEventListener("pointermove", e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
  new IntersectionObserver(es => es.forEach(e => visible = e.isIntersecting)).observe(hero);

  const baseX = () => (innerWidth < 760 ? 0 : 3.9), baseY = () => (innerWidth < 760 ? 3.7 : -0.2);
  function frame(time) {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = time * 0.001; prog += (target - prog) * (reduce ? 1 : 0.09);
    const e = prog * prog * (3 - 2 * prog);
    logo.position.set(baseX() * (1 - e * 0.9), baseY() * (1 - e) + Math.sin(t * 1.2) * 0.12 * (reduce ? 0 : 1), e * 4);
    logo.rotation.y = -0.45 + mx * 0.6 + e * Math.PI * 1.2 + (reduce ? 0 : Math.sin(t * 0.6) * 0.15);
    logo.rotation.x = my * 0.35 + e * 0.3;
    aura.rotation.z = reduce ? 0 : t * 0.35; auraRing2.rotation.z = reduce ? 0 : -t * 0.2;
    const sa = reduce ? 0.8 : t * 1.3; spark.position.set(Math.cos(sa) * 4.6, Math.sin(sa) * 4.6, 0);
    auraRing.material.emissiveIntensity = 0.7 + 0.4 * Math.sin(t * 2);
    logo.scale.setScalar((innerWidth < 760 ? 0.52 : 0.78) * (1 + e * 0.45));
    items.forEach(it => {
      const bob = reduce ? 0 : Math.sin(t * it.spd + it.ph) * 0.35;
      const p = it.home.clone().add(new THREE.Vector3(baseX() * 0.6, baseY() * 0.6, 0));
      p.addScaledVector(it.dir, e * it.far); p.y += bob;
      p.x += mx * -0.8 * (1 + it.home.z * 0.1); p.y += my * 0.6;
      it.mesh.position.copy(p);
      if (!reduce) { it.mesh.rotation.x += it.spin.x * 0.01 * (1 + e * 6); it.mesh.rotation.y += it.spin.y * 0.01 * (1 + e * 6); }
      if (it.mesh.geometry.type === "PlaneGeometry") it.mesh.lookAt(camera.position.x + mx * 3, camera.position.y, camera.position.z);
    });
    if (copy) { copy.style.opacity = String(Math.max(0, 1 - prog * 2.2)); copy.style.transform = `translateY(${-prog * 80}px)`; }
    if (stats) stats.style.opacity = String(Math.max(0, 1 - prog * 3));
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
})();
