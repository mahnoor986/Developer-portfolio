(function(){
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia('(pointer: fine)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  var mouse = { x: innerWidth/2, y: innerHeight/2 };
  addEventListener('pointermove', function(e){ mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

  /* ---------- background: glow orb + drifting stars ---------- */
  var cv = document.getElementById('bg'), cx = cv.getContext('2d'), W, H, DPR = Math.min(devicePixelRatio || 1, 2), stars = [];
  var orb = { x: innerWidth*0.7, y: innerHeight*0.3 };
  var T = {};
  function readTheme(){ var cs = getComputedStyle(document.documentElement); ['violet-rgb','plum-rgb','orchid-rgb','void-rgb','soft'].forEach(function(k){ T[k] = cs.getPropertyValue('--'+k).trim(); }); }
  readTheme();
  function size(){
    W = innerWidth; H = innerHeight; cv.width = W*DPR; cv.height = H*DPR; cv.style.width = W+'px'; cv.style.height = H+'px';
    cx.setTransform(DPR,0,0,DPR,0,0);
    stars = []; var n = Math.round(W*H/9000);
    for (var i=0;i<n;i++) stars.push({ x: Math.random()*W, y: Math.random()*H, r: Math.random()*1.3+0.2, s: Math.random()*0.25+0.05, t: Math.random()*6.28 });
  }
  size(); addEventListener('resize', size);
  function drawBg(){
    orb.x += (mouse.x - orb.x)*0.04; orb.y += (mouse.y - orb.y)*0.04;
    cx.clearRect(0,0,W,H);
    var g = cx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, Math.max(W,H)*0.55);
    g.addColorStop(0,'rgba('+T['violet-rgb']+',0.30)'); g.addColorStop(0.35,'rgba('+T['plum-rgb']+',0.16)'); g.addColorStop(1,'rgba('+T['void-rgb']+',0)');
    cx.fillStyle = g; cx.fillRect(0,0,W,H);
    var g2 = cx.createRadialGradient(W*0.1, H*0.95, 0, W*0.1, H*0.95, W*0.5);
    g2.addColorStop(0,'rgba('+T['orchid-rgb']+',0.10)'); g2.addColorStop(1,'rgba('+T['void-rgb']+',0)');
    cx.fillStyle = g2; cx.fillRect(0,0,W,H);
    for (var i=0;i<stars.length;i++){
      var s = stars[i]; s.t += 0.02; if (!RM) { s.y -= s.s; if (s.y < -2) { s.y = H+2; s.x = Math.random()*W; } }
      var dx = s.x - mouse.x, dy = s.y - mouse.y, d = Math.sqrt(dx*dx+dy*dy), push = d < 120 ? (120-d)/120*10 : 0;
      cx.globalAlpha = 0.35 + Math.sin(s.t)*0.3;
      cx.fillStyle = T.soft;
      cx.beginPath(); cx.arc(s.x + (d? dx/d*push:0), s.y + (d? dy/d*push:0), s.r, 0, 6.283); cx.fill();
    }
    cx.globalAlpha = 1;
    requestAnimationFrame(drawBg);
  }
  drawBg();

  /* ---------- custom cursor ---------- */
  var dot = document.querySelector('.cursor-dot'), ring = document.querySelector('.cursor-ring'), ctext = document.getElementById('cursorText');
  var rp = { x: mouse.x, y: mouse.y };
  if (FINE) {
    document.body.classList.add('has-cursor');
    (function loop(){
      rp.x += (mouse.x - rp.x)*0.18; rp.y += (mouse.y - rp.y)*0.18;
      dot.style.transform = 'translate('+mouse.x+'px,'+mouse.y+'px)';
      ring.style.transform = 'translate('+rp.x+'px,'+rp.y+'px)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('pointerover', function(e){
      var t = e.target.closest('a,button,.proj-btn,.orbit-wrap,.hero.falling .ch,.hero.falling .gw,.hero.falling .gb');
      if (!t) { ring.classList.remove('big'); ctext.textContent=''; return; }
      if (t.classList.contains('proj-btn')) { ring.classList.add('big'); ctext.textContent = 'Open'; }
      else if (t.classList.contains('orbit-wrap')) { ring.classList.add('big'); ctext.textContent = 'Drag'; }
      else if (t.classList.contains('ch') || t.classList.contains('gw') || t.classList.contains('gb')) { ring.classList.add('big'); ctext.textContent = 'Throw'; }
      else { ring.classList.remove('big'); ctext.textContent=''; ring.style.borderColor=''; }
    });
  }

  /* ---------- magnetic elements ---------- */
  if (FINE) document.querySelectorAll('[data-magnetic]').forEach(function(el){
    var k = parseFloat(el.getAttribute('data-strength') || '0.3');
    el.addEventListener('pointermove', function(e){
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left - r.width/2)*k, y = (e.clientY - r.top - r.height/2)*k;
      el.style.transition = 'transform .15s'; el.style.transform = 'translate('+x+'px,'+y+'px)';
    });
    el.addEventListener('pointerleave', function(){ el.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1)'; el.style.transform = ''; });
  });

  /* ---------- header on scroll ---------- */
  var top = document.getElementById('top'), lastS = scrollY;
  addEventListener('scroll', function(){
    var y = scrollY;
    /* header stays put so the logo (and the orb inside it) never leaves */
    lastS = y;
  }, { passive: true });

  /* ---------- smooth scroll (Lenis) on precise pointers ---------- */
  var lenis = null;
  if (window.Lenis && FINE && !RM) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGSAP && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function(t){ lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function lr(t){ lenis.raf(t); requestAnimationFrame(lr); })(performance.now());
    }
  }
  function goTo(target, dur){
    if (lenis) lenis.scrollTo(target, { duration: dur || 1.4 });
    else if (typeof target === 'number') window.scrollTo({ top: target, behavior: RM ? 'auto' : 'smooth' });
    else target.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
  }

  /* ---------- full-screen menu (burger on every screen) ---------- */
  var burger = document.getElementById('burger'), mmenu = document.getElementById('mmenu');
  function setMenu(open){
    var r = burger.getBoundingClientRect();
    mmenu.style.setProperty('--cx', (r.left + r.width/2) + 'px');
    mmenu.style.setProperty('--cy', (r.top + r.height/2) + 'px');
    mmenu.classList.toggle('open', open); mmenu.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (lenis) { open ? lenis.stop() : lenis.start(); } else { document.body.style.overflow = open ? 'hidden' : ''; }
    if (open) top.classList.remove('hide');
  }
  burger.addEventListener('click', function(){ setMenu(!mmenu.classList.contains('open')); });
  addEventListener('keydown', function(e){ if (e.key === 'Escape' && mmenu.classList.contains('open')) { setMenu(false); burger.focus(); } });

  /* in-page links: close menu, then glide */
  document.addEventListener('click', function(e){
    var a = e.target.closest('a[href^="#"]'); if (!a || a.id === 'toTop') return;
    var id = a.getAttribute('href'); if (id.length < 2) return;
    var t = id === '#home' ? 0 : document.querySelector(id); if (t === null) return;
    e.preventDefault();
    var wasOpen = mmenu.classList.contains('open');
    if (wasOpen) setMenu(false);
    setTimeout(function(){ goTo(t); }, wasOpen ? 450 : 0);
  });

  /* fit the hero name to the full width */
  var nameEl = document.getElementById('name');
  function fitName(){
    var base = 100; nameEl.style.fontSize = base + 'px';
    var cs = nameEl.querySelectorAll('.ch'), f = cs[0], l = cs[cs.length - 1];
    var sum = (l.offsetLeft + l.offsetWidth) - f.offsetLeft;
    var avail = nameEl.clientWidth;
    if (sum > 0) nameEl.style.fontSize = Math.min(base * avail / sum * 0.99, 620) + 'px';
  }
  fitName();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitName);
  addEventListener('resize', fitName);

  /* ---------- preloader + hero entrance ---------- */
  var loader = document.getElementById('loader'), num = document.getElementById('countNum');
  var letters = Array.prototype.slice.call(document.querySelectorAll('#name .ch'));
  function entrance(){
    if (!hasGSAP || RM) { intro.pop = 1; return; }
    gsap.timeline()
      .from('.navpill > *', { y: -30, autoAlpha: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', clearProps: 'transform,opacity,visibility' }, 0)
      .from('#name .ch', { yPercent: 110, rotateX: -90, autoAlpha: 0, transformPerspective: 800, transformOrigin: '50% 100%', stagger: 0.06, duration: 1, ease: 'power4.out', clearProps: 'transform,opacity,visibility' }, 0.05)
      .from('.hero-top > *', { y: 40, autoAlpha: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out', clearProps: 'transform,opacity,visibility' }, 0.3)
      .from('.hero-bottom', { y: 30, autoAlpha: 0, duration: 0.8, ease: 'power3.out', clearProps: 'transform,opacity,visibility' }, 0.5)
      .to(intro, { pop: 1, duration: 1.6, ease: 'elastic.out(1, 0.5)' }, 0.55);
  }
  if (RM) { loader.style.display = 'none'; }
  else {
    var t0 = performance.now(), dur = 1700;
    (function tick(now){
      var p = Math.min(1, (now - t0)/dur), e = 1 - Math.pow(1-p, 3);
      num.textContent = Math.round(e*100); loader.style.setProperty('--lp', (e*100).toFixed(1) + '%'); loader.style.setProperty('--lpn', e.toFixed(3));
      if (p < 1) requestAnimationFrame(tick);
      else { setTimeout(function(){ loader.classList.add('done'); setTimeout(entrance, 250); setTimeout(function(){ loader.style.display='none'; }, 1100); }, 250); }
    })(t0);
  }

  /* ---------- gravity hero (Matter.js) ---------- */
  var hero = document.getElementById('hero'), gravBtn = document.getElementById('gravBtn'), gravLabel = document.getElementById('gravLabel'), gravHint = document.getElementById('gravHint');
  var M = window.Matter, engine = null, items = [], walls = [], running = false, drag = null, raf = null;
  var bodiesEls = letters.concat(Array.prototype.slice.call(document.querySelectorAll('#hero .gw, #hero .gb')));
  function heroRect(){ return hero.getBoundingClientRect(); }
  function startGravity(){
    if (!M) return;
    var hr = heroRect();
    engine = M.Engine.create(); engine.gravity.y = 1.1;
    items = bodiesEls.map(function(el){
      el.style.transform = '';
      var r = el.getBoundingClientRect();
      var isLetter = el.classList.contains('ch');
      var w = Math.max(6, r.width * (isLetter ? 0.86 : 1)), h = Math.max(6, r.height * (isLetter ? 0.78 : 1));
      var ox = r.left - hr.left + r.width/2, oy = r.top - hr.top + r.height/2;
      var b = M.Bodies.rectangle(ox, oy, w, h, { restitution: 0.45, friction: 0.25, frictionAir: 0.012, density: isLetter ? 0.002 : 0.001, chamfer: { radius: Math.min(w,h)*0.3 } });
      if (!isLetter && el.offsetParent === null) b.isSensor = true;
      M.Body.setVelocity(b, { x: (Math.random()-0.5)*4, y: -Math.random()*3 });
      M.Body.setAngularVelocity(b, (Math.random()-0.5)*0.08);
      return { el: el, body: b, ox: ox, oy: oy };
    });
    var T = 400, w = hr.width, h = hr.height;
    walls = [
      M.Bodies.rectangle(w/2, h + T/2, w*3, T, { isStatic: true }),
      M.Bodies.rectangle(-T/2, h/2, T, h*4, { isStatic: true }),
      M.Bodies.rectangle(w + T/2, h/2, T, h*4, { isStatic: true }),
      M.Bodies.rectangle(w/2, -T/2 + 70, w*3, T, { isStatic: true })
    ];
    M.Composite.add(engine.world, items.map(function(i){ return i.body; }).concat(walls));
    running = true; hero.classList.add('falling');
    gravBtn.setAttribute('aria-pressed','true'); gravLabel.textContent = 'Put it back'; gravHint.textContent = 'Grab a letter and throw it';
    var last = performance.now();
    (function step(now){
      if (!running) return;
      var dt = Math.min(32, now - last); last = now;
      M.Engine.update(engine, dt);
      for (var i=0;i<items.length;i++){
        var it = items[i], p = it.body.position;
        it.el.style.transform = 'translate('+(p.x - it.ox)+'px,'+(p.y - it.oy)+'px) rotate('+it.body.angle+'rad)';
      }
      raf = requestAnimationFrame(step);
    })(last);
  }
  function stopGravity(){
    running = false; cancelAnimationFrame(raf);
    if (engine) { M.Composite.clear(engine.world, false); M.Engine.clear(engine); engine = null; }
    drag = null;
    items.forEach(function(it, i){
      it.el.style.transition = 'transform 1s cubic-bezier(.34,1.4,.5,1) ' + (i*0.04) + 's';
      it.el.style.transform = 'translate(0,0) rotate(0rad)';
      setTimeout(function(){ it.el.style.transition = ''; it.el.style.transform = ''; }, 1100 + i*40);
    });
    items = [];
    hero.classList.remove('falling');
    gravBtn.setAttribute('aria-pressed','false'); gravLabel.textContent = 'Turn on gravity'; gravHint.textContent = 'Then grab the letters and throw them';
  }
  gravBtn.addEventListener('click', function(){ running ? stopGravity() : startGravity(); });
  if (!M) { gravBtn.parentNode.style.display = 'none'; }
  bodiesEls.forEach(function(el){
    el.addEventListener('pointerdown', function(e){
      if (!running) return;
      var it = items.find(function(x){ return x.el === el; }); if (!it) return;
      e.preventDefault();
      var hr = heroRect(), px = e.clientX - hr.left, py = e.clientY - hr.top;
      var c = M.Constraint.create({ pointA: { x: px, y: py }, bodyB: it.body, pointB: { x: px - it.body.position.x, y: py - it.body.position.y }, stiffness: 0.12, damping: 0.08, length: 0 });
      M.Composite.add(engine.world, c); drag = c;
      try { el.setPointerCapture(e.pointerId); } catch(err){}
    });
  });
  addEventListener('pointermove', function(e){
    if (!drag) return; var hr = heroRect();
    drag.pointA.x = e.clientX - hr.left; drag.pointA.y = e.clientY - hr.top;
  });
  addEventListener('pointerup', function(){ if (drag && engine) M.Composite.remove(engine.world, drag); drag = null; });
  addEventListener('resize', function(){ if (running) stopGravity(); });

  /* ---------- marquee driven by scroll velocity ---------- */
  var track = document.getElementById('track'), mx = 0, dir = -1, lastY = scrollY, boost = 0;
  (function mloop(){
    var dy = scrollY - lastY; lastY = scrollY;
    if (dy !== 0) dir = dy > 0 ? -1 : 1;
    boost += (Math.min(Math.abs(dy), 60) - boost)*0.1;
    if (!RM) mx += dir*(0.6 + boost*0.25);
    var half = track.scrollWidth/2;
    if (mx <= -half) mx += half; if (mx > 0) mx -= half;
    track.style.transform = 'translateX('+mx+'px)';
    requestAnimationFrame(mloop);
  })();

  /* ---------- manifesto word reveal ---------- */
  var man = document.getElementById('manifesto');
  man.innerHTML = man.textContent.trim().split(/\s+/).map(function(w){ return '<span class="w">'+w+'</span>'; }).join(' ');
  if (hasGSAP && window.ScrollTrigger && !RM) {
    gsap.fromTo('#manifesto .w', { opacity: 0.12 }, { opacity: 1, stagger: 0.08, ease: 'none',
      scrollTrigger: { trigger: '#manifesto', start: 'top 80%', end: 'bottom 40%', scrub: true } });
    gsap.from('.photo', { clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'power4.out', scrollTrigger: { trigger: '.photo', start: 'top 85%' } });
    gsap.utils.toArray('.h2, .big-cta').forEach(function(h){
      gsap.from(h, { rotateX: -85, yPercent: 30, opacity: 0, transformPerspective: 900, transformOrigin: '50% 100%', duration: 1.3, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 90%' } });
    });
    gsap.fromTo('#tlFill', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#timeline', start: 'top 70%', end: 'bottom 60%', scrub: true } });
    gsap.from('.big-cta .o', { letterSpacing: '0.2em', duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.big-cta', start: 'top 80%' } });
  }

  /* ---------- projects: hover preview + accordion ---------- */
  var preview = document.getElementById('preview'), pv = { x: 0, y: 0 }, pt = { x: 0, y: 0 }, pvOn = false;
  document.querySelectorAll('.proj').forEach(function(p){
    var btn = p.querySelector('.proj-btn'), art = 'art-' + p.getAttribute('data-art');
    btn.addEventListener('click', function(){
      var open = !p.classList.contains('open');
      document.querySelectorAll('.proj.open').forEach(function(o){ if (o !== p) { o.classList.remove('open'); o.querySelector('.proj-btn').setAttribute('aria-expanded','false'); } });
      p.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open));
      if (open) { preview.classList.remove('on'); pvOn = false; }
      setTimeout(function(){ if (window.ScrollTrigger) ScrollTrigger.refresh(); }, 650);
    });
    if (FINE) {
      btn.addEventListener('pointerenter', function(){ if (p.classList.contains('open')) return; preview.className = art + ' on'; pvOn = true; });
      btn.addEventListener('pointerleave', function(){ preview.classList.remove('on'); pvOn = false; });
    }
  });
  if (FINE) (function ploop(){
    pt.x = mouse.x + 210; pt.y = mouse.y;
    if (pt.x + 180 > innerWidth) pt.x = mouse.x - 210;
    pv.x += (pt.x - pv.x)*0.12; pv.y += (pt.y - pv.y)*0.12;
    preview.style.left = pv.x + 'px'; preview.style.top = pv.y + 'px';
    requestAnimationFrame(ploop);
  })();

  /* ---------- toolkit: 3D skill sphere + constellation + orbit rings ---------- */
  var orbit = document.getElementById('orbit'), olc = document.getElementById('orbitLines'), ol = olc.getContext('2d');
  var SK = [["HTML5","fe"],["CSS3","fe"],["JavaScript","fe"],["TypeScript","fe"],["React","fe"],["Next.js","fe"],["Tailwind CSS","fe"],["Bootstrap","fe"],["Vite","fe"],["Responsive UI","fe"],["Node.js","be"],["Express","be"],["Django","be"],["REST APIs","be"],["PostgreSQL","be"],["MySQL","be"],["MongoDB","be"],["C / C++","be"],["Git","tl"],["GitHub","tl"],["Docker","tl"],["Figma","tl"],["Stitch","tl"],["VS Code","tl"],["Vercel","tl"],["raylib","tl"]];
  var pts = SK.map(function(s, i){
    var n = SK.length, y = 1 - (i/(n-1))*2, r = Math.sqrt(1 - y*y), th = Math.PI*(3 - Math.sqrt(5))*i;
    var el = document.createElement('span'); el.className = 'orbit-word'; el.textContent = s[0]; orbit.appendChild(el);
    return { x: Math.cos(th)*r, y: y, z: Math.sin(th)*r, el: el, cat: s[1], hl: 1 };
  });
  var sel = 'all', vx = 0.004, vy = 0.0025, dragging = false, lx = 0, ly = 0, oW = 0, oH = 0, ODPR = Math.min(devicePixelRatio || 1, 2);
  function osize(){ oW = orbit.clientWidth; oH = orbit.clientHeight; olc.width = oW*ODPR; olc.height = oH*ODPR; ol.setTransform(ODPR,0,0,ODPR,0,0); }
  osize(); addEventListener('resize', osize);
  orbit.addEventListener('pointerdown', function(e){ dragging = true; lx = e.clientX; ly = e.clientY; try{ orbit.setPointerCapture(e.pointerId); }catch(err){} });
  orbit.addEventListener('pointermove', function(e){ if (!dragging) return; vy = (e.clientX - lx)*0.0009; vx = -(e.clientY - ly)*0.0009; lx = e.clientX; ly = e.clientY; });
  orbit.addEventListener('pointerup', function(){ dragging = false; });
  orbit.addEventListener('pointercancel', function(){ dragging = false; });
  var rings = [ { tx: 1.15, tz: 0.35, sp: 0.0045, r: 1.22 }, { tx: -0.9, tz: -0.6, sp: -0.0032, r: 1.34 } ];
  var orbitVisible = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(function(en){ orbitVisible = en[0].isIntersecting; }).observe(orbit);
  var ot = 0;
  function proj(x, y, z, R){ var s = (z + 2.4)/3.4; return { x: oW/2 + x*R, y: oH/2 + y*R, s: s, z: z }; }
  (function oloop(){
    requestAnimationFrame(oloop);
    if (!orbitVisible) return;
    ot++;
    var R = Math.min(oW, oH)*0.4;
    if (!dragging) { vx += (0.0015 - vx)*0.02; vy += (0.003 - vy)*0.02; }
    var sx = Math.sin(vx), cxr = Math.cos(vx), sy = Math.sin(vy), cyr = Math.cos(vy);
    for (var i=0;i<pts.length;i++){
      var p = pts[i];
      var y1 = p.y*cxr - p.z*sx, z1 = p.y*sx + p.z*cxr; p.y = y1; p.z = z1;
      var x2 = p.x*cyr + p.z*sy, z2 = -p.x*sy + p.z*cyr; p.x = x2; p.z = z2;
      var target = (sel === 'all' || p.cat === sel) ? 1 : 0; p.hl += (target - p.hl)*0.08;
      var sc = (p.z + 2)/3 * (0.75 + p.hl*0.25) * (sel !== 'all' && target ? 1.12 : 1);
      p.el.style.transform = 'translate(-50%,-50%) translate3d('+(p.x*R)+'px,'+(p.y*R)+'px,0) scale('+sc.toFixed(3)+')';
      p.el.style.opacity = ((0.25 + (p.z + 1)/2*0.75) * (0.12 + p.hl*0.88)).toFixed(2);
      p.el.style.color = p.z > 0.3 ? 'var(--ink)' : 'var(--orchid)';
      p.el.style.zIndex = Math.round((p.z+1)*100);
    }
    ol.clearRect(0, 0, oW, oH);
    var rgb = T['orchid-rgb'] || '179,140,255';
    /* constellation lines */
    ol.lineWidth = 1;
    for (var a=0;a<pts.length;a++) for (var b=a+1;b<pts.length;b++){
      var A = pts[a], B = pts[b], dx = A.x-B.x, dy = A.y-B.y, dz = A.z-B.z, d = Math.sqrt(dx*dx+dy*dy+dz*dz);
      if (d > 0.82) continue;
      var al = (1 - d/0.82) * 0.42 * Math.min(A.hl, B.hl) * (0.35 + (A.z + B.z + 2)/4*0.65);
      if (al < 0.02) continue;
      ol.strokeStyle = 'rgba('+rgb+','+al.toFixed(3)+')';
      ol.beginPath(); ol.moveTo(oW/2 + A.x*R, oH/2 + A.y*R); ol.lineTo(oW/2 + B.x*R, oH/2 + B.y*R); ol.stroke();
    }
    /* tilted particle rings with an electron each */
    rings.forEach(function(rg, ri){
      var cx1 = Math.cos(rg.tx), sx1 = Math.sin(rg.tx), cz1 = Math.cos(rg.tz), sz1 = Math.sin(rg.tz), N = 90;
      for (var k=0;k<N;k++){
        var ang = k/N*6.2832 + ot*rg.sp;
        var x = Math.cos(ang)*rg.r, y = 0, z = Math.sin(ang)*rg.r;
        var y2 = y*cx1 - z*sx1, z2 = y*sx1 + z*cx1; var x3 = x*cz1 - y2*sz1, y3 = x*sz1 + y2*cz1;
        var q = proj(x3, y3, z2, R);
        var front = z2 > 0;
        ol.fillStyle = 'rgba('+rgb+','+(front ? 0.55 : 0.16)+')';
        ol.beginPath(); ol.arc(q.x, q.y, 1.1*q.s + (k%10===0 ? 0.8 : 0), 0, 6.2832); ol.fill();
      }
      for (var e=0;e<3;e++){
        var ea = ot*rg.sp*4 + ri*2 + e*2.094;
        var ex = Math.cos(ea)*rg.r, ez = Math.sin(ea)*rg.r;
        var ey2 = -ez*sx1, ez2 = ez*cx1; var ex3 = ex*cz1 - ey2*sz1, ey3 = ex*sz1 + ey2*cz1;
        var eq = proj(ex3, ey3, ez2, R);
        var g = ol.createRadialGradient(eq.x, eq.y, 0, eq.x, eq.y, 14*eq.s);
        g.addColorStop(0, 'rgba('+rgb+','+(ez2 > 0 ? 0.95 : 0.3)+')'); g.addColorStop(1, 'rgba('+rgb+',0)');
        ol.fillStyle = g; ol.beginPath(); ol.arc(eq.x, eq.y, 14*eq.s, 0, 6.2832); ol.fill();
      }
    });
  })();

  /* toolkit tabs */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tk-tab'));
  function selectCat(cat, focus){
    sel = cat; vy += 0.05; vx += 0.02;
    tabs.forEach(function(t){
      var on = t.getAttribute('data-cat') === cat;
      t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      if (on && focus) t.focus();
    });
  }
  tabs.forEach(function(t, i){
    t.addEventListener('click', function(){ selectCat(t.getAttribute('data-cat')); });
    t.addEventListener('keydown', function(e){
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
      e.preventDefault(); var n = tabs[(i + d + tabs.length) % tabs.length]; selectCat(n.getAttribute('data-cat'), true);
    });
  });
  document.querySelectorAll('.tk-card').forEach(function(c){ c.addEventListener('click', function(){ selectCat(c.getAttribute('data-go'), true); }); });

  /* ---------- collab form -> email app ---------- */
  var form = document.getElementById('collabForm'), note = document.getElementById('formNote');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var f = { name: form.elements['name'].value.trim(), email: form.elements['email'].value.trim(), msg: form.elements['message'].value.trim(), type: (form.querySelector('input[name=type]:checked') || {}).value || '' };
    var bad = [];
    [['fName', f.name], ['fEmail', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) ? f.email : ''], ['fMsg', f.msg]].forEach(function(x){
      var fld = document.getElementById(x[0]).parentNode; fld.classList.toggle('err', !x[1]); if (!x[1]) bad.push(x[0]);
    });
    if (bad.length) { note.className = 'form-note bad'; note.textContent = 'Add your name, a valid email and a short message, then send again.'; document.getElementById(bad[0]).focus(); return; }
    var to = document.getElementById('emailLink').getAttribute('href').replace('mailto:','');
    var subject = encodeURIComponent('New project: ' + f.type + ' from ' + f.name);
    var body = encodeURIComponent('Hi Mahnoor,\n\n' + f.msg + '\n\nProject type: ' + f.type + '\nName: ' + f.name + '\nEmail: ' + f.email);
    window.location.href = 'mailto:' + to + '?subject=' + subject + '&body=' + body;
    note.className = 'form-note good'; note.textContent = 'Your email app is opening with the message ready. Hit send there.';
  });

  /* ---------- vibe (colour theme) switcher ---------- */
  var root = document.documentElement, vibeBtns = document.querySelectorAll('.vibe'), toast = document.getElementById('vibeToast'), toastT;
  function markVibe(v){ vibeBtns.forEach(function(b){ b.setAttribute('aria-checked', String(b.getAttribute('data-vibe') === v)); }); }
  markVibe(root.getAttribute('data-vibe') || 'violet');
  function applyVibe(v){
    root.setAttribute('data-vibe', v); readTheme(); markVibe(v);
    try { localStorage.setItem('mahnoor-vibe', v); } catch(e){}
    document.dispatchEvent(new Event('vibechange'));
  }
  vibeBtns.forEach(function(b){
    b.addEventListener('click', function(e){
      var v = b.getAttribute('data-vibe'); if (v === (root.getAttribute('data-vibe') || 'violet')) return;
      var r = b.getBoundingClientRect(), x = r.left + r.width/2, y = r.top + r.height/2;
      var rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      if (document.startViewTransition && !RM) {
        var vt = document.startViewTransition(function(){ applyVibe(v); });
        vt.ready.then(function(){
          root.animate({ clipPath: ['circle(0px at '+x+'px '+y+'px)', 'circle('+rad+'px at '+x+'px '+y+'px)'] }, { duration: 900, easing: 'cubic-bezier(.7,0,.3,1)', pseudoElement: '::view-transition-new(root)' });
        }).catch(function(){});
      } else { applyVibe(v); }
      toast.textContent = 'Vibe switched to ' + b.getAttribute('data-name');
      toast.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function(){ toast.classList.remove('on'); }, 1800);
    });
  });

  /* ---------- playful logo: blinking o's and a hopping m ---------- */
  var wm = document.getElementById('wm');
  setTimeout(function(){ wm.classList.add('ready'); }, RM ? 0 : 3200);
  if (!RM) {
    setInterval(function(){ wm.classList.remove('blink'); void wm.offsetWidth; wm.classList.add('blink'); }, 4200);
    setInterval(function(){ wm.classList.remove('hop'); void wm.offsetWidth; wm.classList.add('hop'); }, 9000);
  }

  /* footer wordmark rises as the footer scrolls in */
  if (hasGSAP && window.ScrollTrigger && !RM) {
    gsap.fromTo('#footMark', { yPercent: 55 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  }

  var intro = { p: 1, pop: (RM || !hasGSAP) ? 1 : 0 };
  /* ---------- hero 3D: morphing glass blob + satellites (three.js) ---------- */
  (function(){
    var host = document.getElementById('hero3d');
    if (!window.THREE || !host) return;
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch(e){ return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    host.appendChild(renderer.domElement);
    var scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100); camera.position.z = 10;
    var NOISE = 'vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}'+
      'float snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);'+
      'vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);'+
      'vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);'+
      'vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}';
    var VS = 'uniform float uTime;uniform float uAmp;uniform float uFreq;varying vec3 vN;varying vec3 vV;varying float vD;' + NOISE +
      'void main(){float d=snoise(normal*uFreq+vec3(uTime*0.22));d+=0.45*snoise(normal*uFreq*2.2-vec3(uTime*0.17));vD=d;vec3 pos=position+normal*d*uAmp;vec4 mv=modelViewMatrix*vec4(pos,1.0);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}';
    var FS = 'uniform vec3 uC1;uniform vec3 uC2;uniform vec3 uC3;uniform float uTime;varying vec3 vN;varying vec3 vV;varying float vD;'+
      'void main(){float f=pow(1.0-max(dot(vN,vV),0.0),2.0);vec3 base=mix(uC3,uC2,smoothstep(-0.9,0.9,vD+vN.y*0.5));float bands=0.5+0.5*sin(vD*8.0+uTime*0.9);base+=uC1*bands*0.14;vec3 col=mix(base,uC1,f*0.7);col+=pow(f,3.0)*0.22;'+
      'vec3 L=normalize(vec3(-0.5,0.8,0.6));float spec=pow(max(dot(reflect(-L,vN),vV),0.0),28.0);col+=spec*0.4;gl_FragColor=vec4(col,1.0);}';
    var C1 = new THREE.Color(), C2 = new THREE.Color(), C3 = new THREE.Color();
    function mkMat(amp, freq){ return new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: FS, uniforms: { uTime: { value: 0 }, uAmp: { value: amp }, uFreq: { value: freq }, uC1: { value: C1 }, uC2: { value: C2 }, uC3: { value: C3 } } }); }
    var small = innerWidth < 760;
    var blobMat = mkMat(0.24, 0.9), blob = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, small ? 28 : 56), blobMat);
    var group = new THREE.Group(); group.add(blob); scene.add(group);
    var ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28 });
    var ring = new THREE.Mesh(new THREE.TorusGeometry(2.25, 0.008, 8, 200), ringMat); ring.rotation.x = 1.25; group.add(ring);
    var ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.006, 8, 200), ringMat); ring2.rotation.x = 1.75; group.add(ring2);
    var satMat = mkMat(0.08, 2.0), sats = [
      { m: new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.09, 24, 64), satMat), r: 2.25, sp: 0.35, ph: 0, tilt: 1.25 },
      { m: new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), satMat), r: 2.6, sp: -0.25, ph: 2.2, tilt: 1.75 },
      { m: new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 4), satMat), r: 2.25, sp: 0.35, ph: 3.4, tilt: 1.25 },
      { m: new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.24), satMat), r: 2.6, sp: -0.25, ph: 5.0, tilt: 1.75 }
    ];
    sats.forEach(function(s){ group.add(s.m); });
    function colors(){
      var cs = getComputedStyle(document.documentElement);
      C1.set(cs.getPropertyValue('--soft').trim()); C2.set(cs.getPropertyValue('--orchid').trim()); C3.set(cs.getPropertyValue('--plum').trim());
      ringMat.color.set(cs.getPropertyValue('--orchid').trim());
    }
    colors(); document.addEventListener('vibechange', function(){ colors(); if (RM) draw(0); });
    var lastW = 0, lastH = 0, glOk = true;
    function size(){ var w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight; lastW = w; lastH = h; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
    renderer.domElement.addEventListener('webglcontextlost', function(e){ e.preventDefault(); glOk = false; document.getElementById('wm').classList.remove('orb-in'); });
    renderer.domElement.addEventListener('webglcontextrestored', function(){ glOk = true; });
    setTimeout(function(){ if (intro.pop < 1 && !(window.gsap && gsap.isTweening(intro))) intro.pop = 1; }, 6000);
    size(); addEventListener('resize', size);
    var visible = true, mxp = 0, myp = 0, energy = 0, lastMx = mouse.x, lastMy = mouse.y;
    
    var tAcc = 0, lastT = performance.now(), roll = 0, lastX = 0, landed = false, wasLanded = false, logoO = document.querySelector('#wm .l5');
    function ease(x){ return x < 0.5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3)/2; }
    function draw(t){
      var dt = Math.min(0.05, Math.max(0, (t - lastT)/1000)); lastT = t;
      var dmx = mouse.x - lastMx, dmy = mouse.y - lastMy; lastMx = mouse.x; lastMy = mouse.y;
      energy = Math.min(1, energy*0.92 + Math.min(Math.sqrt(dmx*dmx + dmy*dmy), 60)*0.0015);
      mxp += ((mouse.x / innerWidth - 0.5) - mxp)*0.04; myp += ((mouse.y / innerHeight - 0.5) - myp)*0.04;
      tAcc += dt*(1 + energy*0.6);
      blobMat.uniforms.uTime.value = tAcc; satMat.uniforms.uTime.value = tAcc;
      var hh = Math.tan(camera.fov*Math.PI/360)*camera.position.z, hw = hh*camera.aspect;
      var vw = host.clientWidth, vh = host.clientHeight, k = ease(Math.min(1, Math.max(0, intro.p)));
      var sm = vw < 760, s0 = sm ? 0.68 : 1.15;
      var or = logoO.getBoundingClientRect();
      var tx = ((or.left + or.width/2) / vw - 0.5) * 2*hw, ty = -((or.top + or.height*0.52) / vh - 0.5) * 2*hh;
      var s1 = Math.max(0.02, (or.height*0.64 / vh) * 2*hh / (2*1.3));
      var lift = Math.sin(k*Math.PI) * hh*0.18;
      blobMat.uniforms.uAmp.value = (0.22 + energy*0.12) * (1 - k*0.55);
      var gx = tx*k, gy = (sm ? 0.05 : 0)*(1-k) + ty*k + lift, sc = (s0 + (s1 - s0)*k)*intro.pop;
      group.position.set(gx, gy, 0); group.scale.setScalar(Math.max(0.0001, sc));
      roll += (gx - lastX) / (1.2*Math.max(sc, 0.05)) * 0.35; lastX = gx;
      blob.rotation.z = -roll; blob.rotation.y = tAcc*0.12 + mxp*0.5*(1-k); blob.rotation.x = myp*0.4*(1-k);
      group.rotation.y = mxp*0.25*(1-k); group.rotation.x = myp*0.15*(1-k);
      var extra = Math.max(0, 1 - k*1.4);
      ringMat.opacity = 0.28*extra; ring.visible = ring2.visible = extra > 0.01;
      sats.forEach(function(s){ s.m.scale.setScalar(Math.max(0.0001, extra)); s.m.visible = extra > 0.01; });
      if (host.clientWidth !== lastW || host.clientHeight !== lastH) size();
      landed = glOk && k > 0.97 && intro.pop > 0.5;
      if (landed !== wasLanded) { document.getElementById('wm').classList.toggle('orb-in', landed); wasLanded = landed; }
      sats.forEach(function(s){
        var a = tAcc*s.sp + s.ph, x = Math.cos(a)*s.r, yy = Math.sin(a)*s.r;
        s.m.position.set(x, yy*Math.cos(s.tilt), yy*Math.sin(s.tilt));
        s.m.rotation.x = tAcc*0.8 + s.ph; s.m.rotation.y = tAcc*0.6;
      });
      ring.rotation.z = tAcc*0.05;
      renderer.render(scene, camera);
    }
    if (RM) { draw(0); return; }
    (function loop(t){ requestAnimationFrame(loop); if (visible) draw(t); })(performance.now());
  })();

  /* ---------- hero scroll-out: name tips back in 3D ---------- */
  if (hasGSAP && window.ScrollTrigger && !RM) {
    gsap.to('#name', { rotateX: 55, y: 60, opacity: 0.12, transformPerspective: 900, transformOrigin: '50% 100%', ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-top', { yPercent: -60, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: '60% top', scrub: true } });
  }

  /* ---------- how I build: horizontal 3D coverflow ---------- */
  var pbar = document.getElementById('pbar'), ptrack = document.getElementById('ptrack'), pcards = Array.prototype.slice.call(document.querySelectorAll('.pcard'));
  if (hasGSAP && window.ScrollTrigger) {
    var mmq = gsap.matchMedia();
    mmq.add('(min-width: 900px)', function(){
      function dist(){ return Math.max(0, ptrack.scrollWidth - innerWidth); }
      function tilt3d(){
        var c = innerWidth/2;
        pcards.forEach(function(card){
          var r = card.getBoundingClientRect(), off = (r.left + r.width/2 - c) / innerWidth;
          if (RM) return;
          card.style.transform = 'rotateY(' + (off*-42).toFixed(2) + 'deg) translateZ(' + (-Math.abs(off)*220).toFixed(1) + 'px) rotateZ(' + (off*3).toFixed(2) + 'deg)';
          card.style.setProperty('--gx', (50 - off*90).toFixed(1) + '%');
        });
      }
      gsap.to(ptrack, { x: function(){ return -dist(); }, ease: 'none', onUpdate: tilt3d,
        scrollTrigger: { trigger: '#process', start: 'top top', end: function(){ return '+=' + dist(); }, pin: true, scrub: 0.8, invalidateOnRefresh: true, refreshPriority: 2,
          onUpdate: function(self){ pbar.style.transform = 'scaleX(' + self.progress.toFixed(3) + ')'; } } });
      tilt3d();
      return function(){ pcards.forEach(function(c){ c.style.transform = ''; }); };
    });
    mmq.add('(max-width: 899px)', function(){
      if (RM) return;
      pcards.forEach(function(card){
        gsap.from(card, { rotateX: -40, y: 70, opacity: 0, transformPerspective: 900, transformOrigin: '50% 0%', duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 90%' } });
      });
    });
  }

  /* ---------- curl reveal: collab rolls in over experience ---------- */
  var curlPath = document.getElementById('curlPath'), curlGlint = document.getElementById('curlGlint'), curlP = 0, curlOn = true;
  function buildCurl(t){
    var n = innerWidth < 700 ? 6 : 12, w = 1440 / n, amp = 16 + (1 - curlP)*62, base = 118 - (1 - curlP)*4;
    var ph = ((t*0.00004 + curlP*0.9) % 1) * w, x = -w + ph, top = '', i = 0;
    top = 'M' + x.toFixed(1) + ' ' + base.toFixed(1);
    while (x < 1440) {
      var a = amp * (0.78 + 0.22*Math.sin(i*1.7 + t*0.0012));
      top += ' Q' + (x + w/2).toFixed(1) + ' ' + (base - a*2).toFixed(1) + ' ' + (x + w).toFixed(1) + ' ' + base.toFixed(1);
      x += w; i++;
    }
    curlPath.setAttribute('d', top + ' L' + x.toFixed(1) + ' 120 L' + (-w + ph).toFixed(1) + ' 120 Z');
    curlGlint.setAttribute('d', top);
  }
  var curlEl = document.querySelector('.curl');
  if ('IntersectionObserver' in window) new IntersectionObserver(function(en){ curlOn = en[0].isIntersecting; }, { rootMargin: '200px' }).observe(curlEl);
  buildCurl(0);
  if (!RM) (function cl(t){ requestAnimationFrame(cl); if (curlOn) buildCurl(t); })(performance.now());
  if (hasGSAP && window.ScrollTrigger && !RM) {
    ScrollTrigger.create({ trigger: '#experience', start: 'bottom bottom', end: function(){ return '+=' + innerHeight; }, pin: true, pinSpacing: false, refreshPriority: 1 });
    gsap.to('#experience', { scale: 0.88, rotateX: 12, opacity: 0.25, filter: 'blur(2px)', transformPerspective: 1200, transformOrigin: '50% 100%', ease: 'none',
      scrollTrigger: { trigger: '#collab', start: 'top bottom', end: 'top top', scrub: true } });
    ScrollTrigger.create({ trigger: '#collab', start: 'top bottom', end: 'top 15%', scrub: true, onUpdate: function(self){ curlP = self.progress; } });
  } else { curlP = 1; }

  /* ---------- gentle 3D tilt on hover ---------- */
  if (FINE && !RM) document.querySelectorAll('[data-tilt]').forEach(function(el){
    el.style.transition = 'transform .5s cubic-bezier(.2,.8,.2,1)';
    el.addEventListener('pointermove', function(e){
      var r = el.getBoundingClientRect(), px = (e.clientX - r.left)/r.width - 0.5, py = (e.clientY - r.top)/r.height - 0.5;
      el.style.transform = 'perspective(900px) rotateY(' + (px*10) + 'deg) rotateX(' + (-py*10) + 'deg) translateZ(0)';
    });
    el.addEventListener('pointerleave', function(){ el.style.transform = ''; });
  });

  /* ---------- back-to-top: the rocket flies you up to the hero, then leaves ---------- */
  var toTop = document.getElementById('toTop'), flyer = document.getElementById('flyer'), warp = document.getElementById('warp'), flying = false;
  function scrollHome(dur, done){
    if (lenis) { lenis.start(); lenis.scrollTo(0, { duration: dur, easing: function(t){ return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2; }, onComplete: done, force: true }); return; }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    var start = performance.now();
    (function wait(){ if (scrollY < 4 || performance.now() - start > 4000) done(); else requestAnimationFrame(wait); })();
  }
  toTop.addEventListener('click', function(e){
    e.preventDefault();
    if (flying) return;
    if (RM || !hasGSAP) { goTo(0); return; }
    flying = true;
    var core = toTop.querySelector('.core'), r = core.getBoundingClientRect();
    gsap.set(flyer, { left: r.left + r.width/2, top: r.top + r.height/2, xPercent: -50, yPercent: -50, x: 0, y: 0, rotation: 0, scale: 0.8, autoAlpha: 1 });
    gsap.set(core.querySelector('.rocket'), { autoAlpha: 0 });
    flyer.classList.add('burn');
    var cx = innerWidth/2 - (r.left + r.width/2), cy = innerHeight*0.58 - (r.top + r.height/2);
    gsap.timeline()
      .to(flyer, { x: '+=3', duration: 0.05, repeat: 7, yoyo: true, ease: 'none' })
      .to(flyer, { scale: 1.6, duration: 0.3, ease: 'back.out(2)' }, '<')
      .to(flyer, { x: cx, y: cy, rotation: cx > 0 ? 8 : -8, duration: 0.7, ease: 'power2.inOut' })
      .to(flyer, { rotation: 0, duration: 0.4 }, '-=0.2')
      .add(function(){
        warp.classList.add('on');
        gsap.to(flyer, { y: cy - 14, duration: 0.35, repeat: -1, yoyo: true, ease: 'sine.inOut', id: 'bob' });
        scrollHome(Math.min(3.2, Math.max(1.6, scrollY / 3200)), function(){
          gsap.getById('bob') && gsap.getById('bob').kill();
          warp.classList.remove('on');
          gsap.to(flyer, { y: -(innerHeight*0.7), scale: 1.1, duration: 0.7, ease: 'power3.in',
            onComplete: function(){
              gsap.to(flyer, { autoAlpha: 0, duration: 0.2, onComplete: function(){
                flyer.classList.remove('burn'); flying = false;
                gsap.set(core.querySelector('.rocket'), { autoAlpha: 1 });
              } });
            } });
        });
      });
  });

  if (window.ScrollTrigger) { ScrollTrigger.sort(); ScrollTrigger.refresh(); }
  if (document.fonts && document.fonts.ready && window.ScrollTrigger) document.fonts.ready.then(function(){ ScrollTrigger.refresh(); });

  /* ---------- copy email ---------- */
  var copyBtn = document.getElementById('copyBtn');
  copyBtn.addEventListener('click', function(){
    var addr = document.getElementById('emailLink').getAttribute('href').replace('mailto:','');
    try {
      navigator.clipboard.writeText(addr).then(function(){ copyBtn.textContent = 'Copied'; setTimeout(function(){ copyBtn.textContent = 'Copy email'; }, 2000); },
        function(){ copyBtn.textContent = addr; });
    } catch(err) { copyBtn.textContent = addr; }
  });
})();
