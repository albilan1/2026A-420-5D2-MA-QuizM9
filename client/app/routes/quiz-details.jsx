import { Link, useLoaderData } from 'react-router';
<<<<<<< Updated upstream
import { API_URL } from '../api-url.js';
=======
>>>>>>> Stashed changes

/**
 * Un questionnaire et ses questions — ce que l'animateur vérifie avant de
 * jouer. La bonne réponse est cochée : c'est la vue de l'AUTEUR.
 *
<<<<<<< Updated upstream
 * Rendu CÔTÉ SERVEUR, calqué sur le loader de la liste ; params.id vient
 * de l'URL (/quizzes/:id).
 */
export async function loader({ params }) {
  const response = await fetch(`${API_URL}/api/quizzes/${params.id}`);
=======
 * TODO (partie 2, jalon ②) : passer au rendu côté serveur, en vous calquant
 * sur le loader de la liste (/quizzes).
 *
 * 1. Exportez `loader` — elle reçoit { params }, et params.id est l'id de
 *    l'URL : fetch(`http://localhost:3000/api/quizzes/${params.id}`).
 * 2. Si l'API répond 404, levez une erreur ; sinon retournez le JSON.
 * 3. Dans le composant, remplacez useParams + useState + useEffect par
 *    const quiz = useLoaderData();
 * 
 */

export async function loader({ params }) {
  const response = await fetch(`http://localhost:3000/api/quizzes/${params.id}`);
>>>>>>> Stashed changes
  if (!response.ok) {
    throw new Response('Questionnaire introuvable.', { status: 404 });
  }
  return response.json();
}

export default function QuizDetails() {
  const quiz = useLoaderData();
  
  return (
    <main className="screen">
      <h1>{quiz.title}</h1>
      <p>
        <Link to="/quizzes">← Mes questionnaires</Link>
        {' · '}
        <Link to={`/quizzes/${quiz.id}/edit`}>Modifier</Link>
      </p>
      {quiz.questions.map((question, i) => (
        <section key={question.id} className="card question">
          <h2>
            {i + 1}. {question.text}
          </h2>
          <p className="progress">{question.durationSeconds} secondes</p>
          <ul className="choice-list">
            {question.choices.map((choice) => (
              <li key={choice.id} className={choice.isCorrect ? 'correct' : ''}>
                {choice.text} {choice.isCorrect && '✓'}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
