import type { Song } from './Song';

export type PlayerStatus = 'PLAYING' | 'PAUSED' | 'STOPPED';

export interface PlayerState {
  status: PlayerStatus;
  currentSong: Song | null;
  totalSongs: number;
}

export interface PlaylistResponse {
  songs: Song[];
  total: number;
  currentIndex: number;
}
