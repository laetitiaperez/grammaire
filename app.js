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

  /* ---------- Démarrage ---------- */
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
