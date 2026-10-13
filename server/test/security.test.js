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

test.todo('un GET sur /api/quizzes/:id/delete ne supprime rien');
test.todo('DELETE /api/quizzes/:id supprime le questionnaire de son auteur (200)');
