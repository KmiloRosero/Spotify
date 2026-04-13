export interface Song {
  id: number;
  title: string;
  artist: string;
  duration: number;
  audioUrl?: string;
  coverUrl?: string;
}

export interface SongDTO {
  title: string;
  artist: string;
  duration: number;
  position?: number;
  audioUrl?: string;
  coverUrl?: string;
}
