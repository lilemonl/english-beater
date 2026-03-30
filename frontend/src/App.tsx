import React from 'react';
import { useGameStore } from './store/gameStore';
import { MainMenu } from './components/MainMenu';
import { Dictionary } from './components/Dictionary';
import { Game } from './components/Game';
import { GameResult } from './components/GameResult';

const App: React.FC = () => {
  const gameState = useGameStore(state => state.gameState);

  return (
    <>
      {gameState === 'menu' && <MainMenu />}
      {gameState === 'dictionary' && <Dictionary />}
      {gameState === 'playing' && <Game />}
      {gameState === 'result' && <GameResult />}
    </>
  );
};

export default App;
