import { createQuiz } from './quiz.js';
import { createViewer } from './viewer.js';
const $ = id => document.getElementById(id);
let quiz, viewer, bones, lastBoneId, failed = false;
const toolIds = ['focus', 'reset-view', 'back-view', 'ghost'];
function showError(message) {
  failed = true;
  $('loading').hidden = false;
  $('loading').classList.add('error');
  $('loading').querySelector('strong').textContent = 'Kostru se nepodařilo zobrazit';
  $('loading').querySelector('span:last-child').textContent = message;
  $('progress-label').textContent = 'Procvičování není dostupné';
  $('question-title').textContent = 'Obnov stránku a zkus to znovu.';
  $('question-help').textContent = 'Pro procvičování musí být 3D kostra načtená.';
  $('options').replaceChildren(); $('feedback').textContent = ''; $('next').hidden = true;
  for (const id of [...toolIds, 'restart']) $(id).disabled = true;
}
function updateScore() {
  const {correct, total, percent} = quiz.score();
  $('correct').textContent = correct;
  $('total').textContent = total;
  $('percent').replaceChildren(document.createTextNode(percent), Object.assign(document.createElement('span'), {textContent: '%'}));
  $('score-description').textContent = total ? `${total - correct} ${total - correct === 1 ? 'chyba' : total - correct < 5 && total - correct > 1 ? 'chyby' : 'chyb'}` : 'Zatím bez odpovědi';
  $('progress-fill').style.width = `${total / bones.length * 100}%`;
  document.querySelector('[role=progressbar]').setAttribute('aria-valuenow', total / bones.length * 100);
}
function render() {
  if (failed) return;
  updateScore();
  const question = quiz.question();
  $('options').replaceChildren();
  $('feedback').replaceChildren();
  $('feedback').className = 'feedback';
  $('next').hidden = true;
  if (!question) {
    viewer.highlight([]);
    $('question-title').textContent = 'Průchod dokončený.';
    $('question-help').textContent = 'Všech 100 kostí máš za sebou.';
    $('progress-label').textContent = `${bones.length} z ${bones.length} kostí`;
    $('language').textContent = 'Hotovo';
    $('focus').disabled = true;
    const summary = document.createElement('div'); summary.className = 'finished';
    const result = document.createElement('strong'); result.textContent = `${quiz.score().percent} %`;
    const text = document.createElement('p'); text.textContent = `Správně ${quiz.score().correct} ze ${bones.length}. Dalším průchodem si názvy upevníš.`;
    summary.append(result, text); $('options').append(summary);
    $('next').hidden = false; $('next').textContent = 'Nový průchod';
    return;
  }
  $('progress-label').textContent = `Otázka ${quiz.score().total + (question.answered ? 0 : 1)} ze ${bones.length}`;
  $('language').textContent = question.language === 'cs' ? 'Česky' : 'Latinsky';
  $('language').classList.toggle('latin', question.language === 'la');
  $('question-help').textContent = question.language === 'cs' ? 'Vyber její český název.' : 'Vyber její latinský název.';
  $('focus').disabled = false;
  if (lastBoneId !== question.bone.id) {
    viewer.highlight(question.bone.meshIds);
    viewer.resetView();
    lastBoneId = question.bone.id;
  }
  question.options.forEach((bone, index) => {
    const button = document.createElement('button'); button.className = 'option';
    const letter = document.createElement('span'); letter.className = 'letter'; letter.textContent = 'ABCD'[index]; letter.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span'); label.className = 'answer-label'; label.textContent = bone[question.language];
    button.append(letter, label); button.disabled = question.answered;
    if (question.answered && bone.id === question.bone.id) {
      button.classList.add('right');
      const mark = document.createElement('span'); mark.className = 'mark'; mark.textContent = '✓'; mark.setAttribute('aria-hidden', 'true'); button.append(mark);
    } else if (question.answered && bone.id === question.selectedId) {
      button.classList.add('wrong');
      const mark = document.createElement('span'); mark.className = 'mark'; mark.textContent = '×'; mark.setAttribute('aria-hidden', 'true'); button.append(mark);
    }
    button.addEventListener('click', () => {
      if (quiz.answer(bone.id) === null) return;
      render(); $('next').focus({preventScroll: true});
    });
    $('options').append(button);
  });
  if (question.answered) {
    const right = question.selectedId === question.bone.id;
    $('feedback').classList.add(right ? 'correct' : 'incorrect');
    const title = document.createElement('strong'); title.textContent = right ? 'Správně!' : 'Tentokrát ne. Správná odpověď:';
    const translation = document.createElement('span'); translation.className = 'translation'; translation.textContent = `${question.bone.cs} — ${question.bone.la}`;
    $('feedback').append(title, translation);
    $('next').hidden = false;
    $('next').textContent = quiz.score().total === bones.length ? 'Zobrazit výsledek →' : 'Další kost →';
  }
}
$('next').addEventListener('click', () => {
  if (failed) return;
  if (!quiz.question()) { quiz.restart(); lastBoneId = null; $('question-title').innerHTML = 'Která kost je <br>zvýrazněná?'; }
  else quiz.next();
  render(); $('options').querySelector('button')?.focus({preventScroll: true});
});
$('restart').addEventListener('click', () => {
  if (!quiz || failed) return;
  quiz.restart(); lastBoneId = null; $('question-title').innerHTML = 'Která kost je <br>zvýrazněná?'; render();
});
$('focus').addEventListener('click', () => viewer.focus(quiz.question().bone.meshIds));
$('reset-view').addEventListener('click', () => viewer.resetView());
$('back-view').addEventListener('click', () => viewer.turnBack());
$('ghost').addEventListener('click', () => {
  const enabled = $('ghost').getAttribute('aria-pressed') !== 'true';
  $('ghost').setAttribute('aria-pressed', enabled); viewer.isolate(enabled);
});
$('viewer').addEventListener('viewererror', event => showError(event.detail));
async function start() {
  try {
    const response = await fetch(new URL('./bones.json', import.meta.url));
    if (!response.ok) throw new Error('Seznam kostí se nepodařilo načíst.');
    bones = await response.json(); quiz = createQuiz(bones);
    viewer = await createViewer($('viewer'), new URL('./models/skeletal.glb', import.meta.url).href);
    viewer.validate(bones);
    if (failed) return;
    $('loading').hidden = true;
    $('bone-count').textContent = `${bones.length} kostí`;
    for (const id of [...toolIds, 'restart']) $(id).disabled = false;
    render();
  } catch (error) {
    console.error(error);
    showError('Zkontroluj připojení a obnov stránku. Prohlížeč musí podporovat WebGL 2. Pokud chyba trvá, zkus aktuální Chrome, Edge nebo Firefox.');
  }
}
start();
window.addEventListener('pagehide', event => { if (!event.persisted) viewer?.dispose(); });
