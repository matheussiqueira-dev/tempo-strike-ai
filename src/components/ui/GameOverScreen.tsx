import React, { useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { GameStatus } from '../../types';

interface GameOverScreenProps {
    status: GameStatus; // VICTORY or GAME_OVER
    score: number;
    onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ status, score, onRestart }) => {
    const isVictory = status === GameStatus.VICTORY;

    useEffect(() => {
        // Save high score
        const current = parseInt(localStorage.getItem('tempo-strike-highscore') || '0', 10);
        if (score > current) {
            localStorage.setItem('tempo-strike-highscore', score.toString());
        }
    }, [score]);

    return (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-panel p-16 text-center border-2 border-white/5 relative overflow-hidden">
                {/* Background Effect */}
                <div className={clsx(
                    "absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-b",
                    isVictory ? "from-green-500 via-green-900 to-transparent" : "from-red-500 via-red-900 to-transparent"
                )} />

                <div className="relative z-10 flex flex-col items-center">
                    {isVictory ? (
                        <CheckCircle className="w-24 h-24 text-green-400 mb-6 drop-shadow-[0_0_20px_rgba(74,222,128,0.5)]" />
                    ) : (
                        <XCircle className="w-24 h-24 text-red-500 mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
                    )}

                    <h2 className={clsx(
                        "text-7xl font-black mb-2 tracking-tighter uppercase italic",
                        isVictory ? 'text-green-400 drop-shadow-[0_0_30px_rgba(74,222,128,0.4)]' : 'text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                    )}>
                        {isVictory ? "Mission Clear" : "System Failure"}
                    </h2>

                    <p className="text-white/60 text-xl font-mono mb-10 tracking-widest uppercase">
                        {isVictory ? "Sequence Completed Successfully" : "Rhythm Sync Lost"}
                    </p>

                    <div className="mb-12 bg-black/40 p-6 rounded-2xl border border-white/10 w-full max-w-sm mx-auto">
                        <div className="text-sm text-gray-400 uppercase tracking-widest mb-2 font-bold">Final Score</div>
                        <div className="text-5xl font-mono text-white font-bold">{score.toLocaleString()}</div>
                    </div>

                    <button
                        onClick={onRestart}
                        className="btn-primary flex items-center gap-3 text-xl px-10 py-4 bg-white text-black hover:bg-gray-200 hover:scale-105 border-none shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                        <RefreshCw className={clsx("w-6 h-6", !isVictory && "group-hover:rotate-180 transition-transform")} />
                        RESTART SYSTEM
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameOverScreen;
