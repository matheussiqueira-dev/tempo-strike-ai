# Tempo Strike AI

<div align="center">
  <img src="https://via.placeholder.com/1200x600?text=Tempo+Strike+AI" alt="Tempo Strike AI" width="100%" />
</div>

## 🚀 Overview

**Tempo Strike AI** is a next-generation browser-based rhythm game that turns your body into the controller. Powered by **Google MediaPipe** for real-time computer vision and **Three.js** for immersive 3D graphics, players must slash through musical targets using hand gestures synchronized with the beat.

Developed with a focus on performance, accessibility, and modern web aesthetics (Cyberpunk/Glassmorphism), this project demonstrates the capabilities of modern web technologies in creating interactive, kinetic experiences without external hardware.

## 🛠️ Technology Stack

- **Core**: React 19, TypeScript
- **3D Engine**: Three.js, React Three Fiber
- **Computer Vision**: Google MediaPipe Tasks Vision (Hand Landmark Detection)
- **Styling**: Tailwind CSS (with Glassmorphism design system)
- **Build Tool**: Vite
- **State Management**: Custom React Hooks

## ✨ Key Features

- **Contactless Control**: Play using only your webcam. No VR headset or controllers required.
- **Real-time Tracking**: 60FPS hand tracking with low latency.
- **Rhythm Mechanics**: Precision-based scoring system (Perfect, Good, Miss) with combo multipliers.
- **Immersive Visuals**: Dynamic lighting, particle effects, and beat-synced environment.
- **Progressive Difficulty**: Health system and accuracy requirements.
- **Responsive Design**: Auto-scaling UI that looks premium on all desktop screens.

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/matheussiqueira-dev/chatbot-ia-api.git
   cd tempo-strike-ai-main
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Play**:
   Open [http://localhost:3000](http://localhost:3000) in your browser. Allow camera access when prompted.

> **Note**: This application requires a webcam and significantly relies on GPU performance for 3D rendering and AI inference.

## 🏗️ Architecture

The project follows a **Component-Driven Architecture** with strict Separation of Concerns:

- **`src/components/ui`**: Pure React UI components (HUD, Menus), decoupled from game logic.
- **`src/components/GameScene`**: The 3D world rendered via R3F, handling physics and visual feedback.
- **`src/hooks/useGameLogic.ts`**: A custom hook managing the game state machine (Score, Health, Game Over).
- **`src/hooks/useMediaPipe.ts`**: Encapsulated computer vision logic, exposing normalized hand coordinates.

## 🔮 Future Improvements

- [ ] **Custom Song Support**: Allow users to upload MP3s and generate charts.
- [ ] **Multiplayer Mode**: WebSocket-based score battles.
- [ ] **VR Mode**: WebXR support for headsets.
- [ ] **Gesture Customization**: Support for full-body tracking.

---

<div align="center">
  <h3>Autoria</h3>
  <p><strong>Matheus Siqueira</strong></p>
  <p>Senior Software Engineer & UI/UX Designer</p>
  <a href="https://www.matheussiqueira.dev/">website: https://www.matheussiqueira.dev/</a>
</div>
