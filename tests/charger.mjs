// Charge data/*.js puis lib.js dans un même contexte, comme le fait la page.
import { readFileSync, readdirSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

const racine = new URL('..', import.meta.url);

export async function charger() {
  const ctx = createContext({ window: {} });
  runInContext('var CARTE, LIB;', ctx);
  const fichiers = readdirSync(new URL('data/', racine)).filter(f => f.endsWith('.js')).sort();
  for (const f of fichiers) {
    runInContext(readFileSync(new URL('data/' + f, racine), 'utf8'), ctx, { filename: f });
    if (f === '00-carte.js') runInContext('CARTE = window.CARTE;', ctx);
  }
  runInContext(readFileSync(new URL('lib.js', racine), 'utf8'), ctx, { filename: 'lib.js' });
  return { CARTE: ctx.window.CARTE, LIB: ctx.window.LIB };
}
