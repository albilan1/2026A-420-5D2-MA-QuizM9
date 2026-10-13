/**
 * Exercice 13 : les attaques de la semaine 6, rejouées ici pour qu'elles ne
 * reviennent pas. Écrivez chaque test AVANT la correction : il doit
 * d'abord échouer.
 */
import { test, before, after } from 'node:test';
import { startServer } from './helpers.js';
import assert from 'node:assert/strict';

let api;
let alice;
before(async () => {
  api = await startServer();
  alice = await api.login('alice');
});
after(() => api.close());

// ── Jalon 1 : l'injection SQL ─────────────────────────────────────────────

test('une apostrophe dans la recherche ne fait pas planter l’API (200)', async () => {
  const { status } = await api.request("GET", "/api/quizzes?q=l%27histoire");
  assert.equal(status, 200);
});
test('une recherche piégée ne sort pas les comptes', async () => {
  const piege = "' UNION SELECT id, login, name, github_id FROM account --";
  const { status, data } = await api.request("GET", "/api/quizzes?q=" + encodeURIComponent(piege));
  assert.equal(status, 200);
  assert.equal(data.length, 0);
});

// ── Jalon 3 : le CSRF ─────────────────────────────────────────────────────

test('un GET sur /api/quizzes/:id/delete ne supprime rien', async () => {
  // 1. Alice crée un questionnaire (jamais joué)
  const { status, data } = await api.request('POST', '/api/quizzes', { title: 'test' }, alice);
  const id = data.id

  // 2. Le piège : un GET sur l'adresse de suppression, avec la session d'Alice
  await api.request('GET', `/api/quizzes/${id}/delete`, undefined, alice);

  // 3. Le questionnaire doit toujours exister
  const apres = await api.request('GET', `/api/quizzes/${id}`, undefined, alice);
  assert.equal(apres.status, 200);
});

test('DELETE /api/quizzes/:id supprime le questionnaire de son auteur (200)', async () => {
  // 1. Alice crée un questionnaire (jamais joué)
  const { status, data } = await api.request('POST', '/api/quizzes', { title: 'test' }, alice);
  const id = data.id

  // 2. Alice le supprime, avec le bon verbe
  const suppression = await api.request("DELETE", `/api/quizzes/${id}`, undefined, alice);
  assert.equal(suppression.status, 200);

  // 3. Il n'existe plus
  const apres = await api.request('GET', `/api/quizzes/${id}`, undefined, alice);
  assert.equal(apres.status, 404);
});
