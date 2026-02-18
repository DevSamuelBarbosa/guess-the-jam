// ─── YouTube API response types ───

export interface YouTubePlaylistItemSnippet {
  title: string;
  videoOwnerChannelTitle?: string;
  thumbnails?: {
    default?: { url: string };
    medium?: { url: string };
    high?: { url: string };
  };
  resourceId: {
    videoId: string;
  };
}

export interface YouTubePlaylistItem {
  snippet: YouTubePlaylistItemSnippet;
  status?: {
    privacyStatus: string;
  };
}

export interface YouTubePlaylistResponse {
  items: YouTubePlaylistItem[];
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}
