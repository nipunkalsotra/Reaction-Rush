📋 Table of Contents

About
Features
Demo
Technologies
Installation
How to Play
Game Mechanics
Project Structure
Technical Highlights
Screenshots
Future Enhancements
Contributing
License
Contact


🎯 About
Reaction Rush is an interactive web-based game designed to test and improve your reflexes. Built as an end-term college project, it demonstrates advanced frontend development concepts including event-driven programming, state management, real-time UI updates, and complex game logic—all using pure Vanilla JavaScript without any frameworks.
The game challenges players to click on randomly appearing targets before they disappear, with increasing difficulty levels and a rewarding combo system that keeps players engaged.

✨ Features
Core Gameplay

🎯 Dynamic Target Spawning - Targets appear randomly on screen
⏱️ 60-Second Countdown - Race against time
🔥 Combo System - Build streaks for bonus points
🎚️ 3 Difficulty Levels - Easy, Medium, and Hard
🏆 Persistent Leaderboard - Top 10 scores saved locally
🎵 Sound Effects - Audio feedback with mute toggle

Technical Features

📱 Fully Responsive - Works on mobile, tablet, and desktop
🎨 Smooth Animations - CSS transitions and keyframe animations
💾 LocalStorage Integration - Persistent game data
⌨️ Keyboard Controls - ESC key for pause/resume
🎮 State Management - Clean game state transitions
🔊 Web Audio API - Dynamic sound generation


🎬 Demo
🎮 Live Demo

Note: Replace with your actual GitHub Pages URL once deployed

Quick Start
bash# Clone the repository
git clone https://github.com/yourusername/reaction-rush.git

# Navigate to project directory
cd reaction-rush

# Open in browser
open index.html

🛠️ Technologies
This project is built with:

HTML5 - Semantic structure
CSS3 - Modern styling with Flexbox, Grid, and animations
Vanilla JavaScript (ES6+) - Game logic and DOM manipulation
Web Audio API - Sound effects
LocalStorage API - Data persistence

No frameworks. No libraries. No build tools required.

📥 Installation
Prerequisites

Any modern web browser (Chrome, Firefox, Safari, Edge)
No additional software needed!

Steps

Clone the repository

bash   git clone https://github.com/yourusername/reaction-rush.git

Navigate to the project folder

bash   cd reaction-rush

Open the game

Double-click index.html, or
Right-click → Open with → Your Browser, or
Use a local server (optional):



bash     # Using Python 3
     python -m http.server 8000
     
     # Using Node.js (http-server)
     npx http-server

Start playing! 🎮


🎮 How to Play
Objective
Click on as many targets as possible within 60 seconds to achieve the highest score!
Controls

🖱️ Mouse Click - Hit targets
⌨️ ESC Key - Pause/Resume game
🔊 Sound Toggle - Click the speaker icon

Game Rules

Hit Targets - Click red circular targets before they disappear
Build Combos - Hit 3+ consecutive targets for bonus multipliers
Avoid Penalties

Missed target: -5 points + combo reset
Wrong click (empty space): -3 points + combo reset


Race Against Time - 60 seconds to maximize your score

Difficulty Levels
LevelTarget DurationSpawn SpeedPoints per Hit🟢 Easy2.5 seconds1.5s interval10 points🟡 Medium1.5 seconds1.0s interval20 points🔴 Hard1.0 second0.7s interval30 points

⚙️ Game Mechanics
Scoring System
javascriptBase Score = Difficulty Points (10/20/30)

Combo Multiplier:
- 3-5 hits: 2x multiplier
- 6-8 hits: 3x multiplier
- 9+ hits: 4x multiplier

Final Score = Base Score × Combo Multiplier
```

### State Machine
```
┌─────────┐
│  IDLE   │ ──start──> ┌─────────┐
└─────────┘            │ PLAYING │
     ^                 └─────────┘
     │                      │
     │                  pause/resume
     │                      │
  quit/menu            ┌────────┐
     │                 │ PAUSED │
     │                 └────────┘
     │                      │
┌──────────┐           time=0
│ GAMEOVER │ <────────────┘
└──────────┘
```

### Event Flow
1. **Target Spawn** → `setInterval()` creates targets at difficulty intervals
2. **Click Detection** → Event listener captures hit/miss
3. **Score Calculation** → Updates GameState with combo logic
4. **UI Update** → `updateDisplay()` syncs visuals
5. **Auto-removal** → `setTimeout()` removes missed targets

---
