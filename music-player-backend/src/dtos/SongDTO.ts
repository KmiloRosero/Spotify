export interface SongDTO {
  id?: number;
  title: string;
  artist: string;
  duration: number;
  position?: number;
  audioUrl?: string;
  coverUrl?: string;
}
