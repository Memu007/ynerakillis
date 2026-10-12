import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const css=html.match(/<style>([\s\S]*?)<\/style>/)[1];

test('el menú aparece después del hero y las páginas internas tienen H1',()=>{
  new vm.Script(script);
  assert(html.indexOf('<section class="intro"')<html.indexOf('<header class="site-header"'));
  assert(html.indexOf('<header class="site-header"')<html.indexOf('<main id="contenido-principal"'));
  assert.match(css,/\.site-header\{position:sticky;top:0/);
  assert(!css.includes('past-hero'));
  assert.equal((html.match(/<style>/g)||[]).length,1);
  for(const id of ['species-title','life-title','breeding-title','notebook-title','forum-title'])assert(html.includes(`<h1 id="${id}">`));
  assert(script.includes("if(open)siteHeader.querySelector('nav a').focus()"));
});

test('búsqueda por países/sinónimos y filtros Argentina/Latinoamérica',()=>{
  const context={};vm.createContext(context);
  const normal=script.match(/const normalizeSpecies=[^\n]+/)[0];
  const matches=script.match(/function matchesSpecies\([\s\S]*?\n}/)[0];
  vm.runInContext(normal+matches,context);
  const matchesSpecies=context.matchesSpecies;
  assert(matchesSpecies('latinoamerica','Argentina|Uruguay','Titanolebias elongatus Austrolebias elongatus Argentina','Austrolebias','argentina'));
  assert(matchesSpecies('latinoamerica','Argentina','Argolebias nigripinnis','nigripinnis','latinoamerica'));
  assert(matchesSpecies('latinoamerica','Brasil','Garcialebias adloffi Brasil',' brasil ','latinoamerica'));
  assert(!matchesSpecies('latinoamerica','Brasil','Garcialebias adloffi Brasil','','argentina'));
  assert(matchesSpecies('africa','Gabón|Congo','Aphyosemion australe Gabón Congo','gabon','africa'));
  assert(!matchesSpecies('africa','Gabón','Aphyosemion australe','Gabon','latinoamerica'));
  assert(!matchesSpecies('latinoamerica','Argentina','Argolebias guarani','inexistente','todos'));
});

test('el catálogo tiene grupos ordenados y fichas reales diferenciadas',()=>{
  const body=html.slice(html.indexOf('<body'),html.indexOf('<script>'));
  assert(body.indexOf('data-group="argentina"')<body.indexOf('data-group="latinoamerica"'));
  assert(body.indexOf('data-group="latinoamerica"')<body.indexOf('data-group="africa"'));
  assert((body.match(/class="species-entry/g)||[]).length>=12);
  assert(body.includes('id="species-empty"'));
  assert(!body.includes('<strong>Registrar una puesta</strong>'));
  assert(body.includes('Ir al cuaderno de poblaciones'));
});

test('la paleta conserva contraste de texto sobre superficies claras y oscuras',()=>{
  function luminance(hex){const c=hex.slice(1);const v=[0,2,4].map(i=>parseInt(c.slice(i,i+2),16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2]}
  const pairs=[['#25352e','#eeeae0'],['#52614f','#eeeae0'],['#665b47','#eeeae0'],['#626953','#eeeae0'],['#994c32','#eeeae0'],['#edf3e9','#091e23'],['#bdcbbb','#16332f'],['#c2ab80','#16332f'],['#eeeae0','#25352e']];
  for(const [a,b] of pairs){const x=luminance(a),y=luminance(b);assert((Math.max(x,y)+.05)/(Math.min(x,y)+.05)>=4.5,`${a} sobre ${b}`)}
  assert.match(css,/body\{[^}]*color:var\(--text\)/);
  assert.match(css,/\.scene\{[^}]*color:var\(--ink\)/);
});
