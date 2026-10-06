# Somatologie

**[Spustit aplikaci](https://mpeterka.github.io/somatologie/)**

[Repozitář na GitHubu](https://github.com/mpeterka/somatologie)

Statická aplikace se třemi kvízy, které vybíráš na úvodní obrazovce:

- **Kosti:** WebGL kostra, 100 zvýraznitelných kostí a 33 základních názvů bez stran a čísel (Obratel / Vertebra, Žebro / Costa).
- **Svaly:** WebGL svalový model a 15 základních svalů. Hlavy, části a obě strany jednoho svalu se zvýrazňují společně.
- **Roviny a směry:** 3 roviny a 18 směrů na původních SVG schématech, včetně cranialis, profundus, fibularis a medialis. Funguje i bez WebGL.

Čeština a latina se střídají; správná odpověď znamená jeden bod. V otázce jsou čtyři různé možnosti. Každou otázku potkáš v průchodu jednou, stejný základní název kosti může patřit více otázkám. Po odpovědi se zobrazí oba názvy; směry mají také vysvětlení. Nově vybraný kvíz začíná s nulovým skóre.

## Spuštění

Vyžaduje Node.js 22 (viz `.nvmrc`). Po naklonování přejdi do složky projektu:

```powershell
Set-Location somatologie
npm ci
npm run dev
```

Otevřít http://127.0.0.1:4173. Distribuce `dist/` obsahuje všechny potřebné soubory; lze ji hostovat na běžném statickém serveru. Samotné otevření index.html přes file:// nefunguje kvůli načítání modulů a modelu.

## Ovládání

- Otáčej kostrou tažením myši nebo prstu. Přibližuj kolečkem nebo dvěma prsty.
- „Přiblížit“ zaměří zvýrazněnou část, „Celé tělo“ obnoví celkový pohled.
- Vyber jednu ze čtyř možností. Po odpovědi uvidíš český i latinský název.
- „Další otázka“ pokračuje; „Začít znovu“ vynuluje skóre. „Výběr kvízu“ vrátí nabídku.

Skóre se uchovává pouze během otevření stránky. Po obnovení se vynuluje.

## Struktura projektu

| Umístění | Účel |
| --- | --- |
| `dist/` | Zdroj a distribuce statického webu |
| `dist/bones.json` | Generovaná sada 100 zvýraznitelných kostí |
| `dist/muscles.json`, `dist/directions.json` | Generované sady svalů a rovin/směrů |
| `dist/diagrams.js` | Původní anatomická SVG schémata |
| `dist/models/` | Anatomický GLB a původní licence |
| `dist/vendor/` | Lokální Three.js a Draco dekodér |
| `scripts/` | Vývojový server, generování a kontrola assetů |
| `tests/` | Testy pravidel kvízu a identity modelu |
| `.github/workflows/pages.yml` | Testy a publikování na GitHub Pages |

Pokyny pro další úpravy: [CONTRIBUTING.md](CONTRIBUTING.md).
Pravidla pro agenty: [AGENTS.md](AGENTS.md).

## Ověření a aktualizace

```powershell
npm test
npm run validate
```

Po změně verze Three.js: `npm run prepare:vendor`. Kosti generuje `node scripts/create-bones.mjs`, svaly a směry `node scripts/create-extra-quizzes.mjs`. Po úpravě názvů nebo mapování spustit validátor. Zdrojem identity modelu jsou `extras.za_name`, včetně skupin složených z více meshů. Sdílená geometrie neznačí totožnou část těla.

## Model a licence

GLB: [skeletal.glb](https://github.com/nqwrc/3d-anatomy/blob/master/public/models/skeletal.glb) a [muscular.glb](https://github.com/nqwrc/3d-anatomy/blob/master/public/models/muscular.glb). Staženo 2026-10-06. Geometrie beze změn, pouze materiály a viditelnost za běhu. Používáme kostru a svalstvo, nikoli orgány s dalšími licenčními omezeními. Původní licence a oznámení zachovány v dist/models/.

BodyParts3D - The Database Center for Life Science - CC-BY-SA 2.1 Japan

Z-Anatomy - The open source atlas of anatomy - CC-BY-SA 4.0

Podrobnosti, zdroje názvosloví a odkazy na licence v `dist/attribution.html`. Three.js MIT, Draco Apache 2.0. Neobsahuje vlastní serverovou databázi ani historii výsledků. Vyžaduje WebGL 2.

## Výběr kostí

19 hlava, 26 páteř, 25 hrudník, 14 horní končetiny, 16 dolní končetiny. Párové kosti a jednotlivé obratle a žebra se počítají samostatně. Hrudní kost je otázka s třemi zvýrazněnými částmi modelu.

## Publikování

GitHub Actions po pushi na větev `main` spustí testy a ověření dat a nasadí adresář `dist` na GitHub Pages. V nastavení Pages musí být zdroj GitHub Actions. Závislosti jsou již dodané v dist/vendor, nasazení nepoužívá externí CDN. Odkazy a URL assetů jsou relativní, aby web fungoval pod `/somatologie/`.

Na iPadu používat Safari na iPadOS 16.4 nebo novějším (WebGL 2 a import maps). Otáčení tažením, zoom gestem dvou prstů, odpovědi klepnutím. Rozložení ověřeno na mobilním a tabletovém viewportu, nikoli na fyzickém iPadu.
