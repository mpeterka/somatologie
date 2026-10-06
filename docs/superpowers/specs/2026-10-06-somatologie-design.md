# Somatologie — specifikace aplikace

## Upřesnění uživatele při realizaci
Uživatel výslovně zvolil GitHub repozitář a GitHub Pages. Publikování přes Sites se nepoužije; nové repo a web budou veřejné na účtu mpeterka.
Uživatel požádal o základní názvy bez dalšího rozlišení: všechny obratle jsou Obratel / Vertebra, žebra Žebro / Costa, párové kosti bez strany. Tato změna má přednost před původním požadavkem níže na rozlišení stran a čísel v názvech. Sada stále zahrnuje 100 konkrétních zvýraznitelných kostí, ale 33 základních názvů. Možnosti jedné otázky mají vždy čtyři různé názvy.

## Účel
Prohlížečová aplikace pro procvičování českých a latinských názvů kostí. Uživatel poznává zvýrazněnou kost na anatomickém 3D modelu. Rozsah vychází ze schváleného návrhu v chatu.

## Hlavní obrazovka
Na počítači 3D kostra vlevo, otázka a odpovědi vpravo. Na mobilu model nad otázkou. České rozhraní, dobře čitelné názvy, světlé kosti na tmavém pozadí. Výrazné zvýraznění jedné zkoušené kosti. Otáčení, přiblížení a návrat k výchozímu pohledu. Model nesmí před odpovědí zobrazovat název kosti.

## Pravidla kvízu
- Každá otázka nabídne čtyři odlišné názvy a právě jednu správnou možnost.
- První otázka česky, druhá latinsky; jazyky se dále pravidelně střídají.
- Správná odpověď přidá jeden bod. Chybná nula bodů. Každá zodpovězená otázka zvýší počet pokusů právě jednou.
- Po odpovědi se možnosti uzamknou, zobrazí se výsledek a oba názvy správné kosti. Další otázku spustí tlačítko.
- Skóre zobrazuje správné odpovědi, celkový počet odpovědí a procentuální úspěšnost. Před první odpovědí 0 / 0 a 0 %.
- Otázky se náhodně zamíchají. V jednom průchodu se kost neopakuje. Po vyčerpání sady lze začít další průchod.
- Restart zahájí nový průchod a vynuluje skóre.
- Ovládání odpovědí musí fungovat i klávesnicí; výsledek oznámí přístupný stavový text.

## Anatomická data
Cíl je přibližně 100 samostatně zvýraznitelných kostí, nikoli 100 různých anatomických druhů. Párové kosti a jednotlivé obratle lze započítat samostatně. Datová sada pokryje lebku, páteř, hrudník a končetiny. Konkrétní počet a seznam se finalizují podle ověřeného modelu; aplikace zobrazí skutečný počet.

Každý záznam obsahuje stabilní ID, český název, latinský název, oblast a vazbu na jednu nebo více částí 3D modelu. Pokud se zkouší strana nebo pořadí kosti, rozlišuje je i název odpovědi. Rušivé možnosti mají odlišné názvy a pokud možno pocházejí ze stejné oblasti.

Použije se anatomický model s oddělenými kostmi a licencí dovolující jeho distribuci v aplikaci. Autor, zdroj a licence budou uvedeny v aplikaci a repozitáři. Model i názvosloví se ověří proti odborným zdrojům. Geometrická stylizace nesmí být vydávána za anatomicky přesný model. Pokud se vhodný model nepodaří získat, jde o překážku dokončení anatomické verze, nikoli důvod potichu nasadit nepřesnou náhradu.

## Technologie a provoz
Three.js, WebGL a statická webová aplikace bez serverové databáze a přihlášení. Závislosti a model budou součástí sestavení. Web přizpůsobený počítači a telefonu. Skóre platí pro aktuální procvičování; ukládání historie není součástí této verze. Při nepodporovaném WebGL nebo selhání načtení modelu se zobrazí srozumitelná chyba.

Projekt vznikne v W:/mpeterka/somatologie. Pro publikaci se použije Sites se soukromým přístupem podle výchozího nastavení služby.

## Ověření
Ověřit správné mapování zvýrazněných kostí, počet a jedinečnost dat, střídání jazyků, čtyři různé možnosti se správnou odpovědí, jednorázové započtení odpovědi, restart a dokončení průchodu. V prohlížeči prověřit render modelu, otáčení, přiblížení, otázku se správnou i chybnou odpovědí a mobilní rozložení. Build a publikace musí projít; omezení ověření se uvedou při předání.

## Mimo rozsah
Účty, žebříčky, placení, svaly a orgány, časový limit, ukládání výsledků na server a editor anatomických dat.
