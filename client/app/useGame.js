import { useEffect, useState } from 'react';

export function useGame(code) {
  const [game, setGame] = useState(null);

  useEffect(() => {
    if (!code) return;

    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${location.host}/ws`);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', code }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'state') {
        setGame(message.game);
      }
    };

    return () => {
      ws.close();
    };
  }, [code]);

  return game;
}