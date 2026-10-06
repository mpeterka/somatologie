# Příspěvky a úpravy

Nejdřív přečti [README.md](README.md) a [AGENTS.md](AGENTS.md).
Používej Node.js 22; `.nvmrc` určuje jeho hlavní verzi.

## Lokální práce

```sh
npm ci
npm run dev
```

Web běží na `http://127.0.0.1:4173`. Zdroj webu je přímo v `dist/`.
Nevyžaduje build. Změny názvosloví prováděj v `scripts/create-bones.mjs`
a potom vygeneruj `dist/bones.json`.
Svaly a směry mají generátor `scripts/create-extra-quizzes.mjs`.
Před nasazením vyzkoušej všechny tři režimy a návrat do úvodní nabídky.

## Před odesláním změn

- Změny logiky nebo dat ověř pomocí `npm test` a `npm run validate`.
- Změny rozhraní vyzkoušej v prohlížeči, na úzké obrazovce a při opakovaném
  otočení tabletového viewportu.
- Zkontroluj `git diff --check`; vendored soubory nepřeformátovávej.
- V popisu změny uveď účel, provedené ověření a případná omezení.
- Zachovej přiložené licence a atribuce. Přihlašovací údaje a lokální
  pracovní soubory do repozitáře nepatří.

Nasazení zajišťuje [workflow GitHub Pages](.github/workflows/pages.yml)
po pushi na `main`.
