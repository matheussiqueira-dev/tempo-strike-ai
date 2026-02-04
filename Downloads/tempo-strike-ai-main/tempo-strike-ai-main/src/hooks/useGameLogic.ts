import { useState, useCallback, useRef } from 'react';
import { GameStatus, NoteData, HitAccuracy } from '../types';
import { DEMO_CHART, SONG_URL } from '../constants';

export const useGameLogic = (isCameraReady: boolean) => {
    const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.LOADING);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [multiplier, setMultiplier] = useState(1);
    const [health, setHealth] = useState(100);
    const [chart, setChart] = useState<NoteData[]>(DEMO_CHART);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize Audio
    if (!audioRef.current) {
        audioRef.current = new Audio(SONG_URL);
    }

    const startGame = useCallback(async () => {
        if (!isCameraReady) return;

        setScore(0);
        setCombo(0);
        setMultiplier(1);
        setHealth(100);

        // Reset Chart Logic (Correctly cloning to avoid mutating constant if we want to be pure, 
        // but for performance here we'll just reset the array objects as they are static)
        // A better approach is deep clone but it's expensive per frame, so we just reset flags.
        const resetChart = DEMO_CHART.map(n => ({ ...n, hit: false, missed: false, accuracy: undefined }));
        setChart(resetChart);

        try {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                await audioRef.current.play();
                setGameStatus(GameStatus.PLAYING);
            }
        } catch (e) {
            console.error("Audio play failed", e);
        }
    }, [isCameraReady]);

    const endGame = useCallback((victory: boolean) => {
        setGameStatus(victory ? GameStatus.VICTORY : GameStatus.GAME_OVER);
        if (audioRef.current) {
            audioRef.current.pause();
        }
    }, []);

    const handleNoteHit = useCallback((noteId: string, accuracy: HitAccuracy) => {
        let points = 0;
        let vibrationStrength = 0;

        switch (accuracy) {
            case HitAccuracy.PERFECT:
                points = 115;
                vibrationStrength = 60;
                break;
            case HitAccuracy.GOOD:
                points = 100;
                vibrationStrength = 40;
                break;
            case HitAccuracy.BAD:
                points = 50;
                vibrationStrength = 20;
                break;
        }

        if (navigator.vibrate && vibrationStrength > 0) {
            navigator.vibrate(vibrationStrength);
        }

        setCombo(c => {
            const newCombo = c + 1;
            let newMult = 1;
            if (newCombo > 30) newMult = 8;
            else if (newCombo > 20) newMult = 4;
            else if (newCombo > 10) newMult = 2;

            setMultiplier(newMult);
            return newCombo;
        });

        setScore(s => s + (points * multiplier)); // using current render multiplier, close enough

        setHealth(h => Math.min(100, h + (accuracy === HitAccuracy.PERFECT ? 4 : accuracy === HitAccuracy.GOOD ? 2 : 1)));

        // Update Chart State
        setChart(prev => prev.map(n => n.id === noteId ? { ...n, hit: true, accuracy } : n));
    }, [multiplier]);

    const handleNoteMiss = useCallback((noteId: string) => {
        setCombo(0);
        setMultiplier(1);
        setHealth(h => {
            const newHealth = h - 15;
            if (newHealth <= 0) {
                // Defer state update to avoid conflicts during render
                setTimeout(() => endGame(false), 0);
                return 0;
            }
            return newHealth;
        });

        setChart(prev => prev.map(n => n.id === noteId ? { ...n, missed: true } : n));
    }, [endGame]);

    return {
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
    };
};
