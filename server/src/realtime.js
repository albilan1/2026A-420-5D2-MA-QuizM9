import { WebSocketServer } from 'ws';
import { publicState } from './game.js';
import * as repository from './repository/index.js';

const groups = new Map();

function join(code, ws) {
  if (!groups.has(code)) groups.set(code, new Set());
  groups.get(code).add(ws);
}

function leave(code, ws) {
  const group = groups.get(code);
  if (!group) return;
  group.delete(ws);
  if (group.size === 0) groups.delete(code);
}

export function attachRealtime(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('Nouvelle connexion WebSocket');
    let currentCode = null;

    ws.on('error', (err) => console.error('Erreur WebSocket :', err.message));

    ws.on('message', async (data) => {
      let message;
      try {
        message = JSON.parse(data.toString());
      } catch {
        ws.send(JSON.stringify({ type: 'error', error: 'Message illisible.' }));
        return;
      }

      if (typeof message !== 'object' || message === null) {
        ws.send(JSON.stringify({ type: 'error', error: 'Message invalide.' }));
        return;
      }

      if (message.type === 'join') {
        const game = await repository.findGameByCode(message.code);

        if (!game) {
          ws.send(JSON.stringify({ type: 'error', error: 'Partie introuvable.' }));
          return;
        }

        currentCode = message.code;
        join(currentCode, ws);

        ws.send(JSON.stringify({ type: 'state', game: await publicState(currentCode) }));
      }
    });

    ws.on('close', () => {
      if (currentCode) {
        leave(currentCode, ws);
      }
    });
  });
}