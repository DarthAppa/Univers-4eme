/* Partie 7 — La naissance du système solaire
   - simulateur 3D : nébuleuse → disque → ligne des glaces → planètes
   - frise des âges géologiques (éons, ères, périodes), avec zoom sur les 541 derniers Ma
   - horloge de la Terre (24 h) */
(function () {
  "use strict";
  var reduit = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function lisse(x) { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); }
  function entre(x, a, b) { return lisse((x - a) / (b - a)); }
  function nf(x, d) { return x.toLocaleString("fr-FR", { maximumFractionDigits: d == null ? 2 : d }); }
  function ilya(ma) {
    if (ma >= 1000) return nf(ma / 1000) + " milliards d'années";
    if (ma >= 1) return nf(ma, 0) + " millions d'années";
    return nf(ma * 1e6, 0) + " ans";
  }

  /* =========================================================
     1. SIMULATEUR 3D
     ========================================================= */
  var PLANETES = [
    { nom: "Mercure", r: 1.0, t: 0.07, c: "#B9B0A6", g: false },
    { nom: "Vénus", r: 1.45, t: 0.11, c: "#E8C27A", g: false },
    { nom: "Terre", r: 1.95, t: 0.12, c: "#5FA8FF", g: false },
    { nom: "Mars", r: 2.5, t: 0.09, c: "#D0643C", g: false },
    { nom: "Jupiter", r: 4.3, t: 0.42, c: "#D8B48A", g: true },
    { nom: "Saturne", r: 5.6, t: 0.35, c: "#E6D29A", g: true },
    { nom: "Uranus", r: 6.9, t: 0.24, c: "#9FE0EA", g: true },
    { nom: "Neptune", r: 8.1, t: 0.23, c: "#5B7CF0", g: true }
  ];
  var GLACE = 3.25;
  var ETAPES = [
    { de: 0, num: "Étape 1 sur 6", nom: "Un nuage de gaz et de poussières", date: "4,57 milliards d'années", texte: "Dans la Voie lactée, un immense nuage de gaz (surtout de l'hydrogène et de l'hélium) et de poussières flotte. Peut-être poussé par l'explosion d'une étoile voisine, il commence à s'effondrer sous l'effet de sa propre gravitation." },
    { de: 2.4, num: "Étape 2 sur 6", nom: "Le nuage tourne et s'aplatit", date: "4,57 milliards d'années", texte: "En se contractant, le nuage tourne de plus en plus vite, comme une patineuse qui ramène ses bras. Il s'aplatit en un disque : le disque protoplanétaire." },
    { de: 4.6, num: "Étape 3 sur 6", nom: "Le Soleil s'allume", date: "4,57 milliards d'années", texte: "Au centre, la matière se concentre et chauffe jusqu'à plusieurs millions de degrés. La fusion de l'hydrogène démarre : le Soleil s'allume. Il réunit 99,8 % de la masse du système solaire." },
    { de: 6.8, num: "Étape 4 sur 6", nom: "La ligne des glaces", date: "4,57 milliards d'années", texte: "Près du jeune Soleil, il fait très chaud : seules les roches et les métaux restent solides. Plus loin, au-delà de la ligne des glaces, l'eau gèle et les grains de glace s'ajoutent aux poussières." },
    { de: 8.6, num: "Étape 5 sur 6", nom: "Des poussières aux planètes", date: "4,56 à 4,5 milliards d'années", texte: "Les poussières se collent en cailloux, puis en blocs de quelques kilomètres : les planétésimaux. Ils s'attirent, se percutent et grossissent : c'est l'accrétion. Au-delà de la ligne des glaces, les planètes deviennent assez massives pour attirer le gaz : ce sont les géantes gazeuses." },
    { de: 12.4, num: "Étape 6 sur 6", nom: "Le système solaire est né", date: "4,5 milliards d'années", texte: "Le vent du jeune Soleil chasse le gaz restant. Il reste quatre planètes rocheuses près du Soleil, quatre géantes gazeuses plus loin, et entre les deux, la ceinture d'astéroïdes : des débris qui n'ont jamais formé de planète." }
  ];
  var FIN = 16;

  function initSimulateur() {
    var cv = document.getElementById("naissance3d"), boiteE = document.getElementById("naissance-etiquettes");
    if (!cv) return;
    var curseur = document.getElementById("nais-temps"), bLecture = document.getElementById("nais-lecture"), bRejouer = document.getElementById("nais-rejouer");
    var t = reduit ? FIN : 0, lecture = !reduit, dernier = performance.now(), visible = true, etapeCourante = -1;
    function majEtape() {
      var k = 0; ETAPES.forEach(function (e, j) { if (t >= e.de) k = j; });
      if (k === etapeCourante) return; etapeCourante = k;
      var e = ETAPES[k];
      document.getElementById("nais-num").textContent = e.num; document.getElementById("nais-nom").textContent = e.nom;
      document.getElementById("nais-texte").textContent = e.texte; document.getElementById("nais-date").textContent = e.date;
      cv.setAttribute("aria-label", "Formation du système solaire. " + e.nom + ".");
    }
    function majLecture() { bLecture.textContent = lecture ? "Pause" : "Lecture"; bLecture.setAttribute("aria-pressed", lecture ? "true" : "false"); }
    curseur.addEventListener("input", function () { t = Number(curseur.value); lecture = false; majLecture(); majEtape(); });
    bLecture.addEventListener("click", function () { lecture = !lecture; if (lecture && t >= FIN) t = 0; majLecture(); });
    bRejouer.addEventListener("click", function () { t = 0; lecture = true; majLecture(); majEtape(); });
    majLecture(); majEtape(); curseur.value = t;

    var T = window.THREE, R;
    try {
      if (!T) throw new Error("three absent");
      R = new T.WebGLRenderer({ canvas: cv, antialias: true });
      R.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); R.setClearColor(0x05071a);
    } catch (err) { document.getElementById("naissance-erreur").hidden = false; return; }

    var scene = new T.Scene(), cam = new T.PerspectiveCamera(40, 1.6, 0.1, 300);
    function lueurTex() {
      var c = document.createElement("canvas"); c.width = c.height = 128; var g = c.getContext("2d"), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,255,255,0.45)"); gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new T.CanvasTexture(c);
    }
    var TEX = lueurTex();
    // fond d'étoiles
    var nf2 = 1400, pf = new Float32Array(nf2 * 3);
    for (var i = 0; i < nf2; i++) { var u = Math.random() * 2 - 1, th = Math.random() * 6.283, s = Math.sqrt(1 - u * u); pf.set([s * Math.cos(th) * 120, u * 120, s * Math.sin(th) * 120], i * 3); }
    var gf = new T.BufferGeometry(); gf.setAttribute("position", new T.BufferAttribute(pf, 3));
    scene.add(new T.Points(gf, new T.PointsMaterial({ color: 0xc8cfff, size: 1.2, sizeAttenuation: false, transparent: true, opacity: 0.6 })));

    // poussières (roches/métaux près du Soleil, glaces au-delà) et gaz
    function nuee(n, gaz) {
      var o = { n: n, r0: new Float32Array(n), a0: new Float32Array(n), y0: new Float32Array(n), rd: new Float32Array(n), yd: new Float32Array(n), cible: new Int8Array(n), ta: new Float32Array(n), off: new Float32Array(n * 3) };
      var pos = new Float32Array(n * 3), col = new Float32Array(n * 3), cc = new T.Color();
      for (var k = 0; k < n; k++) {
        var uu = Math.random() * 2 - 1, tt = Math.random() * 6.283, ss = Math.sqrt(1 - uu * uu), dd = 2 + Math.pow(Math.random(), 0.6) * 8;
        var x = ss * Math.cos(tt) * dd, y = uu * dd * 0.85, z = ss * Math.sin(tt) * dd;
        o.r0[k] = Math.sqrt(x * x + z * z); o.a0[k] = Math.atan2(z, x); o.y0[k] = y;
        var rd = 0.55 + Math.pow(Math.random(), 0.85) * 9.2; o.rd[k] = rd; o.yd[k] = (Math.random() - 0.5) * (0.05 + rd * 0.03);
        // planète vers laquelle ce grain sera attiré (-1 : aucune ; -2 : ceinture d'astéroïdes)
        var c = -1;
        PLANETES.forEach(function (P, j) { var bande = P.g ? 0.75 : 0.3; if (Math.abs(rd - P.r) < bande && (!gaz || P.g)) c = j; });
        if (!gaz && c === -1 && rd > 2.85 && rd < 3.55) c = -2;
        o.cible[k] = c; o.ta[k] = (c >= 4 ? 8.8 : 9.6) + Math.random() * 2.2;
        o.off.set([(Math.random() - 0.5), (Math.random() - 0.5) * 0.6, (Math.random() - 0.5)], k * 3);
        if (gaz) { var q = Math.random(); cc.setRGB(0.35 + 0.25 * q, 0.38 + 0.2 * q, 0.85); }
        else if (rd < GLACE) { var q2 = Math.random(); cc.set(q2 < 0.4 ? "#C98B5A" : q2 < 0.75 ? "#A59A8E" : "#E0A060"); }
        else { var q3 = Math.random(); cc.set(q3 < 0.6 ? "#CFEAFF" : "#9CC8F0"); }
        col.set([cc.r, cc.g, cc.b], k * 3);
      }
      var geo = new T.BufferGeometry(); geo.setAttribute("position", new T.BufferAttribute(pos, 3)); geo.setAttribute("color", new T.BufferAttribute(col, 3));
      o.pts = new T.Points(geo, new T.PointsMaterial({ map: TEX, size: gaz ? 0.5 : 0.13, vertexColors: true, transparent: true, opacity: gaz ? 0.22 : 0.95, blending: T.AdditiveBlending, depthWrite: false }));
      o.pos = pos; o.geo = geo; scene.add(o.pts); return o;
    }
    var poussieres = nuee(15000, false), gaz = nuee(5000, true);

    // le Soleil
    var soleilM = new T.Mesh(new T.SphereGeometry(0.32, 40, 30), new T.MeshBasicMaterial({ color: 0xffd27a }));
    scene.add(soleilM);
    var halo = new T.Sprite(new T.SpriteMaterial({ map: TEX, color: 0xffc860, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false })); scene.add(halo);
    var lumiere = new T.PointLight(0xfff0d8, 0, 60, 1.2); scene.add(lumiere); scene.add(new T.AmbientLight(0xffffff, 0.18));
    // ligne des glaces
    var pts = []; for (var a = 0; a <= 160; a++) pts.push(new T.Vector3(Math.cos(a / 160 * 6.283) * GLACE, 0, Math.sin(a / 160 * 6.283) * GLACE));
    var ligneGlace = new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineDashedMaterial({ color: 0x7fe3ff, dashSize: 0.18, gapSize: 0.12, transparent: true, opacity: 0 }));
    ligneGlace.computeLineDistances(); scene.add(ligneGlace);
    // planètes
    var mPlan = PLANETES.map(function (P, j) {
      var g = new T.Group(), m = new T.Mesh(new T.SphereGeometry(P.t, 32, 24), new T.MeshStandardMaterial({ color: P.c, roughness: 0.8, emissive: P.c, emissiveIntensity: 0.15 }));
      g.add(m);
      if (P.nom === "Saturne") { var an = new T.Mesh(new T.RingGeometry(P.t * 1.35, P.t * 2.1, 48), new T.MeshBasicMaterial({ color: 0xd8c89a, side: T.DoubleSide, transparent: true, opacity: 0.7 })); an.rotation.x = Math.PI / 2 - 0.35; g.add(an); }
      if (P.g) { var at = new T.Sprite(new T.SpriteMaterial({ map: TEX, color: P.c, transparent: true, opacity: 0.35, blending: T.AdditiveBlending, depthWrite: false })); at.scale.setScalar(P.t * 4); g.add(at); }
      g.userData = { phi: j * 1.9 + 0.4, w: 1.3 / Math.pow(P.r, 1.5) }; g.scale.setScalar(0.001); scene.add(g); return g;
    });
    function posPlanete(j, tt, v) { var P = PLANETES[j], ph = mPlan[j].userData.phi + tt * mPlan[j].userData.w; v.set(Math.cos(ph) * P.r, 0, Math.sin(ph) * P.r); return v; }

    // étiquettes
    function etiquette(html, cls) { var s = document.createElement("span"); s.className = "forge-etiq" + (cls ? " " + cls : ""); s.innerHTML = html; boiteE.appendChild(s); return s; }
    var eP = PLANETES.map(function (P) { return etiquette(P.nom, P.g ? "" : "petite"); });
    var eGlace = etiquette('<b style="color:#7FE3FF">Ligne des glaces</b>');
    var eChaud = etiquette('<b style="color:#E0A060">Zone chaude</b> roches et métaux');
    var eFroid = etiquette('<b style="color:#CFEAFF">Zone froide</b> glaces et gaz');
    var eCeint = etiquette("Ceinture d'astéroïdes");
    var eSoleil = etiquette('<b style="color:#FFD27A">Soleil</b>');
    var v = new T.Vector3(), w = new T.Vector3();
    function placer(span, p3, opac, dx, dy) {
      span.style.opacity = opac.toFixed(2); if (opac <= 0.01) return;
      v.copy(p3).project(cam); if (v.z > 1) { span.style.opacity = "0"; return; }
      var W = cv.clientWidth, H = cv.clientHeight;
      span.style.transform = "translate(" + ((v.x + 1) / 2 * W + (dx || 0)) + "px," + ((1 - v.y) / 2 * H + (dy || 0)) + "px) translate(-50%,-50%)";
    }

    function taille() { var W = cv.clientWidth, H = cv.clientHeight; R.setSize(W, H, false); cam.aspect = W / Math.max(1, H); cam.updateProjectionMatrix(); }
    taille(); window.addEventListener("resize", taille);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(cv);

    function animer(o, tt, col, plat, isGaz) {
      var pos = o.pos, souffle = entre(tt, 12.2, 14.8);
      for (var k = 0; k < o.n; k++) {
        var r = o.r0[k] + (o.rd[k] - o.r0[k]) * col, a = o.a0[k] + tt * (0.08 + col * 0.95 / Math.sqrt(r + 0.4));
        var x = Math.cos(a) * r, y = o.y0[k] * (1 - col) * (1 - plat) + o.yd[k] * plat, z = Math.sin(a) * r;
        var c = o.cible[k];
        if (c >= 0) {
          var acc = entre(tt, o.ta[k], o.ta[k] + 1.3);
          if (acc > 0) {
            posPlanete(c, tt, w); var sp = (1 - acc) * PLANETES[c].t * 6;
            x += (w.x + o.off[k * 3] * sp - x) * acc; y += (o.off[k * 3 + 1] * sp - y) * acc; z += (w.z + o.off[k * 3 + 2] * sp - z) * acc;
          }
        } else if (c === -1 && souffle > 0) { var f = 1 + 6 * souffle; x *= f; z *= f; y *= f; }
        else if (isGaz && souffle > 0) { var f2 = 1 + 6 * souffle; x *= f2; z *= f2; }
        pos[k * 3] = x; pos[k * 3 + 1] = y; pos[k * 3 + 2] = z;
      }
      o.geo.attributes.position.needsUpdate = true;
    }

    function boucle(ms) {
      var dt = Math.min(0.1, (ms - dernier) / 1000); dernier = ms;
      requestAnimationFrame(boucle);
      if (!visible) return;
      if (lecture) { t += dt; if (t >= FIN) { t = FIN; lecture = false; majLecture(); } curseur.value = t; majEtape(); }
      var W = cv.clientWidth, H = cv.clientHeight, f = Math.max(1, 1.75 / (W / Math.max(1, H)));
      var col = entre(t, 0.4, 4.6), plat = entre(t, 2.2, 5.6), allume = entre(t, 4.4, 6);
      animer(poussieres, t, col, plat, false); animer(gaz, t, col, plat, true);
      gaz.pts.material.opacity = 0.22 * (1 - entre(t, 12.4, 15));
      soleilM.scale.setScalar(0.4 + 0.8 * allume); soleilM.material.color.setRGB(0.6 + 0.4 * allume, 0.3 + 0.55 * allume, 0.15 + 0.4 * allume);
      halo.material.opacity = 0.15 + 0.7 * allume; halo.scale.setScalar(1 + 1.5 * allume - 0.6 * entre(t, 11.5, 13)); lumiere.intensity = 2.2 * allume;
      ligneGlace.material.opacity = 0.85 * entre(t, 6.8, 7.6) * (1 - 0.6 * entre(t, 12, 13));
      mPlan.forEach(function (g, j) {
        var P = PLANETES[j], debut = P.g ? 8.9 : 9.8, gr = entre(t, debut, debut + 1.8);
        posPlanete(j, t, g.position); g.scale.setScalar(Math.max(0.001, gr)); g.visible = gr > 0.01; g.rotation.y = t * 0.6;
      });
      // caméra : vue inclinée qui tourne doucement
      var az = 0.6 + t * 0.05, el = 0.62 - 0.12 * entre(t, 0, 4), d = (18 - 2.5 * entre(t, 3, 7) - 0.7 * entre(t, 11.5, 13.5)) * f;
      cam.position.set(Math.sin(az) * Math.cos(el) * d, Math.sin(el) * d, Math.cos(az) * Math.cos(el) * d); cam.lookAt(0, -0.3, 0);
      R.render(scene, cam);

      // étiquettes
      var oZones = entre(t, 7.2, 7.8) * (1 - entre(t, 11.8, 12.4));
      var aG = az + Math.PI / 2; placer(eGlace, w.set(Math.sin(aG) * GLACE, 0, Math.cos(aG) * GLACE), entre(t, 7, 7.6) * (1 - entre(t, 12, 12.6)), 0, -14);
      placer(eChaud, w.set(Math.sin(az) * 1.6, 0, Math.cos(az) * 1.6), oZones, 0, 18);
      placer(eFroid, w.set(Math.sin(az) * 6.2, 0, Math.cos(az) * 6.2), oZones, 0, 18);
      placer(eSoleil, w.set(0, 0, 0), entre(t, 5, 5.6) * (1 - entre(t, 7, 7.4)), 0, -26);
      placer(eCeint, w.set(Math.sin(az - 2.3) * 3.2, 0, Math.cos(az - 2.3) * 3.2), entre(t, 13, 13.6), 0, -14);
      mPlan.forEach(function (g, j) { var P = PLANETES[j]; placer(eP[j], g.position, entre(t, 12.6, 13.2), 0, P.g ? -(P.t * 55 + 14) : (j % 2 ? 16 : -16)); });
    }
    requestAnimationFrame(boucle);
  }

  /* =========================================================
     2. ÂGES GÉOLOGIQUES : données communes
     ========================================================= */
  var EONS = [
    { nom: "Hadéen", de: 4540, a: 4000, c: "#9C3D3A", t: "L'« enfer » des débuts : la Terre est brûlante, couverte de roches en fusion et bombardée par des astéroïdes. La Lune se forme, puis les premiers océans." },
    { nom: "Archéen", de: 4000, a: 2500, c: "#C8604E", t: "Les premiers continents se forment. La vie apparaît dans les océans, sous forme de cellules microscopiques." },
    { nom: "Protérozoïque", de: 2500, a: 541, c: "#D99A5B", t: "Des bactéries remplissent l'air d'oxygène. Les premières cellules à noyau, puis les premiers êtres faits de plusieurs cellules apparaissent." },
    { nom: "Phanérozoïque", de: 541, a: 0, c: "#4F9E6A", t: "L'éon de la « vie visible » : animaux à coquilles, poissons, plantes, dinosaures, mammifères et humains." }
  ];
  var ERES = [
    { nom: "Paléozoïque", de: 541, a: 252, c: "#7FB28C", t: "L'ère « primaire » : explosion de la vie dans les océans, puis conquête des terres par les plantes, les insectes et les premiers vertébrés terrestres." },
    { nom: "Mésozoïque", de: 252, a: 66, c: "#5DB4C8", t: "L'ère « secondaire », celle des dinosaures. Les premiers mammifères, oiseaux et plantes à fleurs apparaissent." },
    { nom: "Cénozoïque", de: 66, a: 0, c: "#E3C35A", t: "Après la disparition des dinosaures, les mammifères se diversifient. C'est notre ère." }
  ];
  var PERIODES = [
    { nom: "Cambrien", t: "La vie animale explose dans les océans : trilobites, éponges, premiers animaux à squelette.", de: 541, a: 485, c: "#7FA056" }, { nom: "Ordovicien", t: "Les mers regorgent de coquillages et de trilobites. Les premières plantes colonisent les terres.", de: 485, a: 444, c: "#2E9E7E" }, { nom: "Silurien", t: "Apparition des premiers poissons à mâchoires et des premières plantes à tiges.", de: 444, a: 419, c: "#B3E1B6" },
    { nom: "Dévonien", t: "L'« âge des poissons ». Les premières forêts poussent et les premiers vertébrés sortent de l'eau.", de: 419, a: 359, c: "#CB8C37" }, { nom: "Carbonifère", t: "D'immenses forêts marécageuses, dont les restes formeront le charbon. Des insectes géants volent.", de: 359, a: 299, c: "#67A599" }, { nom: "Permien", t: "Les continents sont réunis en un seul, la Pangée. La période se termine par la plus grande extinction de l'histoire.", de: 299, a: 252, c: "#F04028" },
    { nom: "Trias", t: "Après la grande extinction, apparaissent les premiers dinosaures et les premiers mammifères.", de: 252, a: 201, c: "#9B4AA8" }, { nom: "Jurassique", t: "Le règne des grands dinosaures, comme le diplodocus. Les premiers oiseaux apparaissent.", de: 201, a: 145, c: "#34B2C9" }, { nom: "Crétacé", t: "Les plantes à fleurs apparaissent. Le tyrannosaure vit à la fin du Crétacé, qui se termine par la chute d'un astéroïde.", de: 145, a: 66, c: "#7FC64E" },
    { nom: "Paléogène", t: "Les mammifères se diversifient et prennent la place des dinosaures. Les premiers primates apparaissent.", de: 66, a: 23, c: "#FD9A52" }, { nom: "Néogène", t: "Les premiers ancêtres des humains apparaissent en Afrique.", de: 23, a: 2.6, c: "#FFE619" }, { nom: "Quaternaire", t: "Une période de glaciations. Notre espèce, Homo sapiens, apparaît et peuple toute la Terre.", de: 2.6, a: 0, c: "#F9F97F" }
  ];
  var EVTS = [
    { ma: 4540, nom: "Formation de la Terre", t: "La Terre se forme par accumulation de roches dans le disque autour du jeune Soleil. Elle est couverte de roches en fusion." },
    { ma: 4500, nom: "Formation de la Lune", t: "Théia, une planète de la taille de Mars, percute la jeune Terre. Les débris projetés s'assemblent pour former la Lune." },
    { ma: 4400, nom: "Premiers océans", t: "La Terre refroidit et la vapeur d'eau de l'atmosphère se condense en pluie : les premiers océans apparaissent. Les plus vieux cristaux connus datent de cette époque." },
    { ma: 3800, nom: "Premières traces de vie", t: "Dans les océans apparaissent des êtres vivants microscopiques, faits d'une seule cellule." },
    { ma: 3500, nom: "Premiers stromatolithes", t: "Des colonies de bactéries forment des sortes de récifs, les stromatolithes. Certaines fabriquent de l'oxygène grâce à la lumière du Soleil." },
    { ma: 2400, nom: "L'oxygène envahit l'air", t: "L'oxygène fabriqué par les bactéries s'accumule enfin dans l'atmosphère. Sans lui, les animaux n'auraient jamais pu apparaître." },
    { ma: 570, nom: "Premiers animaux", t: "Dans les océans vivent les premiers êtres faits de nombreuses cellules : des animaux aux corps mous, sans squelette." },
    { ma: 535, nom: "Explosion cambrienne", t: "En quelques dizaines de millions d'années, apparaissent la plupart des grands groupes d'animaux, avec coquilles, carapaces et squelettes." },
    { ma: 470, nom: "Premières plantes terrestres", t: "Des plantes simples, proches des mousses, colonisent les terres, jusque-là nues." },
    { ma: 375, nom: "Sortie des eaux", t: "Des poissons aux nageoires charnues commencent à s'aventurer sur la terre ferme. Ce sont les ancêtres des amphibiens, des reptiles et des mammifères." },
    { ma: 252, nom: "La grande extinction", t: "La plus grande extinction de l'histoire de la Terre : environ 90 % des espèces marines disparaissent, sans doute à cause d'énormes éruptions volcaniques." },
    { ma: 230, nom: "Premiers dinosaures", t: "Les dinosaures apparaissent au Trias. Ils domineront les terres pendant plus de 160 millions d'années." },
    { ma: 66, nom: "Fin des dinosaures", t: "L'astéroïde de Chicxulub percute la Terre au Mexique. Les dinosaures disparaissent, sauf les ancêtres des oiseaux." },
    { ma: 0.3, nom: "Homo sapiens", t: "Notre espèce apparaît en Afrique, puis peuple progressivement toute la Terre." }
  ];
  function trouver(liste, ma) { for (var i = 0; i < liste.length; i++) if (ma <= liste[i].de && ma > liste[i].a) return liste[i]; return ma <= 0 ? liste[liste.length - 1] : null; }
  var AGE_T = 4540;
  function heureDe(ma) { return (AGE_T - ma) / AGE_T * 24; }
  function fmtHeure(h, avecSec) {
    var tot = Math.round(h * 3600); if (tot >= 86400) return "minuit";
    var hh = Math.floor(tot / 3600), mm = Math.floor((tot % 3600) / 60), ss = tot % 60;
    return hh + " h " + (mm < 10 ? "0" : "") + mm + (avecSec ? " min " + (ss < 10 ? "0" : "") + ss + " s" : "");
  }
  function fmtHeureEvt(ma) { var h = heureDe(ma); return fmtHeure(h, h > 23.9); }
  function lumineux(hex) { var n = parseInt(hex.slice(1), 16); return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) > 150; }

  /* ---------- Frise des âges géologiques ---------- */
  function initFrise() {
    var frise = document.getElementById("geo-frise");
    if (!frise) return;
    var vue = "tout", choisi = EVTS[0];
    function fiche(o, type) {
      var quand = type === "evt" ? "Il y a " + ilya(o.ma) : "De " + ilya(o.de).replace(" d'années", "") + " à " + (o.a === 0 ? "aujourd'hui" : ilya(o.a).replace(" d'années", "")) + (o.a === 0 ? "" : " d'années");
      document.getElementById("geo-quand").textContent = quand;
      document.getElementById("geo-nom").textContent = o.nom;
      document.getElementById("geo-texte").textContent = o.t || "Une période géologique de l'ère " + (trouver(ERES, (o.de + o.a) / 2) || {}).nom + ".";
      var ma = type === "evt" ? o.ma : (o.de + o.a) / 2, eon = trouver(EONS, ma), ere = trouver(ERES, ma), per = trouver(PERIODES, ma);
      document.getElementById("geo-eon").textContent = eon ? eon.nom : "—";
      document.getElementById("geo-ere").textContent = ere ? ere.nom + (per && type !== "ere" ? ", " + per.nom : "") : "Avant les ères du Phanérozoïque";
      document.getElementById("geo-heure").textContent = type === "evt" ? fmtHeureEvt(o.ma) : "de " + fmtHeure(heureDe(o.de)) + " à " + fmtHeure(heureDe(o.a));
      frise.querySelectorAll("[aria-pressed]").forEach(function (b) { b.setAttribute("aria-pressed", b._o === o ? "true" : "false"); });
    }
    function rendre() {
      var deb = vue === "tout" ? 4600 : 541, X = function (ma) { return (deb - ma) / deb * 100; };
      frise.innerHTML = "";
      var lignes = vue === "tout" ? [EONS] : [ERES, PERIODES], types = vue === "tout" ? ["eon"] : ["ere", "per"];
      var evts = EVTS.filter(function (e) { return vue === "tout" ? e.ma > 541 : e.ma <= 541; });
      // marqueurs d'événements (placés en rangées pour ne pas se chevaucher)
      var zoneE = document.createElement("div"); zoneE.className = "geo-evts"; frise.appendChild(zoneE);
      var marqueurs = evts.map(function (e) {
        var b = document.createElement("button"); b.type = "button"; b.className = "geo-evt"; b._o = e; b.setAttribute("aria-pressed", "false");
        b.innerHTML = "<span>" + e.nom + "</span>"; b.style.left = X(e.ma) + "%";
        b.addEventListener("click", function () { fiche(e, "evt"); });
        zoneE.appendChild(b); return b;
      });
      if (vue === "tout") {
        var bz = document.createElement("button"); bz.type = "button"; bz.className = "geo-evt geo-renvoi"; bz.innerHTML = "<span>Animaux, plantes, dinosaures, humains… zoom</span>";
        bz.style.left = X(270) + "%"; bz.addEventListener("click", function () { changer("zoom"); }); zoneE.appendChild(bz); marqueurs.push(bz);
      }
      // bandes
      lignes.forEach(function (liste, li) {
        var rang = document.createElement("div"); rang.className = "geo-rang"; frise.appendChild(rang);
        liste.forEach(function (o) {
          var b = document.createElement("button"); b.type = "button"; b.className = "geo-bande"; b._o = o; b.setAttribute("aria-pressed", "false");
          b.style.left = X(o.de) + "%"; b.style.width = (X(o.a) - X(o.de)) + "%"; b.style.background = o.c; b.style.color = lumineux(o.c) ? "#10142E" : "#FFFFFF";
          b.innerHTML = "<span>" + o.nom + "</span>"; b.setAttribute("aria-label", o.nom + ", de " + ilya(o.de) + " à " + (o.a === 0 ? "aujourd'hui" : ilya(o.a)));
          b.addEventListener("click", function () { fiche(o, types[li]); });
          rang.appendChild(b);
        });
      });
      // graduations
      var grad = document.createElement("div"); grad.className = "geo-grads"; frise.appendChild(grad);
      (vue === "tout" ? [4600, 4000, 3000, 2000, 1000, 0] : [541, 400, 300, 200, 100, 0]).forEach(function (ma, k, arr) {
        var s = document.createElement("span"); s.style.left = X(ma) + "%"; s.className = k === 0 ? "debut" : k === arr.length - 1 ? "fin" : "";
        s.textContent = ma === 0 ? "Aujourd'hui" : "-" + (ma >= 1000 ? nf(ma / 1000) + " Ga" : ma + " Ma"); grad.appendChild(s);
      });
      // rangées des marqueurs + masquage des noms trop longs dans les bandes
      requestAnimationFrame(function () {
        var rangs = [], H = 30;
        marqueurs.forEach(function (b) {
          var w = b.querySelector("span").offsetWidth + 10, x = b.offsetLeft, x0 = x - w / 2, x1 = x + w / 2, Wf = zoneE.clientWidth;
          if (x0 < 0) { b.classList.add("gauche"); x0 = x; x1 = x + w; } else if (x1 > Wf) { b.classList.add("droite"); x0 = x - w; x1 = x; }
          var r = 0; while (rangs[r] && rangs[r].some(function (iv) { return x0 < iv[1] + 6 && x1 > iv[0] - 6; })) r++;
          (rangs[r] = rangs[r] || []).push([x0, x1]); b.style.setProperty("--rang", r);
        });
        zoneE.style.height = (Math.max(1, rangs.length) * H + 14) + "px";
        frise.querySelectorAll(".geo-bande").forEach(function (b) {
          var s = b.querySelector("span"), place = b.clientWidth - 6, nom = b._o.nom; b.title = nom;
          s.textContent = nom; s.style.fontSize = ""; s.style.visibility = "visible";
          if (s.offsetWidth > place) s.style.fontSize = "0.7rem";
          if (s.offsetWidth > place) s.textContent = nom.slice(0, 3) + ".";
          if (s.offsetWidth > place) s.style.visibility = "hidden";
        });
        fiche(choisi && (vue === "tout" ? choisi.ma > 541 || choisi.de > 541 : true) ? choisi : evts[0], choisi && choisi.ma != null ? "evt" : "evt");
      });
    }
    function changer(v) {
      vue = v; choisi = v === "tout" ? EVTS[0] : EVTS.filter(function (e) { return e.ma <= 541; })[0];
      document.getElementById("geo-tout").setAttribute("aria-current", v === "tout" ? "true" : "false");
      document.getElementById("geo-zoom").setAttribute("aria-current", v === "zoom" ? "true" : "false");
      rendre();
    }
    document.getElementById("geo-tout").addEventListener("click", function () { changer("tout"); });
    document.getElementById("geo-zoom").addEventListener("click", function () { changer("zoom"); });
    var attente; window.addEventListener("resize", function () { clearTimeout(attente); attente = setTimeout(rendre, 150); });
    rendre();
  }

  /* ---------- Horloge de la Terre ---------- */
  function initHorloge() {
    var svg = document.getElementById("horloge");
    if (!svg) return;
    var NS = "http://www.w3.org/2000/svg", Rr = 128;
    function el(nom, attrs, parent) { var e = document.createElementNS(NS, nom); for (var k in attrs) e.setAttribute(k, attrs[k]); (parent || svg).appendChild(e); return e; }
    function pt(h, r) { var a = h / 24 * 2 * Math.PI - Math.PI / 2; return [Math.cos(a) * r, Math.sin(a) * r]; }
    function arc(h0, h1, r0, r1) {
      var a = pt(h0, r1), b = pt(h1, r1), c = pt(h1, r0), d = pt(h0, r0), grand = (h1 - h0) > 12 ? 1 : 0;
      return "M" + a + " A" + r1 + " " + r1 + " 0 " + grand + " 1 " + b + " L" + c + " A" + r0 + " " + r0 + " 0 " + grand + " 0 " + d + " Z";
    }
    el("circle", { r: Rr + 14, fill: "#0B1030", stroke: "#323C78" });
    EONS.forEach(function (e) { el("path", { d: arc(heureDe(e.de), heureDe(e.a), Rr - 16, Rr), fill: e.c, opacity: 0.9 }); });
    for (var h = 0; h < 24; h++) {
      var p0 = pt(h, Rr + 2), p1 = pt(h, Rr + (h % 6 === 0 ? 12 : 7)); el("line", { x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1], stroke: "#ABA8CC", "stroke-width": h % 6 === 0 ? 2 : 1 });
      if (h % 3 === 0) { var pl = pt(h, Rr - 30); var tx = el("text", { x: pl[0], y: pl[1] + 4, "text-anchor": "middle", fill: "#ECE9F7", "font-size": 12, "font-family": "Atkinson Hyperlegible, sans-serif" }); tx.textContent = h + " h"; }
    }
    EVTS.forEach(function (e) { var p = pt(heureDe(e.ma), Rr - 8); el("circle", { cx: p[0], cy: p[1], r: 3.2, fill: "#FFFFFF", stroke: "#0B1030", "stroke-width": 1 }); });
    var aiguille = el("line", { x1: 0, y1: 0, x2: 0, y2: -(Rr - 22), stroke: "#FF5D72", "stroke-width": 3.5, "stroke-linecap": "round" });
    el("circle", { r: 6, fill: "#FF5D72" });
    var centre = el("text", { x: 0, y: 44, "text-anchor": "middle", fill: "#FFD08A", "font-size": 20, "font-weight": 700, "font-family": "Atkinson Hyperlegible, sans-serif" });

    var curseur = document.getElementById("h-curseur"), bJouer = document.getElementById("h-jouer"), joue = false, depart = 0, base = 0;
    function maj(minutes) {
      var h = minutes / 60, ma = AGE_T * (1 - h / 24);
      aiguille.setAttribute("transform", "rotate(" + (h / 24 * 360) + ")");
      centre.textContent = fmtHeure(h);
      var dernier = EVTS[0]; EVTS.forEach(function (e) { if (heureDe(e.ma) <= h + 1e-6) dernier = e; });
      var fin = minutes >= 1440;
      document.getElementById("h-heure").textContent = fin ? "Minuit : aujourd'hui" : fmtHeure(h);
      document.getElementById("h-titre").textContent = fin ? "Aujourd'hui" : dernier.nom;
      document.getElementById("h-texte").textContent = fin ? "Homo sapiens n'est apparu qu'à 23 h 59 min 54 s, soit 6 secondes avant minuit. Toute l'histoire humaine tient dans ces quelques secondes !" : "Dernier grand événement : " + dernier.nom.toLowerCase() + ", à " + fmtHeureEvt(dernier.ma) + ". " + dernier.t;
      document.getElementById("h-ilya").textContent = fin ? "Aujourd'hui" : "Il y a " + ilya(ma);
      var eon = trouver(EONS, ma); document.getElementById("h-eon").textContent = eon ? eon.nom : "—";
    }
    curseur.addEventListener("input", function () { joue = false; majJouer(); maj(Number(curseur.value)); });
    function majJouer() { bJouer.textContent = joue ? "Pause" : "Lancer la journée"; bJouer.setAttribute("aria-pressed", joue ? "true" : "false"); }
    bJouer.addEventListener("click", function () {
      joue = !joue; if (joue) { base = Number(curseur.value) >= 1440 ? 0 : Number(curseur.value); depart = performance.now(); requestAnimationFrame(tourner); }
      majJouer();
    });
    function tourner(ms) {
      if (!joue) return;
      var m = Math.min(1440, base + (ms - depart) / 1000 * 60);   // 1 heure = 1 seconde
      curseur.value = m; maj(m);
      if (m >= 1440) { joue = false; majJouer(); return; }
      requestAnimationFrame(tourner);
    }
    document.getElementById("h-fin").addEventListener("click", function () { joue = false; majJouer(); curseur.value = 1440; maj(1440); });
    maj(0);
    // tableau
    var tb = document.getElementById("h-table");
    EVTS.forEach(function (e) { var tr = document.createElement("tr"); tr.innerHTML = "<td>" + e.nom + "</td><td>" + ilya(e.ma) + "</td><td>" + fmtHeureEvt(e.ma) + "</td>"; tb.appendChild(tr); });
  }

  document.addEventListener("DOMContentLoaded", function () { initSimulateur(); initFrise(); initHorloge(); });
})();
