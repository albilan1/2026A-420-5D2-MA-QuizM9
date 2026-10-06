/**
 * Exercice 12 : qui peut faire quoi. Alice est l'autrice, Bob un autre
 * compte, root un administrateur.
 */
import { test, before, after } from 'node:test';
import { startServer } from './helpers.js';
import assert from 'node:assert/strict';

let api;
let alice;
let bob;
let root;
before(async () => {
  api = await startServer();
  alice = await api.login('alice');
  bob = await api.login('bob');
  root = await api.login('root', { admin: true });
});
after(() => api.close());

/** Crée un questionnaire d'Alice, avec une question, et retourne son id. */
async function aliceQuiz() {
  const { data } = await api.request('POST', '/api/quizzes', { title: 'Le quiz d’Alice' }, alice);
  await api.request('POST', `/api/quizzes/${data.id}/questions`, {
    text: 'Capitale du Canada ?',
    durationSeconds: 20,
    choices: [
      { text: 'Ottawa', isCorrect: true },
      { text: 'Toronto', isCorrect: false },
    ],
  }, alice);
  return data.id;
}

// ── Jalon 1 : il faut un compte ───────────────────────────────────────────

test('GET /api/quizzes/:id sans session est refusé (401)', async () => {
  const id = await aliceQuiz();
  const { status } = await api.request('GET', `/api/quizzes/${id}`);
  assert.equal(status, 401);
});

// ── Jalon 2 : son questionnaire, pas celui des autres ─────────────────────

test('Bob ne voit pas le questionnaire d’Alice (403)', async () => {
  const id = await aliceQuiz();
  const { status } = await api.request('GET', `/api/quizzes/${id}`, undefined, bob);
  assert.equal(status, 403);
});

test('Bob ne peut pas ajouter de question au questionnaire d’Alice (403)', async () => {
  const id = await aliceQuiz();
  // Une question valide : le 403 vient bien de l'autorisation, pas d'un 400.
  const { status } = await api.request('POST', `/api/quizzes/${id}/questions`, {
    text: 'Question de Bob',
    durationSeconds: 20,
    choices: [
      { text: 'A', isCorrect: true },
      { text: 'B', isCorrect: false },
    ],
  }, bob);
  assert.equal(status, 403);
});

test('Alice voit son questionnaire (200)', async () => {
  const id = await aliceQuiz();
  const { status, data } = await api.request('GET', `/api/quizzes/${id}`, undefined, alice);
  assert.equal(status, 200);
  assert.equal(data.title, 'Le quiz d’Alice');
});

// ── Jalon 3 : la partie et son animateur ──────────────────────────────────

test('créer une partie sans session est refusé (401)', async () => {
  const id = await aliceQuiz();
  const { status } = await api.request('POST', '/api/games', { quizId: id });
  assert.equal(status, 401);
});

test('Bob ne peut pas faire avancer la partie d’Alice (403)', async () => {
  const id = await aliceQuiz();
  const created = await api.request('POST', '/api/games', { quizId: id }, alice);
  const code = created.data.code;

  // Les deux côtés : le refus de Bob, puis l'accès légitime d'Alice.
  const refused = await api.request('POST', `/api/games/${code}/next`, undefined, bob);
  assert.equal(refused.status, 403);

  const accepted = await api.request('POST', `/api/games/${code}/next`, undefined, alice);
  assert.equal(accepted.status, 200);
});

// ── Jalon 4 : l'administrateur ────────────────────────────────────────────

test('un administrateur voit le questionnaire d’Alice (200)', async () => {
  const id = await aliceQuiz();
  const { status } = await api.request('GET', `/api/quizzes/${id}`, undefined, root);
  assert.equal(status, 200);
});