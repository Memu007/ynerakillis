import { readFileSync, writeFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const catalog = JSON.parse(readFileSync(new URL('data/species.json', root), 'utf8'));
const translations = JSON.parse(readFileSync(new URL('data/i18n.json', root), 'utf8'));
for (const item of catalog) {
  for (const field of ['short', 'detail', 'range', 'cycle']) {
    if (!item[field + '_en']) throw new Error(`Missing English ${field}: ${item.id}`);
    translations[item[field]] = item[field + '_en'];
  }
  if (item.aliases.length) translations[`También aparece como: ${item.aliases.join(' · ')}.`] = `Also listed as: ${item.aliases.join(' · ')}.`;
  for (const source of item.sources) if (source.label_en) translations[source.label + ' ↗'] = source.label_en + ' ↗';
  if (item.photo) {
    const author = item.photo.author_en || translations[item.photo.author] || item.photo.author;
    translations[`Foto: ${item.photo.author}`] = `Photo: ${author}`;
    translations[`${item.name}. Foto de ${item.photo.author}.`] = `${item.name}. Photo by ${author}.`;
    if (item.photo.note) translations[`Fotografía: ${item.photo.note}`] = `Photograph: ${(item.photo_note_en || item.photo.note_en)}`;
    const changes = item.photo.changes || 'Redimensionada y comprimida.';
    const translatedChanges = item.photo.changes_en || translations[changes] || changes;
    translations[`· ${changes}`] = `· ${translatedChanges}`;
    if (!item.photo.license) translations[`· Permiso de reutilización por verificar · ${changes}`] = `· Reuse permission not yet verified · ${translatedChanges}`;
  }
}
const page = new URL('public/index.html', root);
let html = readFileSync(page, 'utf8');
const start = html.indexOf('/* translations:start */');
const end = html.indexOf('/* translations:end */');
if (start < 0 || end < start) throw new Error('Missing language markers');
const json = JSON.stringify(translations).replace(/</g, '\\u003c');
html = html.slice(0, start) + `/* translations:start */\nconst translations=${json};\n` + html.slice(end);
writeFileSync(page, html);
console.log(`${Object.keys(translations).length} bilingual text entries embedded.`);
