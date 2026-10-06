# Pokyny pro práci v repozitáři

## Projekt

Somatologie je statická česká aplikace pro poznávání kostí na 3D modelu.
Používá JavaScript ES modules, Three.js a WebGL 2. Nemá backend ani bundler.
Adresář `dist/` obsahuje udržovaný zdroj webu i distribuované soubory; není to
odstranitelný build output. GitHub Pages publikuje tento adresář z větve `main`.

## Struktura

- `dist/app.js`: rozhraní, události a propojení kvízu s modelem.
- `dist/quiz.js`: pravidla a stav kvízu bez DOM nebo Three.js.
- `dist/viewer.js`, `dist/model-utils.js`: vykreslení a identita kostí.
- `scripts/create-bones.mjs`: zdroj anatomické sady; generuje `dist/bones.json`.
- `scripts/validate-assets.mjs`: kontrola dat a jejich vazeb na GLB.
- `scripts/prepare-vendor.mjs`: kopírování instalované verze Three.js a Draco.
- `tests/`: testy přes vestavěný `node:test`.

## Pravidla změn

- Drž jednoduchou statickou architekturu. Nové závislosti přidávej pouze pro
  konkrétní potřebu, kterou stávající nástroje neřeší.
- Uživatelské texty piš česky, stručně a věcně. Zachovej ovládání klávesnicí,
  dotykové ovládání a responzivní rozložení.
- Data měň v generátoru, poté spusť `node scripts/create-bones.mjs`.
- Názvy jsou základní, bez čísel obratlů/žeber a bez stran. Opakované názvy
  jsou povolené; ID zvýraznitelných kostí musí zůstat jedinečná. Čtyři možnosti
  každé otázky musí mít různé názvy v obou jazycích.
- Identitu načtených částí modelu ber z `extras.za_name`, včetně nejbližší
  nadřazené skupiny. Párové kosti mohou sdílet geometrii; geometrie není ID.
- Canvas ponech absolutně umístěný uvnitř `.viewer`. Jeho pixelové rozměry
  nesmí měnit velikost kontejneru při otočení tabletu.
- Assety a odkazy musí fungovat pod `/somatologie/`; používej relativní URL.
- `dist/vendor/` neupravuj ručně ani nepřeformátovávej. Po změně Three.js
  aktualizuj lockfile a spusť `npm run prepare:vendor`.
- Zachovej licence a atribuce v `dist/models/`, `dist/vendor/` a
  `dist/attribution.html`. Nepřidávej model bez ověřeného práva distribuce.
- Pro změny knihoven/API ověř aktuální dokumentaci přes Context7 CLI:
  nejdřív `npx ctx7@latest library`, potom `npx ctx7@latest docs`.
- Necommituj přihlašovací údaje, lokální stav `.openai/`, `.superpowers/`
  ani `node_modules/`.

## Ověření

Používej Node.js 22. Pro změny logiky, dat nebo závislostí spusť:

```sh
npm test
npm run validate
```

Pro změny zobrazení ověř načtení kostry, jednu odpověď a skóre, další otázku,
restart, mobilní rozložení a opakované otočení tabletu. Ověření viewportu
nevydávej za test na fyzickém iPadu. Safari vyžaduje iPadOS 16.4 nebo novější.
Pro čistě dokumentační změny stačí kontrola obsahu a `git diff --check`.

Push na `main` automaticky spouští testy a nasazení Pages. Před tvrzením,
že je změna publikovaná, ověř úspěšné dokončení odpovídajícího workflow.
