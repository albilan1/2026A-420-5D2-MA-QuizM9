import { useEffect, useState } from 'react';

export function useGame(code) {
  const [game, setGame] = useState(null);

  useEffect(() => {
  if (!code) return;

  let ws = null;
  let attempts = 0;
  let retryTimer = null;
  let stopped = false;

  function connect() {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${location.host}/ws`);

    ws.onopen = () => {
      attempts = 0;
      ws.send(JSON.stringify({ type: 'join', code }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'state') {
        setGame(message.game);
      }
    };

    ws.onclose = () => {
      if (stopped) return;

      const delay = Math.min(30000, 1000 * 2 ** attempts) + Math.random() * 1000;
      attempts += 1;
      retryTimer = setTimeout(connect, delay);
    };
  }

  connect();

  return () => {
    stopped = true;
    clearTimeout(retryTimer);
    ws.close();
  };
}, [code]);

  return game;
}