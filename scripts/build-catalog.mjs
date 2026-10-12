import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const catalog = JSON.parse(readFileSync(new URL('data/species.json', root), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const link = (url, label, className = '') => `<a${className ? ` class="${className}"` : ''} href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`;
function entry(item) {
  const photo = item.photo;
  const search = [item.name, ...item.aliases, item.range, item.short, item.detail, ...item.countries].join(' ');
  const image = photo?.asset ? `<img src="${escape(photo.asset)}" alt="${escape(item.name)}. Foto de ${escape(photo.author)}." loading="lazy" width="1000" height="660">` : '';
  const sources = item.sources.map(source => link(source.url, (source.label || 'Fuente') + ' ↗')).join(' ');
  const alias = item.aliases.length ? `<p class="species-alias">También aparece como: ${escape(item.aliases.join(' · '))}.</p>` : '';
  return `<article class="species-entry${image ? '' : ' text-species'}" data-species-id="${escape(item.id)}" data-region="${escape(item.region)}" data-countries="${escape(item.countries.join('|'))}" data-search="${escape(search)}">${image ? '' : '<span class="text-species-note">Ficha documentada · fotografía pendiente</span>'}<figure>${image}<figcaption><div class="species-place">${escape(item.range)}</div><h3>${escape(item.name)}</h3><span class="species-type">${escape(item.cycle)}</span><p>${escape(item.short)}</p></figcaption></figure><details class="species-details"><summary>Ver ficha</summary><p>${escape(item.detail)}</p>${alias}${photo?.note ? `<p class="species-photo-note">Fotografía: ${escape(photo.note)}</p>` : ''}${sources}</details>${image ? link(photo.page_url, `Foto: ${photo.author}`, 'species-credit') : ''}</article>`;
}
const groups = [
  ['argentina', 'Argentina', 'Especies registradas en Argentina.', item => item.countries.includes('Argentina')],
  ['latinoamerica', 'Otras de Latinoamérica', 'Especies de los humedales y cuencas de la región.', item => item.region === 'latinoamerica' && !item.countries.includes('Argentina')],
  ['africa', 'África e islas del Índico', 'Especies de charcos temporarios y de aguas permanentes.', item => item.region === 'africa'],
  ['asia', 'Asia', 'Una selección de killis asiáticos.', item => item.region === 'asia']
].map(([key, title, description, match]) => {
  const items = catalog.filter(match);
  if (!items.length) return '';
  const photos = items.filter(item => item.photo?.asset);
  const notes = items.filter(item => !item.photo?.asset);
  return `<section class="catalog-group" data-group="${key}" aria-labelledby="group-${key}"><div class="catalog-group-head"><h2 id="group-${key}">${title}</h2><p>${description}</p></div><div class="species-grid">${photos.map(entry).join('')}</div>${notes.length ? `<div class="catalog-notes">${notes.map(entry).join('')}</div>` : ''}</section>`;
}).join('\n');
const page = new URL('public/index.html', root);
let html = readFileSync(page, 'utf8');
const start = html.indexOf('<!-- catalog:start -->');
const end = html.indexOf('<!-- catalog:end -->');
if (start < 0 || end < start) throw new Error('No se encontraron los marcadores del catálogo');
html = html.slice(0, start) + '<!-- catalog:start -->\n' + groups + '\n' + html.slice(end);
const creditStart = html.indexOf('<!-- credits:start -->');
const creditEnd = html.indexOf('<!-- credits:end -->');
if (creditStart < 0 || creditEnd < creditStart) throw new Error('No se encontraron los marcadores de créditos');
const credits = catalog.filter(item => item.photo?.asset).map(item => `<li><i>${escape(item.name)}</i>: ${link(item.photo.page_url, item.photo.author)} · ${item.photo.license_url ? link(item.photo.license_url, item.photo.license) : escape(item.photo.license || 'Permiso de reutilización por verificar')} · ${escape(item.photo.changes || 'Redimensionada y comprimida.')}</li>`).join('');
html = html.slice(0, creditStart) + '<!-- credits:start -->' + credits + html.slice(creditEnd);
writeFileSync(page, html);
console.log(`${catalog.length} fichas generadas con sus fuentes y créditos.`);
