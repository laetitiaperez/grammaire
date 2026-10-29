import { test } from 'node:test';
import assert from 'node:assert/strict';
import { charger } from './charger.mjs';

const { CARTE } = await charger();
const notions = CARTE.branches.flatMap(b => b.items.map(n => ({ ...n, branche: b.id })));
const ids = new Set(notions.map(n => n.id));
const ORDRE = ['phrase', 'subordonnees', 'fonctions', 'lexique', 'nom', 'verbe', 'invariables'];
const INTERDITS = ['adjectif possessif', 'adjectif démonstratif', 'complément de phrase', 'adjectif qualificatif'];
const fonctionsIds = new Set(notions.filter(n => n.branche === 'fonctions').map(n => n.id));
const vide = t => t.length === 0;

test('1. identifiants uniques et en kebab-case', () => {
  const vus = new Set();
  for (const n of notions) {
    assert.match(n.id, /^[a-z0-9-]+$/, n.id);
    assert.ok(!vus.has(n.id), `doublon : ${n.id}`);
    vus.add(n.id);
  }
});

test('2. sept branches, quatre à gauche et trois à droite', { skip: vide(CARTE.branches) && 'pas encore de branche' }, () => {
  assert.deepEqual([...CARTE.branches.map(b => b.id)].sort(), [...ORDRE].sort());
  for (const b of CARTE.branches) assert.equal(b.side, ORDRE.indexOf(b.id) < 4 ? 'L' : 'R', b.id);
});

test('3. chaque notion est complète', () => {
  for (const n of notions) {
    assert.ok(n.l && n.d, `${n.id} : l et d`);
    assert.ok(n.niv === 1 || n.niv === 2, `${n.id} : niv`);
    assert.ok(Array.isArray(n.ex) && n.ex.length > 0, `${n.id} : ex`);
    assert.ok(Array.isArray(n.rep) && n.rep.length > 0, `${n.id} : rep`);
    assert.ok(Array.isArray(n.p) && n.p.length > 0 && n.p.every(p => Number.isInteger(p) && p >= 11 && p <= 213), `${n.id} : p`);
  }
});

test('4. le niveau II n’est ni perdu ni dupliqué', () => {
  for (const n of notions) {
    if (n.niv === 2) assert.ok(!n.appro, `${n.id} : une notion II n’a pas de volet Approfondir`);
    if (n.niv === 1 && n.p.some(p => p >= 52)) assert.ok(n.appro && n.appro.d, `${n.id} : volet Approfondir attendu`);
  }
});

test('5. les [[ ]] des exemples sont bien fermés', () => {
  for (const n of notions) for (const e of n.ex) {
    const o = (e.t.match(/\[\[/g) || []).length, f = (e.t.match(/\]\]/g) || []).length;
    assert.equal(o, f, `${n.id} : ${e.t}`);
  }
});

test('6. entre 70 et 95 notions', { skip: vide(CARTE.branches) && 'pas encore de branche' }, () => {
  assert.ok(notions.length >= 70 && notions.length <= 95, `${notions.length} notions`);
});

test('7. tous les identifiants cités existent', { todo: notions.length < 70 && 'branches incomplètes' }, () => {
  const cites = [
    ...CARTE.sommaire.flatMap(s => s.ids), ...CARTE.nf.flat(),
    ...CARTE.confusions.flatMap(c => c.ids), ...CARTE.quiz.map(q => q.see)
  ];
  const manquants = [...new Set(cites.filter(id => !ids.has(id)))];
  assert.deepEqual(manquants, []);
});

test('8. chaque notion est citée par le sommaire', { skip: vide(CARTE.branches) && 'pas encore de branche' }, () => {
  const cites = new Set(CARTE.sommaire.flatMap(s => s.ids));
  assert.deepEqual(notions.filter(n => !cites.has(n.id)).map(n => n.id), []);
});

test('9. couples nature-fonction cohérents', { todo: notions.length < 70 && 'branches incomplètes' }, () => {
  const vus = new Set();
  for (const [nat, fct] of CARTE.nf) {
    assert.ok(fonctionsIds.has(fct), `${fct} n’est pas une fonction`);
    assert.ok(!fonctionsIds.has(nat), `${nat} est une fonction`);
    const k = nat + '>' + fct;
    assert.ok(!vus.has(k), `doublon ${k}`);
    vus.add(k);
  }
});

test('10. aucun terme interdit', () => {
  const textes = [
    ...notions.flatMap(n => [n.l, n.d, n.astuce || '', ...n.rep, ...n.ex.map(e => e.t + ' ' + (e.n || '')),
      n.appro ? n.appro.d + ' ' + (n.appro.pts || []).join(' ') : '']),
    ...CARTE.confusions.flatMap(c => [c.q, c.r]),
    ...CARTE.quiz.flatMap(q => [q.t || '', q.q, q.e, ...q.o])
  ].join('\n').toLowerCase();
  for (const t of INTERDITS) assert.ok(!textes.includes(t), `terme interdit : ${t}`);
});

test('11. entre 13 et 17 confusions', { skip: vide(CARTE.confusions) && 'pas encore de confusion' }, () => {
  assert.ok(CARTE.confusions.length >= 13 && CARTE.confusions.length <= 17, `${CARTE.confusions.length}`);
  for (const c of CARTE.confusions) assert.ok(c.q && c.r && c.ids.length > 0, c.q);
});

test('12. entre 35 et 45 questions bien formées', { skip: vide(CARTE.quiz) && 'pas encore de question' }, () => {
  assert.ok(CARTE.quiz.length >= 35 && CARTE.quiz.length <= 45, `${CARTE.quiz.length}`);
  assert.deepEqual([...new Set(CARTE.quiz.map(q => q.fam))].sort(), ['analyser', 'croiser', 'reconnaitre']);
  for (const q of CARTE.quiz) {
    assert.ok(Number.isInteger(q.r) && q.r >= 0 && q.r < q.o.length, q.q);
    assert.equal(new Set(q.o).size, q.o.length, `choix en double : ${q.q}`);
    assert.ok(q.e, `justification : ${q.q}`);
  }
});
