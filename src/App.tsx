import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useProgress } from '@react-three/drei';
import { GameStatus } from './types';
import { useMediaPipe } from './hooks/useMediaPipe';
import { useGameLogic } from './hooks/useGameLogic';
import GameScene from './components/GameScene';
import WebcamPreview from './components/WebcamPreview';
import GameHUD from './components/ui/GameHUD';
import MainMenu from './components/ui/MainMenu';
import GameOverScreen from './components/ui/GameOverScreen';
import LoadingScreen from './components/ui/LoadingScreen';

const App: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { isCameraReady, handPositionsRef, lastResultsRef, error: cameraError } = useMediaPipe(videoRef);

    const {
        gameStatus,
        setGameStatus,
        score,
        combo,
        multiplier,
        health,
        startGame,
        endGame,
        handleNoteHit,
        handleNoteMiss,
        audioRef,
        chart
    } = useGameLogic(isCameraReady);

    // Transition from Loading to IDLE when camera is ready
    useEffect(() => {
        if (gameStatus === GameStatus.LOADING && isCameraReady) {
            setGameStatus(GameStatus.IDLE);
        }
    }, [gameStatus, isCameraReady, setGameStatus]);

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden font-sans select-none text-white">
            {/* 1. Logic Layer: Video (Hidden) */}
            <video
                ref={videoRef}
                className="absolute opacity-0 pointer-events-none"
                playsInline muted autoPlay
                style={{ width: '640px', height: '480px' }}
            />

            {/* 2. Visual Layer: 3D Scene */}
            {/* Canvas is always rendered but scene inside depends on state to avoid re-mounting heavy context if possible, 
           or we unmount to pause? Unmounting is safer for cleanup. */}
            <Canvas shadows dpr={[1, 2]}>
                {(gameStatus !== GameStatus.LOADING) && (
                    <GameScene
                        gameStatus={gameStatus}
                        audioRef={audioRef}
                        handPositionsRef={handPositionsRef}
                        chart={chart}
                        onNoteHit={handleNoteHit}
                        onNoteMiss={handleNoteMiss}
                        onSongEnd={() => endGame(true)}
                    />
                )}
            </Canvas>

            {/* 3. Helper Layer: Webcam Preview */}
            <WebcamPreview
                videoRef={videoRef}
                resultsRef={lastResultsRef}
                isCameraReady={isCameraReady}
            />

            {/* 4. UI Layer */}

            {/* Loading Screen */}
            {gameStatus === GameStatus.LOADING && (
                <LoadingScreen error={cameraError} />
            )}

            {/* Main Menu */}
            {gameStatus === GameStatus.IDLE && (
                <MainMenu
                    onStart={startGame}
                    isCameraReady={isCameraReady}
                    cameraError={cameraError}
                />
            )}

            {/* HUD */}
            {(gameStatus === GameStatus.PLAYING) && (
                <GameHUD score={score} combo={combo} multiplier={multiplier} health={health} />
            )}

            {/* Game Over / Victory */}
            {(gameStatus === GameStatus.GAME_OVER || gameStatus === GameStatus.VICTORY) && (
                <GameOverScreen status={gameStatus} score={score} onRestart={() => setGameStatus(GameStatus.IDLE)} />
            )}
        </div>
    );
};

export default App;