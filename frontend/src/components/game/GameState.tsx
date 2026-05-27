import {useAppSelector} from "../../store/store.ts";
import styles from "./GameState.module.css";

export default function GameState() {
  const gameId = useAppSelector(state => state.gameInstance.gameId);
  const gameState = useAppSelector(state => state.gameInstance.gameState);

  return (
      <section className={styles["game-state"]}>
        <h4>game id {gameId}</h4>
        <div>turn: {gameState.turn}</div>
        <div>lives: {gameState.lives}</div>
        <div>gold: {gameState.gold}</div>
        <div>score: {gameState.score}</div>
        <div>high score: {gameState.highScore}</div>
        <div>level: {gameState.level}</div>
      </section>
  )
}
