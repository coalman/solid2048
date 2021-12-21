import "./score-board.css";

export default function ScoreBoard(props: {
  score: number;
  bestScore: number;
}) {
  return (
    <div className="score-board">
      <div className="score">
        <span className="score-title">score</span>
        <span>{props.score}</span>
      </div>
      <div className="score">
        <span className="score-title">best</span>
        <span>-</span>
      </div>
    </div>
  );
}
