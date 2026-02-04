import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
    message?: string;
    error?: string | null;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Initializing System...", error }) => {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
            <div className="glass-panel p-10 flex flex-col items-center max-w-md w-full text-center border-t-4 border-t-blue-500">
                {!error ? (
                    <>
                        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-2 tracking-widest uppercase">Loading</h2>
                        <p className="text-blue-300/80 font-mono text-sm animate-pulse">{message}</p>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6 text-red-500 text-4xl font-bold">!</div>
                        <h2 className="text-2xl font-bold text-white mb-2">System Error</h2>
                        <p className="text-red-400 font-mono text-sm">{error}</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default LoadingScreen;
