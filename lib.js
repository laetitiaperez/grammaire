// Fonctions pures partagées par la page et les tests.
(function () {
  function norm(s) {
    return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’ʼ]/g, "'").toLowerCase();
  }

  function correspond(notion, requete) {
    const q = norm(requete).trim();
    if (!q) return true;
    return norm(notion.l + ' ' + notion.d + ' ' + (notion.s || '')).includes(q);
  }

  function naturesPour(nf, idFonction) {
    return nf.filter(c => c[1] === idFonction).map(c => c[0]);
  }

  function fonctionsPour(nf, idNature) {
    return nf.filter(c => c[0] === idNature).map(c => c[1]);
  }

  function melanger(tableau, alea = Math.random) {
    const t = tableau.slice();
    for (let i = t.length - 1; i > 0; i--) {
      const j = Math.floor(alea() * (i + 1));
      [t[i], t[j]] = [t[j], t[i]];
    }
    return t;
  }

  window.LIB = { norm, correspond, naturesPour, fonctionsPour, melanger };
})();
