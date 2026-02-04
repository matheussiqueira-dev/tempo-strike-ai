import React, { useEffect, useState } from 'react';
import { Sparkles, Activity } from 'lucide-react';
import clsx from 'clsx';

interface GameHUDProps {
    score: number;
    combo: number;
    multiplier: number;
    health: number;
}

const GameHUD: React.FC<GameHUDProps> = ({ score, combo, multiplier, health }) => {
    const [multiplierScale, setMultiplierScale] = useState(1);
    const [prevMultiplier, setPrevMultiplier] = useState(multiplier);

    // Trigger animation when multiplier increases
    useEffect(() => {
        if (multiplier > prevMultiplier) {
            setMultiplierScale(1.5);
            const timer = setTimeout(() => setMultiplierScale(1), 300);
            return () => clearTimeout(timer);
        }
        setPrevMultiplier(multiplier);
    }, [multiplier, prevMultiplier]);

    // Health color logic
    const healthColor = health > 50 ? 'bg-game-primary' : health > 20 ? 'bg-yellow-500' : 'bg-game-accent';

    return (
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-20">

            {/* Health / Integrity */}
            <div className="flex flex-col gap-2 w-64 glass-panel p-4 border-l-4 border-game-primary animate-fade-in-down">
                <div className="flex items-center gap-2 text-blue-200 text-sm font-bold uppercase tracking-wider">
                    <Activity className="w-4 h-4" /> Integrity
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700/50">
                    <div
                        className={clsx("h-full transition-all duration-300 ease-out shadow-[0_0_10px_currentColor]", healthColor)}
                        style={{ width: `${health}%` }}
                    />
                </div>
                <div className="text-right text-xs text-white/50">{health}%</div>
            </div>

            {/* Score Center */}
            <div className="flex flex-col items-center">
                <div className="glass-panel px-12 py-4 flex flex-col items-center shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                    <span className="text-sm font-mono text-blue-300 tracking-[0.3em] uppercase opacity-70">Current Score</span>
                    <h1 className="text-6xl font-black italic tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                        {score.toLocaleString()}
                    </h1>
                </div>

                {/* Combo & Multiplier */}
                <div className="mt-4 flex flex-col items-center gap-2">
                    <div className={clsx(
                        "transition-all duration-200 font-bold text-3xl italic tracking-wider",
                        combo > 10 ? "text-blue-400 scale-110 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" : "text-gray-400"
                    )}>
                        {combo} <span className="text-lg opacity-80 not-italic font-normal">COMBO</span>
                    </div>

                    {multiplier > 1 && (
                        <div
                            className="transition-transform duration-300 ease-out origin-center"
                            style={{ transform: `scale(${multiplierScale})` }}
                        >
                            <div className={clsx(
                                "px-6 py-2 rounded-full border-2 shadow-[0_0_20px_currentColor] font-black italic tracking-widest text-xl flex items-center gap-3 backdrop-blur-md",
                                multiplier >= 8 ? "bg-purple-900/80 border-purple-400 text-purple-200" :
                                    multiplier >= 4 ? "bg-red-900/80 border-red-400 text-red-200" :
                                        "bg-blue-900/80 border-blue-400 text-blue-200"
                            )}>
                                <Sparkles className="w-5 h-5 animate-spin-slow" />
                                {multiplier}x
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Empty Right Side or Song Progress (could implement later) */}
            <div className="w-64"></div>
        </div>
    );
};

export default GameHUD;
