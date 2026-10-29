// Rendu de la page à partir de window.CARTE et window.LIB.
(function () {
  const C = window.CARTE, L = window.LIB;
  const ORDRE = ['phrase', 'subordonnees', 'fonctions', 'lexique', 'nom', 'verbe', 'invariables'];
  const BR = ORDRE.map(id => C.branches.find(b => b.id === id));
  const INDEX = new Map();
  BR.forEach(b => b.items.forEach(n => INDEX.set(n.id, { notion: n, branche: b })));
  const TOTAL = INDEX.size;
  const $ = s => document.querySelector(s);

  function index(id) { return INDEX.get(id); }

  // Typographie française : espaces insécables avant ; : ! ? et dans les guillemets.
  function typo(s) {
    return String(s).replace(/ ([;:!?»])/g, ' $1').replace(/« /g, '« ');
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function txt(s) { return typo(esc(s)); }
  function marque(s, balise) {
    return txt(s).replace(/\[\[(.+?)\]\]/g, `<${balise}>$1</${balise}>`);
  }
  function enClair(s) { return String(s).replace(/\[\[|\]\]/g, ''); }

  /* ---------- Carte ---------- */
  let courant = null;

  function rendreCarte() {
    const grid = $('#mapgrid');
    const cote = side => {
      const col = document.createElement('div');
      col.className = 'side ' + side;
      BR.filter(b => b.side === side).forEach(b => {
        const br = document.createElement('div');
        br.className = 'branch';
        br.style.setProperty('--bc', `var(${b.c})`);
        br.dataset.branche = b.id;
        const head = document.createElement('button');
        head.type = 'button';
        head.className = 'head';
        head.innerHTML = `<b>${txt(b.l)}</b><span>${txt(b.t)}</span>`;
        head.addEventListener('click', () => ouvrir(b.items[0].id));
        const leaves = document.createElement('div');
        leaves.className = 'leaves';
        let sous = null;
        b.items.forEach(n => {
          if (n.s && n.s !== sous) {
            sous = n.s;
            const s = document.createElement('div');
            s.className = 'sub';
            s.textContent = n.s;
            leaves.appendChild(s);
          }
          const leaf = document.createElement('button');
          leaf.type = 'button';
          leaf.className = 'leaf';
          leaf.dataset.id = n.id;
          leaf.innerHTML = txt(n.l) + (n.niv === 2 ? '<span class="badge" aria-label="niveau II">II</span>' : '');
          leaf.addEventListener('click', () => ouvrir(n.id, true));
          leaves.appendChild(leaf);
        });
        br.append(head, leaves);
        col.appendChild(br);
      });
      return col;
    };
    const core = document.createElement('div');
    core.className = 'core';
    core.innerHTML = '<b>La phrase</b><span>P = [GS + GV] (+ GC)</span>';
    grid.append(cote('L'), core, cote('R'));
  }

  function tracerLiens() {
    const svg = $('#links'), map = $('#map');
    if (getComputedStyle(svg).display === 'none') return;
    const r0 = map.getBoundingClientRect();
    const centre = el => { const r = el.getBoundingClientRect(); return { x: r.left - r0.left + r.width / 2, y: r.top - r0.top + r.height / 2, l: r.left - r0.left, r: r.right - r0.left }; };
    const core = centre($('.core'));
    let d = '';
    document.querySelectorAll('.branch').forEach(br => {
      const coul = getComputedStyle(br).getPropertyValue('--bc');
      const h = centre(br.querySelector('.head'));
      const gauche = br.closest('.side').classList.contains('L');
      const x1 = gauche ? core.l : core.r, x2 = gauche ? h.r : h.l;
      d += `<path d="M${x1},${core.y} C${(x1 + x2) / 2},${core.y} ${(x1 + x2) / 2},${h.y} ${x2},${h.y}" stroke="${coul}" stroke-width="1.6" opacity=".55"/>`;
      br.querySelectorAll('.leaf').forEach(lf => {
        const f = centre(lf);
        const a = gauche ? h.l : h.r, b = gauche ? f.r : f.l;
        d += `<path d="M${a},${h.y} C${(a + b) / 2},${h.y} ${(a + b) / 2},${f.y} ${b},${f.y}" stroke="${coul}" stroke-width=".8" opacity=".3"/>`;
      });
    });
    svg.setAttribute('viewBox', `0 0 ${r0.width} ${r0.height}`);
    svg.innerHTML = d;
  }

  /* ---------- Fiche ---------- */
  function puces(ids, coulDefaut) {
    return '<div class="chips">' + ids.map(id => {
      const e = index(id);
      if (!e) return '';
      return `<button type="button" class="chip" data-ouvrir="${id}" style="--cc:var(${e.branche.c || coulDefaut})">${txt(e.notion.l)}</button>`;
    }).join('') + '</div>';
  }

  function rendreFiche(n, b) {
    const f = $('#fiche');
    f.style.setProperty('--bc', `var(${b.c})`);
    const estFonction = b.id === 'fonctions';
    const liens = estFonction ? L.naturesPour(C.nf, n.id) : L.fonctionsPour(C.nf, n.id);
    let h = `<div class="eyebrow">${txt(b.l)}${n.s ? ' · ' + txt(n.s) : ''}${n.niv === 2 ? ' · niveau II' : ''}</div>`;
    h += `<h2>${txt(n.l)}</h2>`;
    h += `<div class="blk"><div class="lbl">Définition</div><p>${txt(n.d)}</p></div>`;
    h += `<div class="blk"><div class="lbl">Exemples</div><ul class="ex">${n.ex.map(e => `<li>${marque(e.t, 'mark')}${e.n ? `<small>${txt(e.n)}</small>` : ''}</li>`).join('')}</ul></div>`;
    h += `<div class="blk"><div class="lbl">Comment le reconnaître</div><ul class="rep">${n.rep.map(r => `<li>${txt(r)}</li>`).join('')}</ul></div>`;
    if (n.astuce) h += `<div class="tip"><b>Astuce</b> — ${txt(n.astuce)}</div>`;
    if (liens.length) h += `<div class="blk"><div class="lbl">${estFonction ? 'Natures possibles' : 'Fonctions possibles'}</div>${puces(liens)}</div>`;
    if (n.appro) {
      h += `<details class="appro"><summary>Approfondir (niveau II)</summary><p>${txt(n.appro.d)}</p>`;
      if (n.appro.pts && n.appro.pts.length) h += `<ul>${n.appro.pts.map(p => `<li>${txt(p)}</li>`).join('')}</ul>`;
      h += '</details>';
    }
    h += `<div class="ref">Guide Eduscol, p. ${pages(n.p)}</div>`;
    f.innerHTML = h;
  }

  // 12, 13, 14, 82, 83 → « 12-14 · 82-83 »
  function pages(p) {
    const s = [...p].sort((a, b) => a - b), plages = [];
    s.forEach(x => {
      const der = plages[plages.length - 1];
      if (der && x === der[1] + 1) der[1] = x; else plages.push([x, x]);
    });
    return plages.map(([a, b]) => a === b ? a : a + '-' + b).join(' · ');
  }

  function ouvrir(id, defiler) {
    const e = index(id);
    if (!e) return;
    courant = id;
    document.querySelectorAll('.leaf.on').forEach(x => x.classList.remove('on'));
    const leaf = document.querySelector(`.leaf[data-id="${id}"]`);
    if (leaf) leaf.classList.add('on');
    rendreFiche(e.notion, e.branche);
    if (defiler && window.innerWidth < 1180) $('#fiche').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  document.addEventListener('click', ev => {
    const c = ev.target.closest('[data-ouvrir]');
    if (c) { ev.preventDefault(); ouvrir(c.dataset.ouvrir, true); }
  });

  /* ---------- Recherche ---------- */
  function chercher(q) {
    const vide = !L.norm(q).trim();
    let n = 0;
    BR.forEach(b => {
      let hitsBranche = 0;
      b.items.forEach(notion => {
        const ok = L.correspond(notion, q);
        const leaf = document.querySelector(`.leaf[data-id="${notion.id}"]`);
        leaf.classList.toggle('dim', !vide && !ok);
        leaf.classList.toggle('hit', !vide && ok);
        if (ok) { n++; hitsBranche++; }
      });
      const br = document.querySelector(`.branch[data-branche="${b.id}"]`);
      br.querySelector('.head').classList.toggle('dim', !vide && !hitsBranche);
      br.querySelectorAll('.sub').forEach(s => s.classList.toggle('dim', !vide));
    });
    $('#hint').textContent = vide ? `${TOTAL} notions en 7 branches`
      : n === 0 ? 'Aucune notion ne correspond' : n === 1 ? '1 notion trouvée' : `${n} notions trouvées`;
  }

  /* ---------- Toutes les fiches et mode révision ---------- */
  let reveles = 0;

  function rendreFiches() {
    $('#fiches').innerHTML = BR.map(b => `
      <div class="fam" style="--bc:var(${b.c})">
        <div class="fam-head"><h3>${txt(b.l)}</h3><p>${txt(b.d)}</p></div>
        <div class="cards">${b.items.map(n => `
          <article class="card" data-id="${n.id}">
            <h4>${n.s ? `<small>${txt(n.s)}</small>` : ''}${txt(n.l)}${n.niv === 2 ? '<span class="badge">II</span>' : ''}</h4>
            <div class="reveal">
              <p>${txt(n.d)}</p>
              <p class="exl">${marque(n.ex[0].t, 'mark')}</p>
              <button type="button" class="more" data-ouvrir="${n.id}">Fiche complète</button>
            </div>
          </article>`).join('')}
        </div>
      </div>`).join('');
  }

  function majCompteur() {
    const c = $('#revcount');
    c.hidden = !document.body.classList.contains('revision');
    c.textContent = `${reveles} / ${TOTAL} révélées`;
  }

  function reveler(card) {
    if (!document.body.classList.contains('revision') || card.classList.contains('shown')) return;
    card.classList.add('shown');
    card.removeAttribute('tabindex');
    card.removeAttribute('role');
    reveles++;
    majCompteur();
  }

  function basculerRevision() {
    const actif = document.body.classList.toggle('revision');
    $('#rev').setAttribute('aria-pressed', String(actif));
    reveles = 0;
    document.querySelectorAll('.card').forEach(card => {
      card.classList.remove('shown');
      if (actif) { card.tabIndex = 0; card.setAttribute('role', 'button'); }
      else { card.removeAttribute('tabindex'); card.removeAttribute('role'); }
    });
    majCompteur();
  }

  /* ---------- Confusions ---------- */
  function rendreConfusions() {
    // Les réponses contiennent un HTML limité (<strong>, <i>) écrit dans data/confusions.js.
    $('#confusions').innerHTML = C.confusions.map(c => `
      <div class="trap">
        <h4>${txt(c.q)}</h4>
        <p>${typo(c.r)}</p>
        ${puces(c.ids)}
      </div>`).join('');
  }

  /* ---------- Entraînement ---------- */
  const FAMILLES = [['toutes', 'Toutes'], ['analyser', 'Analyser'], ['croiser', 'Croiser'], ['reconnaitre', 'Reconnaître']];
  const Q = { filtre: 'toutes', serie: [], i: 0, justes: 0, repondu: false };

  function lancerSerie() {
    const base = Q.filtre === 'toutes' ? C.quiz : C.quiz.filter(q => q.fam === Q.filtre);
    Q.serie = L.melanger(base);
    Q.i = 0; Q.justes = 0; Q.repondu = false;
    rendreQuestion();
  }

  function enteteQuiz(compteur) {
    return `<div class="qhead"><h2 id="t-qz">S'entraîner</h2><span class="qcount">${compteur}</span></div>
      <div class="filters" role="group" aria-label="Type de questions">${FAMILLES.map(([k, l]) =>
        `<button type="button" data-filtre="${k}" aria-pressed="${Q.filtre === k}">${l}</button>`).join('')}</div>`;
  }

  function rendreQuestion() {
    const box = $('#quiz'), n = Q.serie.length;
    if (Q.i >= n) {
      box.innerHTML = enteteQuiz(`${n} / ${n}`) +
        `<p class="score">${Q.justes} / ${n}</p><p class="fb">${Q.justes === n ? 'Sans faute.' : 'Relisez les fiches des notions manquées, puis recommencez : les questions reviennent dans un autre ordre.'}</p>
         <div class="row"><button type="button" class="btn pri" id="restart">Recommencer</button></div>`;
      return;
    }
    const q = Q.serie[Q.i];
    box.innerHTML = enteteQuiz(`${Q.i + 1} / ${n} · ${Q.justes} juste${Q.justes > 1 ? 's' : ''}`) +
      (q.t ? `<p class="qtext">${marque(q.t, 'u')}</p>` : '') +
      `<p class="qask">${txt(q.q)}</p>
       <div class="opts">${q.o.map((o, k) => `<button type="button" class="opt" data-k="${k}">${txt(o)}</button>`).join('')}</div>
       <p class="fb" id="fb" hidden></p>
       <div class="row" id="qnav" hidden><button type="button" class="btn pri" id="next">${Q.i + 1 === n ? 'Voir le score' : 'Question suivante'}</button><button type="button" class="linkbtn" data-ouvrir="${q.see}">Ouvrir la fiche</button></div>`;
  }

  function repondre(k) {
    if (Q.repondu) return;
    Q.repondu = true;
    const q = Q.serie[Q.i], ok = k === q.r;
    if (ok) Q.justes++;
    document.querySelectorAll('#quiz .opt').forEach(b => {
      b.disabled = true;
      const j = +b.dataset.k;
      if (j === q.r) b.classList.add('ok');
      else if (j === k) b.classList.add('ko');
    });
    const fb = $('#fb');
    fb.innerHTML = `<b class="${ok ? 'ok' : 'ko'}">${ok ? 'Juste.' : 'Pas tout à fait.'}</b> ${txt(q.e)}`;
    fb.hidden = false;
    $('#qnav').hidden = false;
    $('#next').focus();
  }

  $('#quiz').addEventListener('click', e => {
    const f = e.target.closest('[data-filtre]');
    if (f) { Q.filtre = f.dataset.filtre; lancerSerie(); return; }
    const o = e.target.closest('.opt');
    if (o) { repondre(+o.dataset.k); return; }
    if (e.target.closest('#next')) { Q.i++; Q.repondu = false; rendreQuestion(); return; }
    if (e.target.closest('#restart')) lancerSerie();
  });

  /* ---------- Démarrage ---------- */
  lancerSerie();
  rendreFiches();
  rendreConfusions();
  $('#rev').addEventListener('click', basculerRevision);
  $('#fiches').addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (card && !e.target.closest('[data-ouvrir]')) reveler(card);
  });
  $('#fiches').addEventListener('keydown', e => {
    const card = e.target.closest('.card');
    if (card && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); reveler(card); }
  });
  rendreCarte();
  chercher('');
  $('#q').addEventListener('input', e => chercher(e.target.value));
  $('#q').addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const premier = BR.flatMap(b => b.items).find(n => L.correspond(n, e.target.value));
    if (premier) ouvrir(premier.id, true);
  });
  ouvrir(index('phrase-simple-complexe') ? 'phrase-simple-complexe' : BR[0].items[0].id);
  requestAnimationFrame(tracerLiens);
  window.addEventListener('resize', () => requestAnimationFrame(tracerLiens));
  if (document.fonts) document.fonts.ready.then(tracerLiens);

  window.APP = { ouvrir, index, BR, txt, marque, enClair, TOTAL };
})();
