# Somatologie

Web: https://mpeterka.github.io/somatologie/

Repozitář: https://github.com/mpeterka/somatologie

Statická aplikace s WebGL kostrou a kvízem 100 zvýraznitelných kostí (33 základních názvů). České a latinské otázky se střídají; správná odpověď znamená jeden bod. Průchod nemá opakované konkrétní kosti. Názvy jsou zjednodušené bez stran a čísel: Obratel / Vertebra, Žebro / Costa atd. Stejný základní název se tedy může v průchodu opakovat na jiné kosti. V jedné otázce jsou vždy čtyři různé možnosti.

## Spuštění

Vyžaduje Node.js 22. V PowerShellu:

```powershell
Set-Location W:/mpeterka/somatologie
npm ci
npm run dev
```

Otevřít http://127.0.0.1:4173. Distribuce `dist/` obsahuje všechny potřebné soubory; lze ji hostovat na běžném statickém serveru. Samotné otevření index.html přes file:// nefunguje kvůli načítání modulů a modelu.

## Ověření a aktualizace

```powershell
npm test
npm run validate
```

Po změně verze Three.js: `npm run prepare:vendor`. Sadu kostí generuje `node scripts/create-bones.mjs`; po úpravě názvů nebo mapování vždy spustit validátor. Zdrojem identity modelu jsou `extras.za_name`, včetně skupin složených z více meshů. Sdílená geometrie neznačí totožnou kost.

## Model a licence

GLB: https://github.com/nqwrc/3d-anatomy/blob/master/public/models/skeletal.glb . Model stažen 2026-10-06. Geometrie beze změn, pouze materiály a viditelnost za běhu. Z celé upstream sady používáme pouze kostru, nikoli orgány s dalšími licenčními omezeními. Původní licence a oznámení zachovány v dist/models/.

BodyParts3D - The Database Center for Life Science - CC-BY-SA 2.1 Japan

Z-Anatomy - The open source atlas of anatomy - CC-BY-SA 4.0

Podrobnosti, zdroje názvosloví a odkazy na licence v `dist/attribution.html`. Three.js MIT, Draco Apache 2.0. Neobsahuje vlastní serverovou databázi ani historii výsledků. Vyžaduje WebGL 2.

## Výběr kostí

19 hlava, 26 páteř, 25 hrudník, 14 horní končetiny, 16 dolní končetiny. Párové kosti a jednotlivé obratle a žebra se počítají samostatně. Hrudní kost je otázka s třemi zvýrazněnými částmi modelu.

## Publikování

GitHub Actions po pushi na větev `somatologie` spustí testy a ověření dat a nasadí adresář `dist` na GitHub Pages. V nastavení Pages musí být zdroj GitHub Actions. Závislosti jsou již dodané v dist/vendor, nasazení nepoužívá externí CDN. Odkazy a URL assetů jsou relativní, aby web fungoval pod `/somatologie/`.
