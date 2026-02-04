import React, { useEffect, useState } from 'react';
import { Play, VideoOff, Hand, Sparkles, MonitorSmartphone } from 'lucide-react';
import clsx from 'clsx';

interface MainMenuProps {
    onStart: () => void;
    isCameraReady: boolean;
    cameraError?: string | null;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart, isCameraReady, cameraError }) => {
    const [highScore, setHighScore] = useState(0);

    useEffect(() => {
        const saved = localStorage.getItem('tempo-strike-highscore');
        if (saved) setHighScore(parseInt(saved, 10));
    }, []);

    return (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4">
            <div className="glass-panel p-12 max-w-2xl w-full text-center relative overflow-hidden group">

                {/* Decorative Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-8 relative">
                        <div className="absolute inset-0 blur-3xl bg-blue-500/30 rounded-full animate-pulse-fast"></div>
                        <Sparkles className="w-20 h-20 text-blue-400 relative z-10" />
                    </div>

                    <h1 className="text-8xl font-black text-white mb-2 tracking-tighter italic drop-shadow-[0_0_30px_rgba(59,130,246,0.6)]">
                        TEMPO <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">STRIKE</span>
                    </h1>
                    <p className="text-blue-200/60 font-mono tracking-[0.5em] text-sm mb-10 uppercase">
                        AI Powered Rhythm Action
                    </p>

                    {highScore > 0 && (
                        <div className="mb-8 px-6 py-2 bg-yellow-900/20 border border-yellow-500/30 rounded-full text-yellow-200 font-mono text-sm flex items-center gap-2">
                            <Sparkles className="w-3 h-3" /> HIGH SCORE: {highScore.toLocaleString()}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-10 text-left">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-start gap-4">
                            <Hand className="w-8 h-8 text-blue-400 shrink-0" />
                            <div>
                                <h3 className="font-bold text-white mb-1">Body Control</h3>
                                <p className="text-sm text-gray-400">Step back until your upper body is visible. Use your hands to strike targets.</p>
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-start gap-4">
                            <MonitorSmartphone className="w-8 h-8 text-purple-400 shrink-0" />
                            <div>
                                <h3 className="font-bold text-white mb-1">Rhythm Sync</h3>
                                <p className="text-sm text-gray-400">Hit the sparks when they align with the beat. Precision multiplies your score.</p>
                            </div>
                        </div>
                    </div>

                    {!isCameraReady ? (
                        <div className="flex flex-col items-center gap-4 animate-pulse">
                            <div className="bg-red-900/20 border border-red-500/30 text-red-200 px-8 py-4 rounded-lg flex items-center gap-3">
                                {cameraError ? (
                                    <>
                                        <VideoOff className="w-6 h-6" />
                                        <span className="font-bold">Camera Error: {cameraError}</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="font-bold">Initializing Vision System...</span>
                                    </>
                                )}
                            </div>
                            <p className="text-xs text-gray-500">Please allow camera access to play.</p>
                        </div>
                    ) : (
                        <button
                            onClick={onStart}
                            className="group relative btn-primary flex items-center gap-4 text-2xl py-5 px-16 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative z-10 flex items-center gap-4">
                                <Play fill="currentColor" className="w-8 h-8" /> START OPERATION
                            </span>
                        </button>
                    )}
                </div>

                <div className="absolute bottom-4 right-6 text-white/20 text-xs font-mono">
                    v2.0.0-alpha
                </div>
            </div>
        </div>
    );
};

export default MainMenu;
