/* Partie 6 — Poussières d'étoiles
   - prédiction à choix
   - comparateur de matière (grille de 100 carrés)
   - forge des étoiles en 3D (étoile en coupe, traits et noms des couches, supernova)
   - éléments clés et exercice */
(function () {
  "use strict";
  var reduit = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function lisse(x) { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); }
  function entre(x, a, b) { return lisse((x - a) / (b - a)); }

  /* ---------- Données ---------- */
  var ORIGINES = {
    bb: { nom: "Au Big Bang", couleur: "#5AA8FF" },
    et: { nom: "Au cœur des étoiles", couleur: "#FFB347" },
    ex: { nom: "Dans les explosions et collisions d'étoiles", couleur: "#C77DFF" },
    mx: { nom: "Plusieurs origines", couleur: "#6B7194" }
  };
  var EL = {
    H:  { nom: "Hydrogène", c: "#5AA8FF", o: "bb", t: "L'élément le plus léger et le plus abondant de l'Univers. On le trouve dans l'eau (H₂O) et dans toutes les molécules du vivant." },
    He: { nom: "Hélium", c: "#9FDCFF", o: "bb", t: "Deuxième élément de l'Univers. Très rare sur Terre, car il est si léger qu'il s'échappe dans l'espace. Il gonfle les ballons de fête." },
    Li: { nom: "Lithium", c: "#C9F7B0", o: "bb", t: "Un métal très léger, en partie né au Big Bang. Il sert à fabriquer les batteries des téléphones et des voitures électriques." },
    C:  { nom: "Carbone", c: "#9AA3C2", o: "et", t: "La base de tous les êtres vivants. On le trouve aussi dans le charbon, le diamant et la mine des crayons." },
    N:  { nom: "Azote", c: "#8E7CFF", o: "et", t: "Il forme 78 % de l'air que nous respirons. Il est présent dans les protéines de ton corps." },
    O:  { nom: "Oxygène", c: "#FF5D72", o: "et", t: "Le plus abondant de la croûte terrestre et du corps humain. Il est dans l'air, dans l'eau et dans presque toutes les roches." },
    Ne: { nom: "Néon", c: "#FF9ECF", o: "et", t: "Un gaz rare qui brille en rouge-orangé dans les enseignes lumineuses." },
    Na: { nom: "Sodium", c: "#FFA94D", o: "et", t: "Avec le chlore, il forme le sel de cuisine." },
    Mg: { nom: "Magnésium", c: "#45D3C6", o: "et", t: "Un métal léger très présent dans le manteau de la Terre. Il brûle avec une lumière blanche éclatante." },
    Al: { nom: "Aluminium", c: "#B7C8E8", o: "et", t: "Le métal le plus abondant de la croûte terrestre : canettes, papier d'aluminium, avions." },
    Si: { nom: "Silicium", c: "#F5C451", o: "et", t: "Avec l'oxygène, il forme le sable et la plupart des roches. Il sert aussi à fabriquer les puces électroniques." },
    P:  { nom: "Phosphore", c: "#FFC4A3", o: "et", t: "Présent dans tes os et ton ADN. On l'utilise dans les allumettes et les engrais." },
    S:  { nom: "Soufre", c: "#E6E15A", o: "et", t: "Un élément jaune, présent près des volcans. On le trouve aussi dans le noyau de la Terre." },
    K:  { nom: "Potassium", c: "#D58CFF", o: "et", t: "Un métal présent dans les roches et dans les bananes. Ton corps en a besoin pour faire fonctionner tes muscles." },
    Ca: { nom: "Calcium", c: "#F2EEE4", o: "et", t: "Il forme tes os et tes dents, ainsi que le calcaire et les coquillages." },
    Fe: { nom: "Fer", c: "#D9773F", o: "et", t: "Le dernier élément fabriqué au cœur des étoiles massives, puis dispersé par leur explosion. Il forme le noyau de la Terre et transporte l'oxygène dans ton sang." },
    Ni: { nom: "Nickel", c: "#C0C6D6", o: "et", t: "Avec le fer, il forme le noyau de la Terre. On l'utilise dans les pièces de monnaie." },
    Nd: { nom: "Néodyme", c: "#E07BD1", o: "ex", t: "Une terre rare. Il sert à fabriquer des aimants très puissants : haut-parleurs, vibreurs, éoliennes." },
    Au: { nom: "Or", c: "#FFD34D", o: "ex", t: "Né lors de collisions d'étoiles à neutrons. Il sert en bijouterie et dans les circuits électroniques, car il ne rouille pas." },
    U:  { nom: "Uranium", c: "#9BE564", o: "ex", t: "Un élément très lourd né dans les explosions d'étoiles. C'est le combustible des centrales nucléaires." },
    X:  { nom: "Autres éléments", c: "#3A4170", o: "mx", t: "Tous les autres éléments réunis." }
  };
  var GRILLES = {
    univers: { titre: "L'Univers", parts: [["H", 74], ["He", 24], ["O", 1], ["X", 1]], note: "Le carbone, le néon, le fer et tous les autres éléments ne font qu'environ 1 % de l'Univers." },
    terre:   { titre: "La Terre entière", parts: [["Fe", 32], ["O", 30], ["Si", 15], ["Mg", 14], ["S", 3], ["Ni", 2], ["Ca", 2], ["Al", 1], ["X", 1]], note: "Le fer se trouve surtout dans le noyau de la Terre, au centre." },
    croute:  { titre: "La croûte terrestre", parts: [["O", 46], ["Si", 28], ["Al", 8], ["Fe", 5], ["Ca", 4], ["Na", 3], ["K", 3], ["Mg", 2], ["X", 1]], note: "La croûte, c'est la fine couche de roches à la surface de la Terre, sous nos pieds." },
    corps:   { titre: "Le corps humain", parts: [["O", 65], ["C", 18], ["H", 10], ["N", 3], ["Ca", 2], ["P", 1], ["X", 1]], note: "L'oxygène et l'hydrogène sont surtout dans l'eau, qui forme plus de la moitié de ton corps." }
  };

  /* ---------- Prédiction ---------- */
  function initPrediction() {
    var boite = document.getElementById("prediction-choix"), rep = document.getElementById("prediction-reponse");
    if (!boite) return;
    boite.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        boite.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-current", x === b ? "true" : "false"); });
        rep.querySelector(".debut").textContent = b.getAttribute("data-el") === "H" ? "Bravo !" : "Ce n'est pas ça.";
        rep.hidden = false;
      });
    });
  }

  /* ---------- Comparateur ---------- */
  function initComparateur() {
    var cv = document.getElementById("comp-grille");
    if (!cv) return;
    var g = cv.getContext("2d"), cle = "univers", choisi = "H", parOrigine = false, survol = -1;
    var cases = [];
    for (var i = 0; i < 100; i++) cases.push({ el: "H", de: [0, 0, 0], vers: [0, 0, 0], t0: 0 });
    function rgb(hex) { var n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
    function couleurDe(el) { return rgb(parOrigine ? ORIGINES[EL[el].o].couleur : EL[el].c); }
    function actuelle(c, now) { var k = reduit ? 1 : lisse((now - c.t0) / 450); return [c.de[0] + (c.vers[0] - c.de[0]) * k, c.de[1] + (c.vers[1] - c.de[1]) * k, c.de[2] + (c.vers[2] - c.de[2]) * k]; }
    function remplir(premier) {
      var liste = [], now = performance.now();
      GRILLES[cle].parts.forEach(function (p) { for (var j = 0; j < p[1]; j++) liste.push(p[0]); });
      cases.forEach(function (c, j) {
        var cur = premier ? couleurDe(liste[j]) : actuelle(c, now);
        c.el = liste[j]; c.de = cur; c.vers = couleurDe(c.el); c.t0 = now + (premier ? 0 : j * 7);
      });
      if (!GRILLES[cle].parts.some(function (p) { return p[0] === choisi; })) choisi = GRILLES[cle].parts[0][0];
      majPanneau();
      cv.setAttribute("aria-label", "Grille de 100 carrés : composition de " + GRILLES[cle].titre.toLowerCase() + ". " + GRILLES[cle].parts.map(function (p) { return EL[p[0]].nom + " " + p[1] + " %"; }).join(", ") + ".");
    }
    function majPanneau() {
      var p = GRILLES[cle].parts.filter(function (x) { return x[0] === choisi; })[0], e = EL[choisi];
      document.getElementById("comp-titre").textContent = GRILLES[cle].titre;
      document.getElementById("comp-nom").textContent = e.nom + (choisi !== "X" ? " (" + choisi + ")" : "");
      document.getElementById("comp-texte").textContent = e.t;
      document.getElementById("comp-part").textContent = "environ " + p[1] + " %";
      document.getElementById("comp-origine").textContent = ORIGINES[e.o].nom;
      var ul = document.getElementById("comp-liste");
      ul.innerHTML = "";
      GRILLES[cle].parts.forEach(function (q) {
        var li = document.createElement("li"), b = document.createElement("button");
        b.type = "button"; b.setAttribute("aria-pressed", q[0] === choisi ? "true" : "false");
        b.innerHTML = '<i style="background:' + (parOrigine ? ORIGINES[EL[q[0]].o].couleur : EL[q[0]].c) + '"></i><span>' + EL[q[0]].nom + "</span><b>" + q[1] + " %</b>";
        b.addEventListener("click", function () { choisi = q[0]; majPanneau(); });
        li.appendChild(b); ul.appendChild(li);
      });
      var n = document.createElement("li"); n.className = "comp-note"; n.textContent = GRILLES[cle].note; ul.appendChild(n);
    }
    function geom() {
      var W = cv.clientWidth, H = cv.clientHeight, cote = Math.min(W, H) * 0.86, pas = cote / 10;
      return { W: W, H: H, x0: (W - cote) / 2, y0: (H - cote) / 2, pas: pas };
    }
    function taille() { var d = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.round(cv.clientWidth * d); cv.height = Math.round(cv.clientHeight * d); g.setTransform(d, 0, 0, d, 0, 0); }
    function dessiner(now) {
      var G = geom(); g.clearRect(0, 0, G.W, G.H);
      cases.forEach(function (c, j) {
        var x = G.x0 + (j % 10) * G.pas, y = G.y0 + Math.floor(j / 10) * G.pas, col = actuelle(c, now);
        var actif = c.el === choisi, marge = G.pas * (actif ? 0.06 : 0.1);
        g.fillStyle = "rgb(" + col.map(Math.round).join(",") + ")";
        g.globalAlpha = actif || survol === j ? 1 : 0.82;
        g.beginPath(); if (g.roundRect) g.roundRect(x + marge, y + marge, G.pas - 2 * marge, G.pas - 2 * marge, G.pas * 0.12); else g.rect(x + marge, y + marge, G.pas - 2 * marge, G.pas - 2 * marge); g.fill();
        g.globalAlpha = 1;
        if (actif && G.pas > 26) { g.fillStyle = "rgba(7,10,30,0.75)"; g.font = "700 " + Math.round(G.pas * 0.32) + "px 'Atkinson Hyperlegible', sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(c.el === "X" ? "…" : c.el, x + G.pas / 2, y + G.pas / 2 + 1); }
      });
      requestAnimationFrame(dessiner);
    }
    function caseSous(ev) {
      var r = cv.getBoundingClientRect(), G = geom(), cx = Math.floor((ev.clientX - r.left - G.x0) / G.pas), cy = Math.floor((ev.clientY - r.top - G.y0) / G.pas);
      return cx >= 0 && cx < 10 && cy >= 0 && cy < 10 ? cy * 10 + cx : -1;
    }
    cv.addEventListener("click", function (ev) { var j = caseSous(ev); if (j >= 0) { choisi = cases[j].el; majPanneau(); } });
    cv.addEventListener("mousemove", function (ev) { survol = caseSous(ev); cv.style.cursor = survol >= 0 ? "pointer" : "default"; });
    cv.addEventListener("mouseleave", function () { survol = -1; });
    document.querySelectorAll("#comp-onglets button").forEach(function (b) {
      b.addEventListener("click", function () {
        cle = b.getAttribute("data-g");
        document.querySelectorAll("#comp-onglets button").forEach(function (x) { x.setAttribute("aria-current", x === b ? "true" : "false"); });
        remplir(false);
      });
    });
    var bc = document.getElementById("comp-couleurs");
    bc.addEventListener("click", function () {
      parOrigine = !parOrigine; bc.setAttribute("aria-pressed", parOrigine ? "true" : "false");
      bc.textContent = parOrigine ? "Colorer par élément" : "Colorer selon l'origine";
      document.getElementById("comp-legende").hidden = !parOrigine;
      remplir(false);
    });
    taille(); window.addEventListener("resize", taille);
    remplir(true); requestAnimationFrame(dessiner);
  }

  /* ---------- Forge des étoiles (3D) ---------- */
  var COUCHES = [
    { sym: "H", nom: "Hydrogène", c: "#5AA8FF", r: 1 },
    { sym: "He", nom: "Hélium", c: "#9FDCFF", r: 0.84 },
    { sym: "C", nom: "Carbone", c: "#FFD27A", r: 0.69 },
    { sym: "O", nom: "Oxygène", c: "#FFB347", r: 0.55 },
    { sym: "Si", nom: "Silicium", c: "#FF8A4C", r: 0.41 },
    { sym: "Fe", nom: "Fer", c: "#E5532F", r: 0.27 }
  ];
  var ETAPES = [
    { de: 0, num: "Étape 1 sur 6", nom: "Une étoile s'allume", texte: "Une étoile dix fois plus massive que le Soleil est faite surtout d'hydrogène. Dans son cœur, à plus de 10 millions de degrés, les noyaux d'hydrogène fusionnent.", entree: "Hydrogène (H)", sortie: "Hélium (He)" },
    { de: 2.2, num: "Étape 2 sur 6", nom: "L'hélium brûle à son tour", texte: "Quand l'hydrogène du cœur est épuisé, le cœur se contracte et chauffe encore. L'hélium fusionne alors pour donner du carbone puis de l'oxygène.", entree: "Hélium (He)", sortie: "Carbone (C), oxygène (O)" },
    { de: 4.5, num: "Étape 3 sur 6", nom: "Une étoile en oignon", texte: "Les fusions s'enchaînent, de plus en plus vite. L'étoile se structure en couches : les éléments les plus lourds au centre. La dernière étape fabrique du fer.", entree: "Silicium (Si)", sortie: "Fer (Fe)" },
    { de: 9.3, num: "Étape 4 sur 6", nom: "Le cœur de fer s'effondre", texte: "Le fer ne peut plus fusionner pour produire de l'énergie. Plus rien ne retient l'étoile : son cœur s'effondre sur lui-même en une fraction de seconde.", entree: "Plus rien", sortie: "—" },
    { de: 10.3, num: "Étape 5 sur 6", nom: "Supernova !", texte: "L'étoile explose. Cette explosion, des milliards de fois plus lumineuse que le Soleil, fabrique des éléments plus lourds que le fer et projette tous les éléments dans l'espace.", entree: "Explosion", sortie: "Éléments lourds (or, uranium…)" },
    { de: 13, num: "Étape 6 sur 6", nom: "Des poussières d'étoiles", texte: "Ces éléments se mélangent aux nuages de gaz de la galaxie. Ils formeront de nouvelles étoiles, des planètes comme la Terre… et les êtres vivants.", entree: "—", sortie: "La matière de nouvelles étoiles et planètes" }
  ];
  var FIN = 17;
  function initForge() {
    var cv = document.getElementById("forge3d"), cvT = document.getElementById("forge-traits"), boiteE = document.getElementById("forge-etiquettes");
    if (!cv) return;
    var curseur = document.getElementById("forge-temps"), bLecture = document.getElementById("forge-lecture"), bRejouer = document.getElementById("forge-rejouer");
    var t = 0, lecture = !reduit, dernier = performance.now(), visible = true, etapeCourante = -1;
    if (reduit) t = 8;
    function majEtape() {
      var k = 0; ETAPES.forEach(function (e, j) { if (t >= e.de) k = j; });
      if (k === etapeCourante) return; etapeCourante = k;
      var e = ETAPES[k];
      document.getElementById("forge-num").textContent = e.num; document.getElementById("forge-nom").textContent = e.nom;
      document.getElementById("forge-texte").textContent = e.texte; document.getElementById("forge-entree").textContent = e.entree; document.getElementById("forge-sortie").textContent = e.sortie;
      cv.setAttribute("aria-label", "Étoile massive en coupe. " + e.nom + ".");
    }
    function majLecture() { bLecture.textContent = lecture ? "Pause" : "Lecture"; bLecture.setAttribute("aria-pressed", lecture ? "true" : "false"); }
    curseur.addEventListener("input", function () { t = Number(curseur.value); lecture = false; majLecture(); majEtape(); });
    bLecture.addEventListener("click", function () { lecture = !lecture; if (lecture && t >= FIN) t = 0; majLecture(); });
    bRejouer.addEventListener("click", function () { t = 0; lecture = true; majLecture(); majEtape(); });
    majLecture(); majEtape();

    var T = window.THREE, R;
    try {
      if (!T) throw new Error("three absent");
      R = new T.WebGLRenderer({ canvas: cv, antialias: true });
      R.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      R.localClippingEnabled = true;
      R.setClearColor(0x070a1e);
    } catch (err) { document.getElementById("forge-erreur").hidden = false; return; }

    var scene = new T.Scene(), cam = new T.PerspectiveCamera(38, 1.6, 0.1, 200);
    scene.add(new T.AmbientLight(0xffffff, 0.45)); var dl = new T.DirectionalLight(0xffffff, 0.9); dl.position.set(3, 4, 5); scene.add(dl);
    // fond d'étoiles
    var nf = 1500, pf = new Float32Array(nf * 3);
    for (var i = 0; i < nf; i++) { var u = Math.random() * 2 - 1, th = Math.random() * 6.283, s = Math.sqrt(1 - u * u); pf.set([s * Math.cos(th) * 60, u * 60, s * Math.sin(th) * 60], i * 3); }
    var gf = new T.BufferGeometry(); gf.setAttribute("position", new T.BufferAttribute(pf, 3));
    scene.add(new T.Points(gf, new T.PointsMaterial({ color: 0xc8cfff, size: 1.2, sizeAttenuation: false, transparent: true, opacity: 0.7 })));
    // étoile en couches, ouverte d'un quart (deux plans de coupe)
    var p1 = new T.Plane(new T.Vector3(1, 0, 0), 0), p2 = new T.Plane(new T.Vector3(0, 0, 1), 0);
    var spheres = COUCHES.map(function (L) {
      var m = new T.Mesh(new T.SphereGeometry(L.r, 72, 54), new T.MeshStandardMaterial({ color: L.c, emissive: L.c, emissiveIntensity: 0.55, roughness: 0.55, side: T.DoubleSide, clippingPlanes: [p1, p2], clipIntersection: true }));
      scene.add(m); return m;
    });
    function lueurTex() {
      var c = document.createElement("canvas"); c.width = c.height = 128; var gg = c.getContext("2d"), gr = gg.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,255,255,0.45)"); gr.addColorStop(1, "rgba(255,255,255,0)");
      gg.fillStyle = gr; gg.fillRect(0, 0, 128, 128); return new T.CanvasTexture(c);
    }
    var TEX = lueurTex();
    var halo = new T.Sprite(new T.SpriteMaterial({ map: TEX, color: 0x7fb8ff, transparent: true, opacity: 0.3, blending: T.AdditiveBlending, depthWrite: false })); halo.scale.set(3.6, 3.6, 1); scene.add(halo);
    var eclair = new T.Sprite(new T.SpriteMaterial({ map: TEX, color: 0xfff2d8, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false })); scene.add(eclair);
    // nuage de l'explosion : couleurs des couches + éléments lourds (violet)
    var N = 5000, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), dir = new Float32Array(N * 4), cc = new T.Color();
    for (var n = 0; n < N; n++) {
      var u2 = Math.random() * 2 - 1, t2 = Math.random() * 6.283, s2 = Math.sqrt(1 - u2 * u2), k = Math.floor(Math.random() * 7);
      dir.set([s2 * Math.cos(t2), u2, s2 * Math.sin(t2), 0.35 + Math.pow(Math.random(), 0.6)], n * 4);
      cc.set(k === 6 ? "#C77DFF" : COUCHES[k].c); col.set([cc.r, cc.g, cc.b], n * 3);
    }
    var geo = new T.BufferGeometry(); geo.setAttribute("position", new T.BufferAttribute(pos, 3)); geo.setAttribute("color", new T.BufferAttribute(col, 3));
    var debris = new T.Points(geo, new T.PointsMaterial({ map: TEX, size: 0.055, vertexColors: true, transparent: true, blending: T.AdditiveBlending, depthWrite: false }));
    scene.add(debris);
    // nébuleuse : grands nuages doux et colorés qui apparaissent après l'explosion
    var nebs = [];
    for (var q = 0; q < 36; q++) {
      var cq = q % 7 === 6 ? "#C77DFF" : COUCHES[q % 6].c, sp = new T.Sprite(new T.SpriteMaterial({ map: TEX, color: cq, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false }));
      var uq = Math.random() * 2 - 1, tq = Math.random() * 6.283, sq = Math.sqrt(1 - uq * uq), rq = 0.9 + Math.random() * 1.2;
      sp.userData.p = new T.Vector3(sq * Math.cos(tq) * rq, uq * rq * 0.8, sq * Math.sin(tq) * rq); sp.userData.s = 0.8 + Math.random() * 0.9;
      scene.add(sp); nebs.push(sp);
    }
    // étoile à neutrons qui reste au centre
    var reste = new T.Sprite(new T.SpriteMaterial({ map: TEX, color: 0xbfe4ff, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false })); reste.scale.set(0.35, 0.35, 1); scene.add(reste);

    // étiquettes HTML + traits
    var etiq = COUCHES.map(function (L) { var s = document.createElement("span"); s.className = "forge-etiq"; s.innerHTML = '<b style="color:' + L.c + '">' + L.sym + "</b> " + L.nom; boiteE.appendChild(s); return s; });
    var etiqLourds = document.createElement("span"); etiqLourds.className = "forge-etiq forge-lourds"; etiqLourds.innerHTML = '<b>Or, uranium…</b> nés dans l\'explosion'; boiteE.appendChild(etiqLourds);
    var gT = cvT.getContext("2d"), vA = new T.Vector3(), up = new T.Vector3(0, 1, 0);

    function taille() {
      var W = cv.clientWidth, H = cv.clientHeight; R.setSize(W, H, false); cam.aspect = W / Math.max(1, H); cam.updateProjectionMatrix();
      var d = Math.min(2, window.devicePixelRatio || 1); cvT.width = Math.round(W * d); cvT.height = Math.round(H * d); gT.setTransform(d, 0, 0, d, 0, 0);
    }
    taille(); window.addEventListener("resize", taille);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(cv);

    function boucle(ms) {
      var dt = Math.min(0.1, (ms - dernier) / 1000); dernier = ms;
      requestAnimationFrame(boucle);
      if (!visible) return;
      if (lecture) { t += dt; if (t >= FIN) { t = FIN; lecture = false; majLecture(); } curseur.value = t; majEtape(); }
      var W = cv.clientWidth, H = cv.clientHeight, etroit = W < 520;
      // caméra : tourne doucement, l'étoile est décalée à gauche pour laisser la place aux noms
      var a = 0.5 + t * 0.12, d = (etroit ? 4.6 : 3.9) + 4.2 * entre(t, 10.4, 13.5);
      cam.position.set(Math.sin(a) * d, 1.15, Math.cos(a) * d);
      cam.lookAt(etroit ? 0 : 0.55 * Math.cos(a), etroit ? -0.35 : 0, etroit ? 0 : -0.55 * Math.sin(a));
      // coupe : on retire le quart tourné vers la caméra
      var c1 = new T.Vector3(Math.sin(a + 0.78), 0, Math.cos(a + 0.78)), c2 = new T.Vector3(Math.sin(a - 0.78), 0, Math.cos(a - 0.78));
      p1.normal.copy(c1).negate(); p2.normal.copy(c2).negate();
      // vie de l'étoile
      var effondre = entre(t, 9.3, 10.3), apres = Math.max(0, t - 10.3);
      COUCHES.forEach(function (L, j) {
        var ap = j === 0 ? 1 : entre(t, 0.8 + j * 1.35, 1.6 + j * 1.35), m = spheres[j];
        m.visible = ap > 0.01 && t < 10.5;
        m.scale.setScalar(Math.max(0.001, ap * (1 - 0.9 * effondre * (j === 0 ? 1 : 1))));
        m.material.emissiveIntensity = 0.5 + 0.25 * Math.sin(ms / 500 + j) * (1 - effondre);
      });
      halo.visible = t < 10.5; halo.scale.setScalar(3.6 * (1 - 0.8 * effondre));
      var fl = t > 10.3 ? Math.max(0, 1 - apres / 1.4) : 0; eclair.material.opacity = fl; eclair.scale.setScalar(1 + apres * 9);
      debris.visible = t > 10.3; debris.material.opacity = 1 - 0.35 * entre(t, 14, 17);
      for (var n = 0; n < N; n++) { var kk = 0.15 + 2.1 * (1 - Math.exp(-apres * 0.7)) * dir[n * 4 + 3]; pos[n * 3] = dir[n * 4] * kk; pos[n * 3 + 1] = dir[n * 4 + 1] * kk; pos[n * 3 + 2] = dir[n * 4 + 2] * kk; }
      geo.attributes.position.needsUpdate = true;
      reste.material.opacity = entre(t, 11, 12.5) * 0.9;
      var vn = entre(t, 11.2, 14);
      nebs.forEach(function (sp) { sp.position.copy(sp.userData.p).multiplyScalar(0.4 + 0.6 * vn); sp.scale.setScalar(sp.userData.s * (0.5 + 0.7 * vn)); sp.material.opacity = 0.16 * vn; });
      R.render(scene, cam);

      // traits et noms des couches
      gT.clearRect(0, 0, W, H);
      var vueCouches = t < 9.6, xCol = etroit ? W * 0.64 : W * 0.66, haut = etroit ? H * 0.08 : H * 0.12, pas = (H * (etroit ? 0.62 : 0.7)) / COUCHES.length;
      // direction le long d'une face de coupe, côté droit de l'écran
      var e1 = new T.Vector3().crossVectors(up, c1).normalize(); if (e1.dot(c2) < 0) e1.negate();
      var e2 = new T.Vector3().crossVectors(up, c2).normalize(); if (e2.dot(c1) < 0) e2.negate();
      vA.copy(e1).project(cam); var x1 = vA.x; vA.copy(e2).project(cam); var e = vA.x > x1 ? e2 : e1;
      COUCHES.forEach(function (L, j) {
        var ap = j === 0 ? 1 : entre(t, 1.2 + j * 1.35, 1.8 + j * 1.35), o = vueCouches ? ap * (1 - entre(t, 9.3, 9.6)) : 0;
        var span = etiq[j]; span.style.opacity = o.toFixed(2);
        if (o <= 0.01) return;
        var rMid = j < COUCHES.length - 1 ? (L.r + COUCHES[j + 1].r) / 2 : L.r * 0.5;
        vA.copy(e).multiplyScalar(rMid).add(new T.Vector3(0, 0.12 * (2.5 - j) * 0.4, 0)).project(cam);
        var px = (vA.x + 1) / 2 * W, py = (1 - vA.y) / 2 * H, ly = haut + j * pas + pas / 2;
        span.style.transform = "translate(" + (xCol + 10) + "px," + ly + "px) translateY(-50%)";
        gT.globalAlpha = o; gT.strokeStyle = L.c; gT.lineWidth = 1.5;
        gT.beginPath(); gT.moveTo(px, py); gT.lineTo(xCol - 14, ly); gT.lineTo(xCol + 4, ly); gT.stroke();
        gT.fillStyle = L.c; gT.beginPath(); gT.arc(px, py, 3.2, 0, 6.283); gT.fill();
        gT.globalAlpha = 1;
      });
      var oL = entre(t, 12, 12.8); etiqLourds.style.opacity = oL.toFixed(2);
      etiqLourds.style.transform = "translate(" + (etroit ? W * 0.05 : W * 0.06) + "px," + (H * 0.88) + "px) translateY(-50%)";
    }
    requestAnimationFrame(boucle);
  }

  /* ---------- Éléments clés ---------- */
  var CLES = ["H", "He", "Li", "C", "N", "O", "Si", "Ca", "Fe", "Nd", "Au", "U"];
  function initCles() {
    var boite = document.getElementById("cles"), fiche = document.getElementById("fiche-el");
    if (!boite) return;
    CLES.forEach(function (s) {
      var e = EL[s], b = document.createElement("button");
      b.type = "button"; b.className = "el-cle"; b.style.setProperty("--c", ORIGINES[e.o].couleur); b.setAttribute("aria-pressed", "false");
      b.innerHTML = "<strong>" + s + "</strong><small>" + e.nom + "</small>";
      b.addEventListener("click", function () {
        boite.querySelectorAll(".el-cle").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        fiche.innerHTML = '<p><strong class="fiche-sym" style="color:' + ORIGINES[e.o].couleur + '">' + s + "</strong> <strong>" + e.nom + "</strong> · " + ORIGINES[e.o].nom + "</p><p>" + e.t + "</p>";
      });
      boite.appendChild(b);
    });
  }

  /* ---------- Exercice ---------- */
  var EXO = [
    ["Si", "Silicium", "les puces électroniques", "et"],
    ["O", "Oxygène", "le verre de l'écran", "et"],
    ["H", "Hydrogène", "le plastique de la coque", "bb"],
    ["C", "Carbone", "le plastique de la coque", "et"],
    ["Au", "Or", "les circuits", "ex"],
    ["Nd", "Néodyme", "les aimants du haut-parleur", "ex"]
  ];
  function initExercice() {
    var boite = document.getElementById("ex-origines");
    if (!boite) return;
    EXO.forEach(function (q, i) {
      var l = document.createElement("div"); l.className = "ex-ligne";
      l.innerHTML = '<label for="ex-o' + i + '"><b>' + q[0] + "</b> " + q[1] + " <small>(" + q[2] + ")</small></label>" +
        '<select id="ex-o' + i + '" class="champ"><option value="">Choisir…</option><option value="bb">Big Bang</option><option value="et">Cœur des étoiles</option><option value="ex">Explosions d\'étoiles</option></select>';
      boite.appendChild(l);
    });
    document.getElementById("ex-indice").addEventListener("click", function () { document.getElementById("ex-aide").hidden = false; });
    document.getElementById("ex-verifier").addEventListener("click", function () {
      var justes = 0, vides = 0;
      EXO.forEach(function (q, i) {
        var s = document.getElementById("ex-o" + i), ligne = s.parentNode;
        ligne.classList.remove("juste", "faux");
        if (!s.value) { vides++; return; }
        if (s.value === q[3]) { justes++; ligne.classList.add("juste"); } else ligne.classList.add("faux");
      });
      var r = document.getElementById("ex-retour");
      if (vides) { r.className = "ex-retour"; r.textContent = "Il te reste " + vides + (vides > 1 ? " éléments" : " élément") + " sans réponse."; return; }
      if (justes === EXO.length) { r.className = "ex-retour juste"; r.innerHTML = "<strong>Bravo, tout est juste !</strong> Ton téléphone contient des atomes nés au Big Bang, dans des étoiles et dans des explosions d'étoiles."; }
      else { r.className = "ex-retour faux"; r.innerHTML = "<strong>" + justes + " sur " + EXO.length + ".</strong> Les lignes en rouge sont à revoir. Pense au fer : les étoiles fabriquent les éléments jusqu'au fer, pas au-delà."; }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initPrediction(); initComparateur(); initForge(); initCles(); initExercice();
  });
})();
