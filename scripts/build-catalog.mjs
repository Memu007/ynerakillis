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
  return `<article class="species-entry${image ? '' : ' text-species'}" data-species-id="${escape(item.id)}" data-genus="${escape(item.name.split(' ')[0])}" data-region="${escape(item.region)}" data-countries="${escape(item.countries.join('|'))}" data-search="${escape(search)}">${image ? '' : '<span class="text-species-note">Ficha documentada · fotografía pendiente</span>'}<figure>${image}<figcaption><div class="species-place">${escape(item.range)}</div><h3>${escape(item.name)}</h3><span class="species-type">${escape(item.cycle)}</span><p>${escape(item.short)}</p></figcaption></figure><details class="species-details"><summary>Ver ficha</summary><p>${escape(item.detail)}</p>${alias}${photo?.note ? `<p class="species-photo-note">Fotografía: ${escape(photo.note)}</p>` : ''}${sources}</details>${image ? link(photo.page_url, `Foto: ${photo.author}`, 'species-credit') : ''}</article>`;
}
const genera = [...new Set(catalog.map(item => item.name.split(' ')[0]))].sort((a, b) => a.localeCompare(b, 'en'));
const groups = genera.map(genus => {
  const key = genus.toLowerCase();
  const items = catalog.filter(item => item.name.split(' ')[0] === genus).sort((a, b) => a.name.localeCompare(b.name, 'en'));
  const photos = items.filter(item => item.photo?.asset);
  const notes = items.filter(item => !item.photo?.asset);
  return `<section class="catalog-group" data-group="${key}" data-genus="${escape(genus)}" aria-labelledby="group-${key}"><div class="catalog-group-head"><span class="group-label">Género</span><h2 id="group-${key}">${escape(genus)}</h2><p class="genus-count">${items.length} ${items.length === 1 ? 'especie' : 'especies'}</p></div>${photos.length ? `<div class="species-grid">${photos.map(entry).join('')}</div>` : ''}${notes.length ? `<div class="catalog-notes">${notes.map(entry).join('')}</div>` : ''}</section>`;
}).join('\n');
const page = new URL('public/index.html', root);
let html = readFileSync(page, 'utf8');
html = html.replace(/(<select id="species-genus">)[\s\S]*?(<\/select>)/, (_, start, end) => start + '<option value="todos">Todos los géneros</option>' + genera.map(genus => `<option value="${escape(genus)}">${escape(genus)}</option>`).join('') + end);
const indexStart = html.indexOf('<!-- genus-index:start -->');
const indexEnd = html.indexOf('<!-- genus-index:end -->');
if (indexStart < 0 || indexEnd < indexStart) throw new Error('No se encontró el índice de géneros');
const index = `<details class="genus-index"><summary>Explorar los géneros</summary><p>Elegí un nombre para ir a su grupo de especies.</p><div class="genus-links">${genera.map(genus => `<button type="button" data-genus-jump="${escape(genus)}">${escape(genus)} <span aria-hidden="true">↓</span></button>`).join('')}</div></details>`;
html = html.slice(0, indexStart) + '<!-- genus-index:start -->' + index + html.slice(indexEnd);
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
