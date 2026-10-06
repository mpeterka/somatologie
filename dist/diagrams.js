// Original schematic illustrations, always in anatomical position.
const front = `<circle cx="200" cy="82" r="27"/><path d="M186 111v20l-34 14-22 105-12 62 16 5 22-62 20-67-5 123 8 31-9 162 23 1 17-146 17 146 23-1-9-162 8-31-5-123 20 67 22 62 16-5-12-62-22-105-34-14v-20"/><path d="m120 312-10 22 4 13 9-19 8 25 8-2-5-35m146-4 10 22-4 13-9-19-8 25-8-2 5-35M170 505l-9 13h34v-13m35 0 9 13h-34v-13"/>`;
const side = `<path d="M190 55q-22 0-22 26l-10 10 12 7 4 19 15 1v18q-22 7-22 47l7 72-6 79 13 15-5 156-7 12h46l-4-14-9-165 9-79-9-61-2-47-6-19v-25l12-14-3-26q0-20-15-20Z"/>`;
const body = (shape = front) => `<g fill="#537383" stroke="#b9cfda" stroke-width="2.5" stroke-linejoin="round">${shape}</g>`;
const arrow = (x1, y1, x2, y2) => `<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="#ffc966" stroke-width="9" stroke-linecap="round" marker-end="url(#arrow)"/>`;
const caption = (text, y = 570) => `<text x="200" y="${y}" text-anchor="middle" fill="#d9e5eb" font-size="16">${text}</text>`;

export function directionDiagram(item) {
  const id = item.id;
  let drawing;
  if (item.region === 'Roviny') {
    const plane = (profile) => {
      if (id === 'transversalis') return '<rect x="132" y="280" width="136" height="16"/>';
      const face = (id === 'sagittalis') === profile;
      return face ? '<rect x="153" y="40" width="94" height="485"/>' : '<rect x="196" y="40" width="8" height="485"/>';
    };
    drawing = `<g transform="translate(-76 46) scale(.75)">${body()}<g fill="#ffc966" fill-opacity=".38" stroke="#ffc966" stroke-width="3">${plane(false)}</g></g><g transform="translate(174 46) scale(.75)">${body(side)}<g fill="#ffc966" fill-opacity=".38" stroke="#ffc966" stroke-width="3">${plane(true)}</g></g><text x="74" y="475" text-anchor="middle" fill="#d9e5eb" font-size="15">Zepředu</text><text x="324" y="475" text-anchor="middle" fill="#d9e5eb" font-size="15">Z boku</text>${caption('Dva pohledy na tutéž rovinu', 540)}`;
  } else if (['superficialis', 'profundus'].includes(id)) {
    drawing = `<rect x="65" y="175" width="270" height="44" rx="6" fill="#ccab91"/><rect x="65" y="219" width="270" height="60" fill="#c5a365"/><rect x="65" y="279" width="270" height="145" rx="6" fill="#995f64"/><path d="M50 175h300" stroke="#e5d5c5" stroke-width="4"/><text x="200" y="140" text-anchor="middle" fill="#d9e5eb" font-size="18">Povrch těla</text>${id === 'profundus' ? arrow(200, 200, 200, 365) : arrow(200, 365, 200, 195)}${caption('Schematický řez tkáněmi', 485)}`;
  } else if (['radialis', 'ulnaris', 'palmaris'].includes(id)) {
    drawing = `<g fill="#537383" stroke="#b9cfda" stroke-width="3"><path d="M150 95h100l-10 180 13 84-6 102q-3 13-10 0l-4-80-8 93q-3 15-11 0l-1-89-8 100q-6 12-12 0l-1-98-9 83q-7 12-11 0l-2-91-22-32-15 18q-13 12-15 0l16-44 16-19Z"/><path d="M177 280l15 75m40-75-10 75m-34-25 39 5" fill="none"/></g>${id === 'palmaris' ? arrow(310, 350, 220, 350) : id === 'radialis' ? arrow(225, 235, 155, 235) : arrow(175, 235, 245, 235)}${caption('Pravé předloktí a ruka · dlaň vpřed', 540)}`;
  } else if (id === 'plantaris') {
    drawing = `<path d="M120 140h85l-8 210 64 21 49 29q16 18-9 23H100l10-75Z" fill="#537383" stroke="#b9cfda" stroke-width="3"/><path d="M104 424h197" stroke="#d9e5eb" stroke-width="5"/>${arrow(215, 510, 215, 432)}${caption('Noha při pohledu z boku', 570)}`;
  } else if (['dexter', 'sinister'].includes(id)) {
    // Mark a side, rather than an outward arrow that could also mean lateralis.
    const x = id === 'dexter' ? 0 : 200;
    drawing = `${body()}<defs><clipPath id="body-side"><rect x="${x}" y="0" width="200" height="540"/></clipPath></defs><g clip-path="url(#body-side)" fill="#ffc966" stroke="#ffc966" stroke-width="2">${front}</g><path d="M200 45v495" stroke="#b9cfda" stroke-dasharray="5 6" stroke-width="2"/>${caption('Pohled zepředu · dlaně vpřed')}`;
  } else {
    const profile = ['ventralis', 'dorsalis'].includes(id);
    const arrows = {
      cranialis: [200, 270, 200, 135], caudalis: [200, 170, 200, 310],
      // The profile faces left: ventral is left, dorsal is right.
      ventralis: [190, 245, 90, 245], dorsalis: [195, 245, 295, 245],
      medialis: [280, 230, 208, 230], lateralis: [215, 230, 295, 230],
      proximalis: [140, 280, 159, 169], distalis: [159, 185, 137, 295],
      tibialis: [163, 425, 185, 425], fibularis: [184, 425, 155, 425],
    };
    if (!arrows[id]) throw new Error(`Missing illustration: ${id}`);
    const reference = ['medialis', 'lateralis', 'dexter', 'sinister'].includes(id) ? '<path d="M200 45v495" stroke="#b9cfda" stroke-dasharray="5 6" stroke-width="2"/>' : '';
    drawing = `${body(profile ? side : front)}${reference}${arrow(...arrows[id])}${caption(profile ? 'Pohled z boku · obličej vlevo' : 'Pohled zepředu · dlaně vpřed')}`;
  }
  return `<svg viewBox="0 0 400 600" role="img" aria-label="${item.region === 'Roviny' ? 'Zlatě vyznačená rovina, pohled zepředu a z boku' : ['dexter', 'sinister'].includes(id) ? 'Zlatě vyznačená strana těla při pohledu zepředu' : 'Zlatá šipka znázorňuje hledaný směr'}" xmlns="http://www.w3.org/2000/svg"><defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" fill="#ffc966"/></marker></defs>${drawing}</svg>`;
}

export function createDiagramViewer(container) {
  return {
    show(item) { container.innerHTML = directionDiagram(item); },
    highlight() { container.replaceChildren(); },
    resetView() {},
    dispose() { container.replaceChildren(); }
  };
}
