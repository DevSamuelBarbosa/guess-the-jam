You are acting as a senior software architect and technical planner.

Plan the development of a web-based music guessing game built with Next.js (App Router).

Context:
- This is a local party game controlled by a single host screen.
- Players are physically present in the same environment.
- There are no player devices, no multiplayer networking, and no real-time backend.
- The application has only one UI: the host interface.
- All game state lives in frontend state.
- No WebSocket, Supabase, or database is required at this stage.

Game Setup Flow:
1. The host creates a new match.
2. The host pastes a YouTube playlist link.
3. The host creates between 1 and 3 teams (host decides the number of teams).
4. Each team has:
   - Name
   - Score (starts at 0)
5. After teams are created, an "Start Game" button becomes available.
6. When the host clicks "Start Game":
   - A 10-second countdown starts.
   - After the countdown ends, the first round begins automatically.

Game Rules:
- The game continues until the first team reaches 10 points.
- Each round is worth 1 point.
- For each round:
  - One random song from the playlist is selected (no repetition).
  - The song is played for a configurable duration:
    - The host can choose between 1, 3, or 5 seconds before starting the game.
  - After playback stops, teams can attempt to guess:
    - Song name
    - Artist/band name
- The host manually verifies if the answer is correct.
- The host selects which team is currently answering.
- If the team answers correctly:
  - That team receives 1 point.
  - If that team reaches 10 points, the game ends immediately.
  - Otherwise, the next round starts.
- If the team answers incorrectly:
  - The host can allow the next team to attempt an answer.
- The same song must not be used twice.

Technical Requirements:
- Use Next.js with React and TypeScript.
- Use the YouTube IFrame Player API for playback control.
- Handle browser autoplay restrictions properly (require initial user interaction).
- Fetch playlist data via a Next.js API route using the YouTube Data API.
- Shuffle the playlist once at the start of the game.
- Separate responsibilities clearly:
  - Game logic
  - UI components
  - YouTube integration
  - Utility functions

Planning Goals:
Produce a detailed technical plan that includes:
1. Project architecture and folder structure
2. Core React components and their responsibilities
3. Game state model (types/interfaces)
4. State machine or flow for:
   - Game setup
   - Countdown
   - Round lifecycle
   - Scoring
   - Game end condition (first team to 10 points)
5. YouTube integration strategy
6. Playlist fetching, validation, and shuffling strategy
7. Host UI/UX flow
8. Edge cases (invalid playlist link, short playlists, autoplay issues, playlist shorter than required)
9. Suggested incremental development steps (MVP → polished version)

Do NOT write code yet.
Only produce a clear, structured development plan using sections and bullet points.
