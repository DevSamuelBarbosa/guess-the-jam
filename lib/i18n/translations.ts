export type Locale = "en" | "pt-BR";

export const translations = {
  en: {
    // Menu
    lightMode: "Light mode",
    darkMode: "Dark mode",
    language: "Português (BR)",
    howToPlay: "How to play",
    exitMatch: "Exit Match",
    menu: "Menu",

    // Help dialog
    helpTitle: "How to play 🎶",
    helpStep1Title: "1. Set up the match",
    helpStep1Desc:
      "Paste a YouTube playlist link, set the number of teams, and choose the snippet duration for each song.",
    helpStep2Title: "2. Listen to the snippet",
    helpStep2Desc:
      "Each round, a short snippet of a song will play. Teams must pay attention and try to recognize the song from just that snippet!",
    helpStep3Title: "3. Guess the song",
    helpStep3Desc:
      "After the snippet, teams get a chance to answer. The host picks which team answers first. The team has 15 seconds to discuss and give their answer. If they get it wrong, other teams can try.",
    helpStep4Title: "4. Score and win",
    helpStep4Desc:
      "The team that guesses correctly earns points. The first team to reach the target score wins the match!",
    helpGotIt: "Got it!",

    // Exit match dialog
    exitMatchTitle: "Exit match?",
    exitMatchDesc:
      "Are you sure you want to leave the current match? Your progress will be lost.",
    cancel: "Cancel",

    // Setup
    guessTheJam: "Guess the Jam",
    playlist: "Playlist",
    playlistPlaceholder: "Paste a YouTube playlist link…",
    loading: "Loading…",
    load: "Load",
    songsLoaded: (n: number) => `✓ ${n} songs loaded`,
    teams: "Teams",
    teamPlaceholder: "Team name…",
    add: "Add",
    addTeamHint: "Add at least 1 team to start.",
    playbackDuration: "Playback Duration",
    secondsPerSong: "Seconds per song:",
    startGame: "Start Game",

    // Countdown
    getReady: "Get ready…",

    // Round
    roundOf: (current: number, total: number) => `Round ${current} of ${total}`,
    listening: "🎵 Listening…",
    snippetPlaying: (s: number) => `${s}s snippet playing`,
    answer: "Answer",
    song: "Song:",
    artistBand: "Artist/band:",

    // Round result
    nextRoundIn: "Next round in…",
    teamGotIt: (name: string) => `✓ ${name} got it!`,
    nobodyGotIt: "Nobody got it this round.",
    theAnswerWas: "The answer was:",
    revealAnswer: "Reveal answer",
    nextRound: "Next Round →",

    // Team answer panel
    whichTeamAnswering: "Which team is answering?",
    timeLeft: "Time left",
    correct: "Correct ✓",
    wrong: "Wrong ✗",
    allTeamsAttempted: "All teams attempted. No one got it!",

    // Game over
    gameOver: "Game Over!",
    wonWith: (score: number) => `Won with ${score} points!`,
    finalScores: "Final Scores",
    playAgainSamePlaylist: "Play again with the same playlist",
    playAgainNewPlaylist: "Play again with a new playlist",

    // Scoreboard
    scoreboard: "Scoreboard",
  },
  "pt-BR": {
    // Menu
    lightMode: "Modo claro",
    darkMode: "Modo escuro",
    language: "English",
    howToPlay: "Como jogar",
    exitMatch: "Sair da partida",
    menu: "Menu",

    // Help dialog
    helpTitle: "Como jogar 🎶",
    helpStep1Title: "1. Configure a partida",
    helpStep1Desc:
      "Cole o link de uma playlist do YouTube, defina o número de times e a duração do trecho de cada música.",
    helpStep2Title: "2. Ouça o trecho",
    helpStep2Desc:
      "A cada rodada, um trecho de uma música será reproduzido. Os times devem prestar atenção e tentar reconhecer a música apenas por esse trecho!",
    helpStep3Title: "3. Adivinhe a música",
    helpStep3Desc:
      "Após o trecho, os times têm a chance de responder. O apresentador marca qual time irá responder primeiro. O time tem 15 segundos para discutir e dar sua resposta. Caso erre, outros times podem tentar responder.",
    helpStep4Title: "4. Pontue e vença",
    helpStep4Desc:
      "O time que acertar ganha pontos. O primeiro time a atingir a pontuação alvo vence a partida!",
    helpGotIt: "Entendi!",

    // Exit match dialog
    exitMatchTitle: "Sair da partida?",
    exitMatchDesc:
      "Tem certeza de que deseja sair da partida atual? Todo o progresso será perdido.",
    cancel: "Cancelar",

    // Setup
    guessTheJam: "Guess the Jam",
    playlist: "Playlist",
    playlistPlaceholder: "Cole o link de uma playlist do YouTube…",
    loading: "Carregando…",
    load: "Carregar",
    songsLoaded: (n: number) => `✓ ${n} músicas carregadas`,
    teams: "Times",
    teamPlaceholder: "Nome do time…",
    add: "Adicionar",
    addTeamHint: "Adicione pelo menos 1 time para começar.",
    playbackDuration: "Duração do Trecho",
    secondsPerSong: "Segundos por música:",
    startGame: "Iniciar Jogo",

    // Countdown
    getReady: "Preparem-se…",

    // Round
    roundOf: (current: number, total: number) =>
      `Rodada ${current} de ${total}`,
    listening: "🎵 Ouvindo…",
    snippetPlaying: (s: number) => `Trecho de ${s}s tocando`,
    answer: "Resposta",
    song: "Música:",
    artistBand: "Artista/banda:",

    // Round result
    nextRoundIn: "Próxima rodada em…",
    teamGotIt: (name: string) => `✓ ${name} acertou!`,
    nobodyGotIt: "Ninguém acertou nesta rodada.",
    theAnswerWas: "A resposta era:",
    revealAnswer: "Revelar resposta",
    nextRound: "Próxima Rodada →",

    // Team answer panel
    whichTeamAnswering: "Qual time vai responder?",
    timeLeft: "Tempo restante",
    correct: "Correto ✓",
    wrong: "Errado ✗",
    allTeamsAttempted: "Todos os times tentaram. Ninguém acertou!",

    // Game over
    gameOver: "Fim de Jogo!",
    wonWith: (score: number) => `Venceu com ${score} pontos!`,
    finalScores: "Placar Final",
    playAgainSamePlaylist: "Jogar novamente com a mesma playlist",
    playAgainNewPlaylist: "Jogar novamente com outra playlist",

    // Scoreboard
    scoreboard: "Placar",
  },
} as const;

export type TranslationKeys = keyof (typeof translations)["en"];
