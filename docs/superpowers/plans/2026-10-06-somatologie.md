# Somatologie Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Zprovoznit webový kvíz přibližně 100 kostí s anatomickou 3D kostrou, střídáním češtiny a latiny a skóre.

**Architecture:** Statická aplikace v JavaScriptu. Samostatná data kostí, čistá logika kvízu a Three.js prohlížeč; DOM propojí odpovědi, skóre a zvýraznění. Anatomický GLB se načítá lokálně ze sestavení, bez externí služby za běhu.

**Tech Stack:** Three.js, WebGL, Node.js pro ověření, statické Sites hosting. Bez Reactu a serverové databáze.

**Spec:** ../specs/2026-10-06-somatologie-design.md

## Global Constraints
- České rozhraní, dobře čitelné názvy, světlé kosti na tmavém pozadí.
- První otázka česky, druhá latinsky; jazyky se dále pravidelně střídají.
- Každá otázka nabídne čtyři odlišné názvy a právě jednu správnou možnost.
- Skóre platí pro aktuální procvičování; ukládání historie není součástí této verze.
- Geometrická stylizace nesmí být vydávána za anatomicky přesný model.
- Projekt vznikne v W:/mpeterka/somatologie.
- Pro publikaci se použije Sites se soukromým přístupem podle výchozího nastavení služby.

## Review Focus
1. Sdílená geometrie nebo materiál párových kostí: zvýrazní se pouze požadovaná strana.
2. Vnořené části modelu: vazby zachovají světové transformace a neoznačí sousední kosti.
3. Opakovaná aktivace odpovědi: skóre se započte právě jednou.
4. Drobné nebo zezadu viditelné kosti: lze je přiblížit a otočit, bez prozrazení názvu.
5. Selhání modelu nebo WebGL: kvíz se nespustí s neviditelnou otázkou a zobrazí čitelnou chybu.

## Struktura souborů
- dist/index.html: české rozhraní a přístupné ovládání.
- dist/style.css: responzivní rozložení a vizuální stavy.
- dist/app.js: propojení obrazovky s kvízem a modelem.
- dist/quiz.js: stav a pravidla kvízu, bez DOM a Three.js.
- dist/viewer.js: načtení GLB, kamera, otáčení a zvýraznění.
- dist/bones.json: ID, cs, la, region, meshIds pro každou otázku.
- dist/models/skeletal.glb a License.txt: distribuovaný model a jeho licence.
- dist/vendor/: Three.js a lokální Draco dekodér, pokud jej GLB potřebuje.
- scripts/validate-assets.mjs: ověření GLB identity a mapování dat.
- tests/quiz.test.mjs: testy kvízu přes node:test.
- package.json: type module, test a kontrola dat; package-lock.json pro závislost Three.js.
- README.md a dist/attribution.html: spuštění, původ, licence a skutečný rozsah kostí.
- .openai/hosting.json: skutečné ID Sites a statický adresář dist.

### Task 1: Anatomický model a sada kostí
**Consumes:** Schválená specifikace.
**Produces:** bones.json s objekty `{id, cs, la, region, meshIds: string[]}` a lokální GLB; mapování používá extras.za_name.

- [ ] Ověřit licence přímo v https://github.com/nqwrc/3d-anatomy/blob/master/NOTICE a public/models/License.txt. Kandidát: public/models/skeletal.glb, cca 1,86 MB. Použít pouze kostru a zachovat upstream licence; nespoléhat na licenci celého atlasu jako náhradu kontroly modelu.
- [ ] Načíst GLB hlavičku a JSON chunk pomocí Node Buffer a zkontrolovat nodes[].extras.za_name, hierarchii a rozšíření pro kompresi. Před výběrem dat ověřit, že jde o samostatné kosti; nevkládat orgány ani značky úponů.
- [ ] Sestavit přibližně 100 záznamů ze skutečně dostupných částí: základní kosti lebky, páteř, žebra, hrudní kost, ramenní a pánevní pletenec, dlouhé kosti a vybrané kosti rukou a nohou. Počet přiznat podle finální sady. Český a latinský název ověřit proti anatomickému názvosloví; stranu a pořadí uvést v obou názvech.
- [ ] Napsat validátor: všechny ID a názvy jedinečné, cs/la neprázdné, každé meshIds existuje v GLB a patří pouze jedné zkoušené kosti. Selhání ukončí kontrolu s nenulovým návratovým kódem.

```js
import assert from 'node:assert/strict';
assert.ok(bones.length >= 90 && bones.length <= 110);
for (const field of ['id', 'cs', 'la']) {
  assert.equal(new Set(bones.map(b => b[field])).size, bones.length);
}
for (const bone of bones) {
  assert.ok(bone.meshIds.length > 0);
  for (const id of bone.meshIds) assert.ok(modelIds.has(id), id);
}
```

- [ ] Spustit `node scripts/validate-assets.mjs`; očekávat úspěch a skutečný počet kostí. Uložit zdroj a licenci do attribution.html a README. Pokud vhodný model chybí, oznámit konkrétní překážku.

### Task 2: Logika kvízu
**Consumes:** Pole kostí z Task 1.
**Produces:** `createQuiz(bones, random = Math.random)` vrací `{question(), answer(id), next(), restart(), score()}`. Otázka je `{bone, language, options, answered, selectedId}` nebo null po konci. Skóre je `{correct, total, percent}`. answer vrací boolean správnosti nebo null při opakování/neplatném ID. next vrací boolean přechodu a funguje pouze po odpovědi. restart resetuje a zamíchá průchod.

- [ ] Nejprve napsat testy čisté logiky. Například:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {createQuiz} from '../dist/quiz.js';
const bones = Array.from({length: 8}, (_, i) => ({
  id: `b${i}`, cs: `Kost ${i}`, la: `Os ${i}`, region: 'test', meshIds: [`m${i}`]
}));
test('odpověď lze započíst jednou a jazyk se střídá', () => {
  const q = createQuiz(bones, () => 0.5);
  assert.equal(q.question().language, 'cs');
  const id = q.question().bone.id;
  assert.equal(q.answer(id), true);
  assert.equal(q.answer(id), null);
  assert.deepEqual(q.score(), {correct: 1, total: 1, percent: 100});
  assert.equal(q.next(), true);
  assert.equal(q.question().language, 'la');
});
test('možnosti jsou odlišné a obsahují správnou odpověď', () => {
  const q = createQuiz(bones);
  const question = q.question();
  assert.equal(question.options.length, 4);
  assert.equal(new Set(question.options.map(b => b.id)).size, 4);
  assert.ok(question.options.some(b => b.id === question.bone.id));
});
```

- [ ] Spustit `node --test tests/quiz.test.mjs`; před implementací očekávat chybu chybějícího modulu.
- [ ] Implementovat Fisher–Yates shuffle, průchod bez opakování, volbu rušivých možností nejprve ve stejné oblasti a doplnění ze zbytku sady. Zablokovat odpovědi mimo options a další otázku před odpovědí. Pro procenta použít total ? Math.round(correct / total * 100) : 0.
- [ ] Přidat test chybné odpovědi, neplatného ID, next před odpovědí, dokončení všech osmi kostí bez opakování, restartu a vstupu s méně než čtyřmi odlišnými názvy (vyhodit chybu). Zopakovat testy, očekávat úspěch.

### Task 3: 3D prohlížeč a hotová obrazovka
**Consumes:** GLB, bones.json a createQuiz.
**Produces:** `createViewer(container, modelUrl)` je async a vrací `{highlight(meshIds), resetView(), focus(meshIds)}`. highlight vrací chybu pro neznámá ID; app při chybě zablokuje kvíz a zobrazí stav.

- [ ] Použít aktuální dokumentaci získanou přes Context7 /mrdoob/three.js; lokálně dodat Three.js a potřebné addons. Načíst GLTFLoader a OrbitControls, při komprimovaném GLB také DRACOLoader s lokálním dekodérem.
- [ ] Mapovat identity přes userData.za_name. Zachovat transformace při případném rozložení hierarchie. Zvýrazňovat pouze mapované meshe pomocí samostatného materiálu, ne mutací sdíleného materiálu. Zobrazit ostatní kostru neutrálně, vybranou kost kontrastně.

```js
const identity = object.userData.za_name;
if (object.isMesh && identity) {
  object.material = neutralMaterial;
  meshById.set(identity, object);
}
// Při změně otázky všechny dříve vybrané meshe vrátit na neutralMaterial,
// nové explicitně nastavit na highlightMaterial; geometrii ponechat.
```

- [ ] Kameru nastavit podle Box3 modelu. ResizeObserver aktualizuje canvas a aspect kamery; devicePixelRatio omezit na 2. Ovládání umožní otáčení, zoom, reset a zaměření zvýrazněné kosti. Velmi malé nebo zadní kosti musí být dostupné bez jmenné nápovědy.
- [ ] V index.html použít skutečná button pro možnosti, další otázku a restart, stav aria-live a čitelný údaj jazyka. Ve style.css vytvořit desktopovou dvojici model/kvíz a mobilní sloupec. app.js čeká na načtení modelu i ověření mapování před první otázkou.
- [ ] Po odpovědi zablokovat všechny možnosti, ukázat správnou možnost a oba názvy, aktualizovat skóre a povolit další otázku. Konec zobrazí výsledek a nový průchod. Načítání a WebGL chyby mají vlastní čitelný stav.
- [ ] V prohlížeči ověřit levou a pravou párovou kost samostatně, vnořenou kost, jednu drobnou kost, pohled zezadu, správnou a chybnou odpověď, klávesnici a mobilní šířku 390 px. Zkontrolovat konzoli a síť na chyby; simulovat chybějící model a ověřit, že nelze odpovídat.

### Task 4: Ověření a soukromé publikování
**Consumes:** Hotová dist, testy a atribuce.
**Produces:** Ověřená soukromá Sites URL a úplné lokální zdroje.

- [ ] Spustit `node --test tests/quiz.test.mjs` a `node scripts/validate-assets.mjs`. Ověřit distribuci vendor souborů, Draco a licencí.
- [ ] Dodržet Sites workflow z příslušného SKILL.md: existující .openai/hosting.json přečíst, nepřidávat duplicitní Site. Pro nové soukromé Site založit identitu jednou a ihned uložit skutečné project_id.
- [ ] Hosting manifest nastaví static.directory na dist. Sites helper zkomituje a pushne přesně ověřený zdroj a vytvoří archiv z téhož SHA. Credential předávat pouze přes stdin, nikdy do souboru nebo logu.
- [ ] Uložit a nasadit soukromou verzi; na neterminální stav čekat podle workflow. Otevřít skutečnou URL a předat odkaz, skutečný počet kostí, ověřené funkce a případná omezení.

## Kontrola plánu
Všechny části specifikace mají přiřazené úkoly: anatomie a licence 1, kvíz/skóre 2, model/responzivita/přístupnost/chyby 3, provoz a publikace 4. Rozhraní jsou uvedená u úkolů; není potřeba server ani účet uživatele. Výběr konkrétních kostí je navázaný na kontrolu skutečného GLB, aby plán nepředpokládal neexistující meshe.
