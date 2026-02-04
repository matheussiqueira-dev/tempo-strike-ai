/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Grid, PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { GameStatus, NoteData, HandPositions, COLORS, CutDirection, HitAccuracy } from '../types';
import { PLAYER_Z, SPAWN_Z, MISS_Z, NOTE_SPEED, DIRECTION_VECTORS, LANE_X_POSITIONS, LAYER_Y_POSITIONS, SONG_BPM } from '../constants';
import Note from './Note';
import Saber from './Saber';

interface GameSceneProps {
    gameStatus: GameStatus;
    audioRef: React.RefObject<HTMLAudioElement | null>;
    handPositionsRef: React.MutableRefObject<any>;
    chart: NoteData[];
    onNoteHit: (noteId: string, accuracy: HitAccuracy) => void;
    onNoteMiss: (noteId: string) => void;
    onSongEnd: () => void;
}

const BEAT_TIME = 60 / SONG_BPM;

const GameScene: React.FC<GameSceneProps> = ({
    gameStatus,
    audioRef,
    handPositionsRef,
    chart,
    onNoteHit,
    onNoteMiss,
    onSongEnd
}) => {
    // We use key-based reset in App, or we update internal state when chart changes.
    const [notesState, setNotesState] = useState<NoteData[]>(chart);
    const [currentTime, setCurrentTime] = useState(0);

    // Reset internal state when chart prop changes (e.g. restart)
    useEffect(() => {
        setNotesState(chart);
        activeNotesRef.current = [];
        nextNoteIndexRef.current = 0;
    }, [chart]);

    const activeNotesRef = useRef<NoteData[]>([]);
    const nextNoteIndexRef = useRef(0);
    const shakeIntensity = useRef(0);
    const cameraRef = useRef<THREE.PerspectiveCamera>(null);
    const ambientLightRef = useRef<THREE.AmbientLight>(null);
    const spotLightRef = useRef<THREE.SpotLight>(null);

    const vecA = useMemo(() => new THREE.Vector3(), []);
    const vecB = useMemo(() => new THREE.Vector3(), []);

    const handleHit = (note: NoteData, accuracy: HitAccuracy) => {
        // Impact Shake
        if (accuracy === HitAccuracy.PERFECT) shakeIntensity.current = 0.5;
        else if (accuracy === HitAccuracy.GOOD) shakeIntensity.current = 0.3;
        else shakeIntensity.current = 0.1;

        onNoteHit(note.id, accuracy);
    }

    useFrame((state, delta) => {
        // --- Visual Beat Pulse ---
        if (audioRef.current && gameStatus === GameStatus.PLAYING) {
            const time = audioRef.current.currentTime;
            const beatPhase = (time % BEAT_TIME) / BEAT_TIME;
            const pulse = Math.pow(1 - beatPhase, 4);

            if (ambientLightRef.current) ambientLightRef.current.intensity = 0.1 + (pulse * 0.4);
            if (spotLightRef.current) spotLightRef.current.intensity = 0.8 + (pulse * 2.0);
            if (spotLightRef.current) spotLightRef.current.color.setHSL(0.6 + (pulse * 0.1), 0.8, 0.5);
        }

        // --- Dynamic Camera Shake ---
        if (shakeIntensity.current > 0 && cameraRef.current) {
            const shake = shakeIntensity.current;
            cameraRef.current.position.x = (Math.random() - 0.5) * shake;
            cameraRef.current.position.y = 1.8 + (Math.random() - 0.5) * shake;
            cameraRef.current.position.z = 4 + (Math.random() - 0.5) * shake;

            shakeIntensity.current = THREE.MathUtils.lerp(shakeIntensity.current, 0, 8 * delta);
            if (shakeIntensity.current < 0.01) {
                shakeIntensity.current = 0;
                cameraRef.current.position.set(0, 1.8, 4);
            }
        }

        if (gameStatus !== GameStatus.PLAYING || !audioRef.current) return;

        const time = audioRef.current.currentTime;
        setCurrentTime(time);

        if (audioRef.current.ended) {
            onSongEnd();
            return;
        }

        // --- Logic Loop ---
        const spawnAheadTime = Math.abs(SPAWN_Z - PLAYER_Z) / NOTE_SPEED;

        // 1. Spawning
        while (nextNoteIndexRef.current < notesState.length) {
            const nextNote = notesState[nextNoteIndexRef.current];
            if (nextNote.time - spawnAheadTime <= time) {
                activeNotesRef.current.push(nextNote);
                nextNoteIndexRef.current++;
            } else {
                break;
            }
        }

        // 2. Collision & Physics
        const hands = handPositionsRef.current as HandPositions;

        for (let i = activeNotesRef.current.length - 1; i >= 0; i--) {
            const note = activeNotesRef.current[i];
            if (note.hit || note.missed) continue;

            const timeDiff = note.time - time;
            const currentZ = PLAYER_Z - (timeDiff * NOTE_SPEED);

            // Missed
            if (currentZ > MISS_Z) {
                note.missed = true;
                onNoteMiss(note.id);
                activeNotesRef.current.splice(i, 1);
                continue;
            }

            // Hit Window
            if (currentZ > PLAYER_Z - 2.0 && currentZ < PLAYER_Z + 1.5) {
                if (!hands) continue;

                const handPos = note.type === 'left' ? hands.left : hands.right;
                const handVel = note.type === 'left' ? hands.leftVelocity : hands.rightVelocity;

                if (handPos && handVel) {
                    const notePos = vecA.set(
                        LANE_X_POSITIONS[note.lineIndex],
                        LAYER_Y_POSITIONS[note.lineLayer],
                        currentZ
                    );

                    // Hit detection
                    if (handPos.distanceTo(notePos) < 1.3) {
                        const speed = handVel.length();
                        let angleScore = 0;

                        if (speed < 0.4) continue; // Too slow

                        if (note.cutDirection !== CutDirection.ANY) {
                            const requiredDir = DIRECTION_VECTORS[note.cutDirection];
                            vecB.copy(handVel).normalize();
                            angleScore = vecB.dot(requiredDir);
                        } else {
                            angleScore = 1.0;
                        }

                        if (angleScore > 0.1) {
                            // Determine accuracy
                            const distanceToPerfect = Math.abs(currentZ - PLAYER_Z);
                            let accuracy = HitAccuracy.BAD;

                            if (distanceToPerfect < 0.6 && angleScore > 0.5) accuracy = HitAccuracy.PERFECT;
                            else if (distanceToPerfect < 1.2 && angleScore > 0.2) accuracy = HitAccuracy.GOOD;

                            note.hit = true;
                            note.hitTime = time;
                            note.accuracy = accuracy;

                            handleHit(note, accuracy);
                            activeNotesRef.current.splice(i, 1);
                        }
                    }
                }
            }
        }
    });

    // Render Pipeline
    // Filter active notes for React rendering optimization
    const visibleNotes = useMemo(() => {
        return notesState.filter(n =>
            !n.missed &&
            (!n.hit || (currentTime - (n.hitTime || 0) < 0.8)) &&
            (n.time - currentTime) < 5 &&
            (n.time - currentTime) > -2
        );
    }, [notesState, currentTime]);

    return (
        <>
            <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 1.8, 4]} fov={60} />
            <color attach="background" args={['#050505']} />
            <fog attach="fog" args={['#050505', 10, 50]} />

            <ambientLight ref={ambientLightRef} intensity={0.2} />
            <spotLight ref={spotLightRef} position={[0, 10, 5]} angle={0.5} penumbra={1} intensity={1} castShadow />

            <Environment preset="night" />

            {/* Modern Grid Floor */}
            <Grid position={[0, -0.1, 0]} args={[8, 100]} cellThickness={0.1} cellColor="#224488" sectionSize={5} sectionThickness={1.5} sectionColor="#4466aa" fadeDistance={60} infiniteGrid />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#02040a" roughness={0.1} metalness={0.8} />
            </mesh>

            <Stars radius={50} depth={50} count={3000} factor={4} saturation={1} fade speed={2} />

            <Saber type="left" positionRef={handPositionsRef} velocityRef={{ current: null }} /* Saber needs specialized ref handling or just pass full handPositionsRef */ />

            {/* 
         Correction: Saber component in original used separate refs for pos/vel.
         I need to construct them or update Saber to take the main ref.
         To minimize Saber changes, I'll pass simple refs that I update in useFrame.
      */}
            <SaberController handPositionsRef={handPositionsRef} />

            {visibleNotes.map(note => (
                <Note
                    key={note.id}
                    data={note}
                    zPos={PLAYER_Z - ((note.time - currentTime) * NOTE_SPEED)}
                    currentTime={currentTime}
                />
            ))}
        </>
    );
};

// Helper to bridge the Ref gap without rewriting Saber entirely if not needed
const SaberController = ({ handPositionsRef }: { handPositionsRef: any }) => {
    const lPos = useRef<THREE.Vector3 | null>(null);
    const rPos = useRef<THREE.Vector3 | null>(null);
    const lVel = useRef<THREE.Vector3 | null>(null);
    const rVel = useRef<THREE.Vector3 | null>(null);

    useFrame(() => {
        if (handPositionsRef.current) {
            lPos.current = handPositionsRef.current.left;
            rPos.current = handPositionsRef.current.right;
            lVel.current = handPositionsRef.current.leftVelocity;
            rVel.current = handPositionsRef.current.rightVelocity;
        }
    });

    return (
        <>
            <Saber type="left" positionRef={lPos} velocityRef={lVel} />
            <Saber type="right" positionRef={rPos} velocityRef={rVel} />
        </>
    )
}

export default GameScene;