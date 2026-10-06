export function createQuiz(bones, random = Math.random) {
  if (!Array.isArray(bones) || bones.length < 4 || ['id', 'cs', 'la'].some(field =>
    bones.some(b => typeof b[field] !== 'string' || !b[field].trim()) ||
    new Set(bones.map(b => b[field])).size < (field === 'id' ? bones.length : 4)
  )) throw new Error('Kvíz potřebuje alespoň čtyři odlišné názvy a jedinečná ID kostí.');
  const translations = new Map(), reverse = new Map();
  for (const bone of bones) {
    if ((translations.has(bone.cs) && translations.get(bone.cs) !== bone.la) ||
      (reverse.has(bone.la) && reverse.get(bone.la) !== bone.cs)) throw new Error('Názvy kostí musí mít jednoznačný překlad.');
    translations.set(bone.cs, bone.la); reverse.set(bone.la, bone.cs);
  }
  const shuffle = items => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  let deck, index, correct, total, current;
  function prepare() {
    if (index >= deck.length) { current = null; return; }
    const bone = deck[index];
    const same = shuffle(bones.filter(b => b.cs !== bone.cs && b.region === bone.region));
    const other = shuffle(bones.filter(b => b.cs !== bone.cs && b.region !== bone.region));
    const names = new Set([bone.cs]);
    const options = [bone];
    for (const candidate of [...same, ...other]) {
      if (!names.has(candidate.cs)) { names.add(candidate.cs); options.push(candidate); }
      if (options.length === 4) break;
    }
    current = {bone, language: index % 2 ? 'la' : 'cs', options: shuffle(options), answered: false, selectedId: null};
  }
  function restart() { deck = shuffle(bones); index = 0; correct = 0; total = 0; prepare(); }
  restart();
  return {
    question: () => current ? {...current, options: [...current.options]} : null,
    answer(id) {
      if (!current || current.answered || !current.options.some(b => b.id === id)) return null;
      current.answered = true;
      current.selectedId = id;
      total++;
      const right = current.bone.id === id;
      if (right) correct++;
      return right;
    },
    next() { if (!current?.answered) return false; index++; prepare(); return true; },
    restart,
    score: () => ({correct, total, percent: total ? Math.round(correct / total * 100) : 0})
  };
}
