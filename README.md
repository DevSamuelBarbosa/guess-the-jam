# 🎵 Guess the Jam

A local party music guessing game built with Next.js. One host screen, multiple teams, and a YouTube playlist — guess the song title and artist to score points!

## How It Works

1. **Setup** — The host pastes a YouTube playlist link, creates up to 3 teams, and picks a playback duration (1, 3, or 5 seconds).
2. **Countdown** — A 10-second countdown builds the hype before the game begins.
3. **Rounds** — Each round plays a random song snippet from the playlist. Teams take turns guessing the song name and artist.
4. **Scoring** — The host verifies answers manually. A correct guess earns 1 point; an incorrect guess passes the chance to the next team.
5. **Winning** — The first team to reach **10 points** wins the game!

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router) with React 19 & TypeScript
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) components
- **Music Playback:** YouTube IFrame Player API
- **Playlist Data:** YouTube Data API (fetched via a Next.js API route)
- **Icons:** [Lucide React](https://lucide.dev)

## Getting Started

### Prerequisites

- Node.js 18+
- A [YouTube Data API key](https://console.cloud.google.com/apis/library/youtube.googleapis.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/guess-the-jam.git
cd guess-the-jam

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
YOUTUBE_API_KEY=your_youtube_data_api_key_here
YOUTUBE_DAILY_QUOTA_LIMIT=10000
YOUTUBE_DAILY_QUOTA_SOFT_STOP_RATIO=0.9
```

`YOUTUBE_DAILY_QUOTA_LIMIT` and `YOUTUBE_DAILY_QUOTA_SOFT_STOP_RATIO` are optional.
They enable a server-side safety stop before the YouTube Data API daily quota is exhausted.
Example: with `0.9`, the app stops new playlist loads after ~90% of the daily quota.

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
  layout.tsx          # Root layout
  page.tsx            # Entry point — renders GameShell
  api/playlist/       # API route to fetch & cache YouTube playlist data
components/
  game/               # Game phase components (Setup, Countdown, Round, GameOver, etc.)
  ui/                 # Reusable UI components (shadcn/ui)
  youtube/            # YouTube player wrapper
hooks/                # Custom hooks (countdown timer, game reducer, YouTube player)
lib/
  game/               # Game constants, state types, reducer, selectors
  utils/              # Utility functions (shuffle, etc.)
  youtube/            # YouTube playlist fetching & URL parsing
```

## Game Rules

- The playlist must contain at least **10 songs**.
- Songs are shuffled once at the start and are never repeated.
- Playback duration is configurable: **1s**, **3s** (default), or **5s**.
- Up to **3 teams** can play.
- The host controls the entire flow from a single screen — no player devices needed.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Run the production server |
| `npm run lint` | Run ESLint |

## Deployment

Deploy easily on [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme):

1. Push the repo to GitHub.
2. Import the project on Vercel.
3. Add the `YOUTUBE_API_KEY` environment variable in the Vercel dashboard.

## License

This project is private and not currently licensed for redistribution.
