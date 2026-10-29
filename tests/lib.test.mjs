import { test } from 'node:test';
import assert from 'node:assert/strict';
import { charger } from './charger.mjs';

const { LIB } = await charger();

test('norm enlève accents, majuscules et apostrophes typographiques', () => {
  assert.equal(LIB.norm('Épithète'), 'epithete');
  assert.equal(LIB.norm('COD'), 'cod');
  assert.equal(LIB.norm('l’adjectif'), "l'adjectif");
});

test('correspond cherche dans le titre, la définition et le sous-titre', () => {
  assert.equal(LIB.correspond({ l: 'Épithète', d: '' }, 'epithete'), true);
  assert.equal(LIB.correspond({ l: 'Sujet', d: 'x' }, 'cod'), false);
  assert.equal(LIB.correspond({ l: 'Sujet', d: 'x', s: 'Complément d’objet' }, "complement d'objet"), true);
  assert.equal(LIB.correspond({ l: 'Sujet', d: 'x' }, ''), true);
  assert.equal(LIB.correspond({ l: 'Sujet', d: 'x' }, '   '), true);
});

test('naturesPour et fonctionsPour lisent les couples dans l’ordre', () => {
  const nf = [['gn', 'sujet'], ['pronom', 'sujet'], ['gn', 'cod']];
  assert.deepEqual(LIB.naturesPour(nf, 'sujet'), ['gn', 'pronom']);
  assert.deepEqual(LIB.fonctionsPour(nf, 'gn'), ['sujet', 'cod']);
  assert.deepEqual(LIB.fonctionsPour(nf, 'inconnu'), []);
});

test('melanger rend une copie mélangée sans toucher l’original', () => {
  const t = [1, 2, 3, 4, 5];
  const suite = [0.1, 0.9, 0.3, 0.7];
  let i = 0;
  const r = LIB.melanger(t, () => suite[i++ % suite.length]);
  assert.deepEqual(t, [1, 2, 3, 4, 5]);
  assert.deepEqual([...r].sort(), [1, 2, 3, 4, 5]);
  assert.notDeepEqual(r, t);
});
