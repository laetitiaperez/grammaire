// Annexe du guide, tableaux 1 et 2 (p. 185-200) : [nature, fonction].
(function () {
  const P = ['pronom-personnel', 'pronom-demonstratif', 'pronom-possessif', 'pronom-indefini', 'pronom-interrogatif', 'pronom-relatif'];
  const t = {
    'sujet': ['groupe-nominal', ...P, 'infinitif', 'completive-conjonctive', 'relative-substantive', 'interrogative-partielle'],
    'cod': ['groupe-nominal', ...P, 'infinitif', 'completive-conjonctive', 'relative-substantive', 'interrogative-totale', 'interrogative-partielle', 'infinitive'],
    'coi': ['preposition', ...P, 'pronom-adverbial', 'infinitif', 'completive-conjonctive', 'relative-substantive', 'interrogative-totale', 'interrogative-partielle'],
    'complement-agent': ['preposition', 'pronom-relatif'],
    'complement-verbe-impersonnel': ['infinitif', 'completive-conjonctive'],
    'attribut-sujet': ['adjectif', 'groupe-nominal', 'preposition', ...P, 'infinitif', 'completive-conjonctive', 'relative-substantive', 'interrogative-partielle'],
    'attribut-cod': ['adjectif', 'groupe-nominal', 'preposition', 'relative-adjective'],
    'complement-circonstanciel': ['preposition', 'gerondif', 'groupe-nominal', 'adverbe', 'pronom-adverbial', 'circonstancielle', 'participiale'],
    'complement-nom': ['preposition', 'completive-conjonctive', 'relative-substantive'],
    'epithete': ['adjectif', 'groupe-nominal', 'relative-adjective'],
    'complement-adjectif': ['preposition', 'adverbe'],
    'apposition': ['adjectif', 'groupe-nominal', 'relative-adjective'],
    'fonctions-enonciatives': ['adverbe']
  };
  for (const f in t) for (const n of t[f]) CARTE.nf.push([n, f]);
})();
