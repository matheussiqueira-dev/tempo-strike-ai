/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef } from 'react';
import { HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { COLORS } from '../types';

interface WebcamPreviewProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    resultsRef: React.MutableRefObject<HandLandmarkerResult | null>;
    isCameraReady: boolean;
}

const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8], // Index
    [0, 9], [9, 10], [10, 11], [11, 12], // Middle
    [0, 13], [13, 14], [14, 15], [15, 16], // Ring
    [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
    [5, 9], [9, 13], [13, 17], [0, 5], [0, 17] // Palm
];

const WebcamPreview: React.FC<WebcamPreviewProps> = ({ videoRef, resultsRef, isCameraReady }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!isCameraReady) return;
        let animationFrameId: number;

        const render = () => {
            const canvas = canvasRef.current;
            const video = videoRef.current;

            if (canvas && video && video.readyState >= 2) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
                    if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;

                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Draw Video (Mirrored & Desaturated for HUD look)
                    ctx.save();
                    ctx.scale(-1, 1);
                    ctx.translate(-canvas.width, 0);
                    ctx.filter = 'grayscale(30%) contrast(1.1)'; // Cool effect
                    ctx.globalAlpha = 0.6;
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    ctx.restore();
                    ctx.globalAlpha = 1.0;
                    ctx.filter = 'none';

                    // Draw Landmarks
                    if (resultsRef.current && resultsRef.current.landmarks) {
                        for (let i = 0; i < resultsRef.current.landmarks.length; i++) {
                            const landmarks = resultsRef.current.landmarks[i];
                            const handInfo = resultsRef.current.handedness[i];
                            if (!handInfo || !handInfo[0]) continue;

                            const isRight = handInfo[0].categoryName === 'Right';
                            const color = isRight ? COLORS.right : COLORS.left;
                            const glowColor = isRight ? 'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)';

                            ctx.strokeStyle = color;
                            ctx.fillStyle = color;
                            ctx.lineWidth = 2;
                            ctx.lineCap = 'round';
                            ctx.lineJoin = 'round';

                            // Add glow
                            ctx.shadowBlur = 10;
                            ctx.shadowColor = glowColor;

                            ctx.beginPath();
                            for (const [start, end] of HAND_CONNECTIONS) {
                                const p1 = landmarks[start];
                                const p2 = landmarks[end];
                                ctx.moveTo((1 - p1.x) * canvas.width, p1.y * canvas.height);
                                ctx.lineTo((1 - p2.x) * canvas.width, p2.y * canvas.height);
                            }
                            ctx.stroke();

                            // Reset shadow for performance if needed, but here looks good

                            // Highlight Index Tip (Saber)
                            const tip = landmarks[8];
                            ctx.beginPath();
                            ctx.fillStyle = '#fff';
                            ctx.arc((1 - tip.x) * canvas.width, tip.y * canvas.height, 6, 0, 2 * Math.PI);
                            ctx.fill();
                        }
                    }
                }
            }
            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [isCameraReady, videoRef, resultsRef]);

    if (!isCameraReady) return null;

    return (
        <div className="fixed bottom-6 right-6 w-72 h-48 bg-black/80 rounded-2xl overflow-hidden border border-white/10 z-50 pointer-events-none shadow-2xl">
            <div className="absolute top-2 left-3 z-10 flex check-start gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[10px] font-mono text-white/50 tracking-widest uppercase">Live Feed</span>
            </div>
            <canvas ref={canvasRef} className="w-full h-full object-cover opacity-80" />

            {/* Tech decoration lines */}
            <div className="absolute inset-0 pointer-events-none border-2 border-transparent border-t-white/5 border-b-white/5"></div>
        </div>
    );
};

export default WebcamPreview;
