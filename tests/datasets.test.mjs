import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createQuiz } from '../dist/quiz.js';

test('all three sets support independent rounds with distinct bilingual choices', () => {
  const sets = ['bones', 'muscles', 'directions'].map(name => JSON.parse(readFileSync(new URL(`../dist/${name}.json`, import.meta.url))));
  assert.deepEqual(sets.map(set => set.length), [100, 15, 21]);
  for (const set of sets) {
    const quiz = createQuiz(set);
    let count = 0;
    while (quiz.question()) {
      const question = quiz.question();
      assert.equal(new Set(question.options.map(item => item.cs)).size, 4);
      assert.equal(new Set(question.options.map(item => item.la)).size, 4);
      assert.equal(question.language, count % 2 ? 'la' : 'cs');
      quiz.answer(question.bone.id);
      count++;
      quiz.next();
    }
    assert.equal(quiz.score().correct, set.length);
    assert.equal(createQuiz(set).score().total, 0);
  }
});
