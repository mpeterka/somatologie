import test from 'node:test';
import assert from 'node:assert/strict';
import { createQuiz } from '../dist/quiz.js';
const bones = Array.from({length: 8}, (_, i) => ({id: `b${i}`, cs: `Kost ${i}`, la: `Os ${i}`, region: i < 4 ? 'a' : 'b', meshIds: [`m${i}`]}));

test('odpověď se započítá jednou a jazyky se střídají', () => {
  const q = createQuiz(bones, () => 0.5);
  assert.deepEqual(q.score(), {correct: 0, total: 0, percent: 0});
  assert.equal(q.question().language, 'cs');
  assert.equal(q.next(), false);
  assert.equal(q.answer('unknown'), null);
  assert.equal(q.answer(q.question().bone.id), true);
  assert.equal(q.answer(q.question().bone.id), null);
  assert.deepEqual(q.score(), {correct: 1, total: 1, percent: 100});
  assert.equal(q.next(), true);
  assert.equal(q.question().language, 'la');
});
test('celý průchod, unikátní možnosti, chyba, dokončení a restart', () => {
  const q = createQuiz(bones);
  const seen = new Set();
  for (let i = 0; i < bones.length; i++) {
    const question = q.question();
    assert.equal(question.language, i % 2 ? 'la' : 'cs');
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options.map(b => b[question.language])).size, 4);
    assert.ok(question.options.some(b => b.id === question.bone.id));
    assert.ok(!seen.has(question.bone.id));
    seen.add(question.bone.id);
    const choice = i === 0 ? question.options.find(b => b.id !== question.bone.id) : question.bone;
    assert.equal(q.answer(choice.id), i !== 0);
    q.next();
  }
  assert.equal(q.question(), null);
  assert.equal(q.answer('b0'), null);
  assert.equal(q.next(), false);
  assert.deepEqual(q.score(), {correct: 7, total: 8, percent: 88});
  q.restart();
  assert.equal(q.question().language, 'cs');
  assert.deepEqual(q.score(), {correct: 0, total: 0, percent: 0});
});
test('odmítne neplatnou sadu a neplatnou možnost', () => {
  assert.throws(() => createQuiz(bones.slice(0, 3)));
  assert.throws(() => createQuiz([...bones.slice(0, 4), bones[0]]));
  assert.throws(() => createQuiz(bones.map(b => ({...b, la: 'same'}))));
  const q = createQuiz(bones);
  const outside = bones.find(b => !q.question().options.some(o => o.id === b.id));
  assert.equal(q.answer(outside.id), null);
  assert.equal(q.score().total, 0);
});
test('opakované názvy obratlů a párových kostí nevytvoří duplicitní možnosti', () => {
  const simplified = [...bones, ...Array.from({length: 24}, (_, i) => ({id: `v${i}`, cs: 'Obratel', la: 'Vertebra', region: 'Páteř'}))];
  const q = createQuiz(simplified);
  let vertebraCount = 0;
  for (let i = 0; i < simplified.length; i++) {
    const question = q.question();
    if (question.bone.cs === 'Obratel') vertebraCount++;
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options.map(b => b.cs)).size, 4);
    assert.equal(new Set(question.options.map(b => b.la)).size, 4);
    assert.equal(q.answer(question.bone.id), true);
    q.next();
  }
  assert.equal(vertebraCount, 24);
  assert.equal(q.score().percent, 100);
});
