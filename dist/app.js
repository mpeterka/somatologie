import { createQuiz } from './quiz.js';
import { createViewer } from './viewer.js';
import { createDiagramViewer } from './diagrams.js';
const $ = id => document.getElementById(id);
let quiz, viewer, bones, lastBoneId, failed = false, config, generation = 0;
const quizzes = {
  bones: {title: 'Anatomická kostra', question: 'Která kost je zvýrazněná?', model: 'skeletal'},
  muscles: {title: 'Základní svaly', question: 'Který sval je zvýrazněný?', model: 'muscular'},
  directions: {title: 'Roviny a směry', question: 'Co znázorňuje obrázek?'}
};
const toolIds = ['focus', 'reset-view', 'back-view', 'ghost'];
function showError(message) {
  failed = true;
  $('loading').hidden = false;
  $('loading').classList.add('error');
  $('loading').querySelector('strong').textContent = 'Kvíz se nepodařilo načíst';
  $('loading').querySelector('span:last-child').textContent = message;
  $('progress-label').textContent = 'Procvičování není dostupné';
  $('question-title').textContent = 'Vrať se k výběru a zkus to znovu.';
  $('question-help').textContent = 'Pro procvičování musí být data a obrázek načtené.';
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
    $('question-help').textContent = `Všech ${bones.length} otázek máš za sebou.`;
    $('progress-label').textContent = `${bones.length} z ${bones.length} otázek`;
    $('language').textContent = 'Hotovo';
    $('focus').disabled = true;
    const summary = document.createElement('div'); summary.className = 'finished';
    const result = document.createElement('strong'); result.textContent = `${quiz.score().percent} %`;
    const text = document.createElement('p'); text.textContent = `Správně ${quiz.score().correct} ze ${bones.length}. Dalším průchodem si názvy upevníš.`;
    summary.append(result, text); $('options').append(summary);
    $('next').hidden = false; $('next').textContent = 'Nový průchod';
    return;
  }
  $('question-title').textContent = config.question;
  $('progress-label').textContent = `Otázka ${quiz.score().total + (question.answered ? 0 : 1)} ze ${bones.length}`;
  $('language').textContent = question.language === 'cs' ? 'Česky' : 'Latinsky';
  $('language').classList.toggle('latin', question.language === 'la');
  $('question-help').textContent = question.language === 'cs' ? 'Vyber český název.' : 'Vyber latinský název.';
  $('focus').disabled = false;
  if (lastBoneId !== question.bone.id) {
    if (config.model) viewer.highlight(question.bone.meshIds);
    else viewer.show(question.bone);
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
    if (question.bone.explanation) {
      const explanation = document.createElement('span'); explanation.className = 'translation';
      explanation.textContent = question.bone.explanation; $('feedback').append(explanation);
    }
    $('next').hidden = false;
    $('next').textContent = quiz.score().total === bones.length ? 'Zobrazit výsledek →' : 'Další otázka →';
  }
}
$('next').addEventListener('click', () => {
  if (failed) return;
  if (!quiz.question()) { quiz.restart(); lastBoneId = null; }
  else quiz.next();
  render(); $('options').querySelector('button')?.focus({preventScroll: true});
});
$('restart').addEventListener('click', () => {
  if (!quiz || failed) return;
  quiz.restart(); lastBoneId = null; render();
});
$('focus').addEventListener('click', () => viewer.focus(quiz.question().bone.meshIds));
$('reset-view').addEventListener('click', () => viewer.resetView());
$('back-view').addEventListener('click', () => viewer.turnBack());
$('ghost').addEventListener('click', () => {
  const enabled = $('ghost').getAttribute('aria-pressed') !== 'true';
  $('ghost').setAttribute('aria-pressed', enabled); viewer.isolate(enabled);
});
$('viewer').addEventListener('viewererror', event => showError(event.detail));
function menu() {
  generation++; viewer?.dispose(); viewer = null; quiz = null;
  $('workspace').hidden = true; $('quiz-menu').hidden = false;
  $('restart').hidden = true; $('choose-quiz').hidden = true;
  $('viewer').replaceChildren();
  window.scrollTo(0, 0);
  document.querySelector('[data-quiz]')?.focus({preventScroll: true});
}
$('choose-quiz').addEventListener('click', menu);
document.querySelectorAll('[data-quiz]').forEach(button => button.addEventListener('click', () => start(button.dataset.quiz)));
async function start(type) {
  const current = ++generation;
  config = quizzes[type]; failed = false; lastBoneId = null;
  $('quiz-menu').hidden = true; $('workspace').hidden = false;
  $('restart').hidden = false; $('choose-quiz').hidden = false;
  $('model-title').textContent = config.title;
  $('bone-count').textContent = 'Připravuji…';
  $('loading').hidden = false; $('loading').classList.remove('error');
  $('loading').querySelector('strong').textContent = config.model ? 'Načítám 3D model' : 'Načítám obrázky';
  $('loading').querySelector('span:last-child').textContent = 'Chvilku strpení, připravujeme první otázku.';
  $('question-title').textContent = config.question;
  $('question-help').textContent = 'Připravujeme první otázku.';
  $('options').replaceChildren(); $('feedback').replaceChildren(); $('next').hidden = true;
  $('correct').textContent = '0'; $('total').textContent = '0'; $('percent').textContent = '0%';
  $('score-description').textContent = 'Zatím bez odpovědi'; $('progress-label').textContent = 'Připravuji kvíz';
  $('language').textContent = 'Česky'; $('language').classList.remove('latin');
  $('progress-fill').style.width = '0%'; document.querySelector('[role=progressbar]').setAttribute('aria-valuenow', 0);
  for (const id of [...toolIds, 'restart']) $(id).disabled = true;
  $('ghost').setAttribute('aria-pressed', 'false');
  document.querySelector('.model-tools').hidden = !config.model;
  $('viewer').classList.toggle('diagram-viewer', !config.model);
  $('model-help').textContent = config.model ? 'Tažením otáčej · kolečkem nebo dvěma prsty přibližuj. Strany jsou z pohledu těla.' : 'Zlatá značka vyznačuje hledanou rovinu nebo směr. Strany jsou z pohledu zobrazeného těla.';
  $('focus').querySelector('span').textContent = 'Přiblížit'; $('focus').title = 'Přiblížit zvýrazněnou část';
  $('reset-view').querySelector('span').textContent = 'Celé tělo'; $('reset-view').title = 'Zobrazit celé tělo';
  $('ghost').title = 'Ztlumit ostatní části modelu';
  $('choose-quiz').focus({preventScroll: true});
  window.scrollTo(0, 0);
  try {
    const response = await fetch(new URL(`./${type}.json`, import.meta.url));
    if (!response.ok) throw new Error('Data kvízu se nepodařilo načíst.');
    const data = await response.json();
    if (current !== generation) return;
    bones = data; quiz = createQuiz(bones);
    const loaded = config.model ? await createViewer($('viewer'), new URL(`./models/${config.model}.glb`, import.meta.url).href, type === 'muscles') : createDiagramViewer($('viewer'));
    if (current !== generation) { loaded.dispose(); return; }
    viewer = loaded;
    if (config.model) viewer.validate(bones);
    if (failed) return;
    $('loading').hidden = true;
    $('bone-count').textContent = `${bones.length} otázek`;
    for (const id of [...toolIds, 'restart']) $(id).disabled = false;
    render();
  } catch (error) {
    if (current !== generation) return;
    console.error(error);
    viewer?.dispose(); viewer = null;
    showError('Zkontroluj připojení. 3D model vyžaduje WebGL 2 a aktuální prohlížeč. Kvíz rovin a směrů funguje také bez WebGL.');
  }
}
window.addEventListener('pagehide', event => { if (!event.persisted) viewer?.dispose(); });
