import type { SongDTO } from './SongDTO';

export interface PlayerStatusDTO {
  status: string;
  currentSong: SongDTO | null;
  totalSongs: number;
}
