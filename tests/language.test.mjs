import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const languageCode = script.slice(script.indexOf('const translations='), script.indexOf('const reduced='));
test('ES/EN cambia textos y accesibilidad conservando la sección y los datos', () => {
  const node = { isConnected: true, nodeValue: '  Inicio  ' };
  const input = { value: 'Mis notas', setAttribute(name, value) { this[name] = value; } };
  const menuLabel = { isConnected: true, textContent: 'Menú' };
  const buttons = ['es', 'en'].map(language => ({ dataset: { language }, setAttribute(name, value) { this[name] = value; } }));
  const saved = new Map();
  const document = { documentElement: {}, body: { dataset: { view: 'especies' } }, querySelectorAll: () => buttons, getElementById: () => menuLabel };
  let updates = 0;
  const context = { document, menu: { getAttribute: () => 'false' }, routeLabels: { especies: 'Especies' }, localStorage: { setItem: (key, value) => saved.set(key, value) }, updateSpecies: () => updates++ };
  vm.createContext(context);
  vm.runInContext(languageCode, context);
  context.node = node; context.input = input;
  vm.runInContext("languageTexts.push([node,'  Inicio  ']);languageAttributes.push([input,'placeholder','Tu alias']);setLanguage('en')", context);
  assert.equal(node.nodeValue, '  Home  ');
  assert.equal(input.placeholder, 'Your alias');
  assert.equal(input.value, 'Mis notas');
  assert.equal(document.body.dataset.view, 'especies');
  assert.equal(document.documentElement.lang, 'en');
  assert.equal(menuLabel.textContent, 'Menu');
  assert.equal(document.title, 'Killi · Species');
  assert.equal(buttons[1]['aria-pressed'], 'true');
  assert.equal(saved.get('killi-language'), 'en');
  vm.runInContext("setLanguage('es')", context);
  assert.equal(node.nodeValue, '  Inicio  ');
  assert.equal(input.placeholder, 'Tu alias');
  assert.equal(menuLabel.textContent, 'Menú');
  assert.equal(updates, 2);
});
test('las 25 fichas tienen traducción y el selector aparece arriba en ambas vistas', () => {
  const catalog = JSON.parse(readFileSync(new URL('../data/species.json', import.meta.url), 'utf8'));
  const translations = JSON.parse(script.match(/const translations=(\{[^\n]+\});/)[1]);
  for (const item of catalog) for (const field of ['short', 'detail', 'range', 'cycle']) {
    assert(item[field + '_en'], item.id + ': ' + field);
    assert.equal(translations[item[field]], item[field + '_en']);
  }
  assert.equal((html.match(/data-language="en"/g) || []).length, 2);
  assert.equal((html.match(/data-language="es"/g) || []).length, 2);
  assert(translations['Filtrar especies']);
  assert(translations['Completá ambas coordenadas, o dejá las dos vacías.']);
});
