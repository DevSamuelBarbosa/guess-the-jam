const DEFAULT_DAILY_LIMIT = 10_000;
const DEFAULT_SOFT_STOP_RATIO = 0.9;

interface QuotaState {
  dayKey: string;
  unitsUsed: number;
}

export class YouTubeQuotaGuardError extends Error {
  status = 429;

  constructor(message = "YouTube API daily quota is close to the limit. Try again later.") {
    super(message);
    this.name = "YouTubeQuotaGuardError";
  }
}

let quotaState: QuotaState = {
  dayKey: getUtcDayKey(),
  unitsUsed: 0,
};

function getUtcDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function normalizeState() {
  const dayKey = getUtcDayKey();
  if (quotaState.dayKey !== dayKey) {
    quotaState = { dayKey, unitsUsed: 0 };
  }

  return quotaState;
}

function getDailyLimit() {
  const parsed = Number(process.env.YOUTUBE_DAILY_QUOTA_LIMIT);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_DAILY_LIMIT;
}

function getSoftStopRatio() {
  const parsed = Number(process.env.YOUTUBE_DAILY_QUOTA_SOFT_STOP_RATIO);
  return Number.isFinite(parsed) && parsed > 0 && parsed <= 1
    ? parsed
    : DEFAULT_SOFT_STOP_RATIO;
}

export function getQuotaSnapshot() {
  const state = normalizeState();
  const dailyLimit = getDailyLimit();
  const softStopRatio = getSoftStopRatio();
  const stopAt = Math.max(1, Math.floor(dailyLimit * softStopRatio));

  return {
    dayKey: state.dayKey,
    unitsUsed: state.unitsUsed,
    dailyLimit,
    softStopRatio,
    stopAt,
    remainingUntilStop: Math.max(0, stopAt - state.unitsUsed),
  };
}

export function assertQuotaAvailable(units = 1) {
  const snapshot = getQuotaSnapshot();

  if (snapshot.unitsUsed + units > snapshot.stopAt) {
    throw new YouTubeQuotaGuardError(
      `YouTube API daily quota protection is active (${snapshot.unitsUsed}/${snapshot.dailyLimit} units used). Try again later.`
    );
  }
}

export function registerQuotaUsage(units = 1) {
  const state = normalizeState();
  state.unitsUsed += units;
}