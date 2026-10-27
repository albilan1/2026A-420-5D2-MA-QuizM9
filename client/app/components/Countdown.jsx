/**
 * Le temps restant, calculé à partir de l'échéance donnée par le serveur.
 * Un minuteur local le rafraîchit sans aucune requête.
 */
import { useEffect, useState } from 'react';

export default function Countdown({ deadline }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);

    return () => {
      clearInterval(timer);
    }
  }, []);

  const remaining = Math.max(0, Math.ceil((deadline - now) / 1000));
  return <p className="countdown">{remaining} s</p>;
}