import React, { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { Login } from './components/Login';
import { MainMenu } from './components/MainMenu';
import { Dictionary } from './components/Dictionary';
import { Game } from './components/Game';
import { GameResult } from './components/GameResult';

const App: React.FC = () => {
  const gameState = useGameStore(state => state.gameState);
  const initAuth = useGameStore(state => state.initAuth);
  const authReady = useGameStore(state => state.authReady);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <>
      {gameState === 'login' && <Login />}
      {gameState !== 'login' && !authReady && (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
          Connecting to server...
        </div>
      )}
      {authReady && gameState === 'menu' && <MainMenu />}
      {authReady && gameState === 'dictionary' && <Dictionary />}
      {authReady && gameState === 'playing' && <Game />}
      {authReady && gameState === 'result' && <GameResult />}
    </>
  );
};

export default App;
