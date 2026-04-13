import type { PlayerStatusDTO } from '../dtos/PlayerStatusDTO';
import type { SongDTO } from '../dtos/SongDTO';
import type { Song } from '../models/Song';
import { PlayerStatus } from '../models/PlayerStatus';
import { HistoryService, type IHistoryService } from '../services/HistoryService';
import { PlayerService, type IPlayerService } from '../services/PlayerService';
import { PlaylistService, type IPlaylistService } from '../services/PlaylistService';
import { SongService, type ISongService } from '../services/SongService';

export class MusicPlayerFacade {
  private readonly songService: ISongService;
  private readonly playlistService: IPlaylistService;
  private readonly playerService: IPlayerService;
  private readonly historyService: IHistoryService;

  constructor(
    songService: ISongService = new SongService(),
    playlistService: IPlaylistService = new PlaylistService(),
    playerService: IPlayerService = new PlayerService(playlistService),
    historyService: IHistoryService = new HistoryService(),
  ) {
    this.songService = songService;
    this.playlistService = playlistService;
    this.playerService = playerService;
    this.historyService = historyService;
  }

  public addSong(dto: SongDTO, position?: number): SongDTO {
    const wasEmpty = this.songService.getAllSongs().length === 0;
    const song = this.songService.addSong(dto, position);

    if (wasEmpty) {
      this.playlistService.resetCurrent();
    }

    return this.toSongDTO(song);
  }

  public removeSong(id: number): boolean {
    const current = this.playlistService.getCurrentSong();
    const wasCurrent = current?.id === id;

    const nextCandidate = wasCurrent ? this.playlistService.moveToNext() : null;
    const nextCandidateId = nextCandidate?.id;

    const removed = this.songService.removeSong(id);

    this.playlistService.resetCurrent();

    if (wasCurrent && nextCandidateId !== undefined && nextCandidateId !== id) {
      try {
        this.playlistService.setCurrentSong(nextCandidateId);
      } catch {}
    }

    return removed;
  }

  public play(): PlayerStatusDTO {
    const currentSong = this.playlistService.getCurrentSong();
    this.playerService.play();
    if (currentSong) {
      this.historyService.recordPlay(currentSong);
    }
    return this.buildStatusDTO();
  }

  public pause(): PlayerStatusDTO {
    this.playerService.pause();
    this.playlistService.getCurrentSong();
    return this.buildStatusDTO();
  }

  public next(): PlayerStatusDTO {
    const wasPlaying = this.playerService.getStatus() === PlayerStatus.PLAYING;
    const nextSong = this.playlistService.moveToNext();

    this.playerService.getStatus();

    if (wasPlaying && nextSong) {
      this.playerService.play();
      this.historyService.recordPlay(nextSong);
    }

    return this.buildStatusDTO();
  }

  public previous(): PlayerStatusDTO {
    const wasPlaying = this.playerService.getStatus() === PlayerStatus.PLAYING;
    const prevSong = this.playlistService.moveToPrevious();

    this.playerService.getStatus();

    if (wasPlaying && prevSong) {
      this.playerService.play();
      this.historyService.recordPlay(prevSong);
    }

    return this.buildStatusDTO();
  }

  public getCurrentSong(): SongDTO | null {
    this.playerService.getStatus();
    const current = this.playlistService.getCurrentSong();
    return current ? this.toSongDTO(current) : null;
  }

  public getPlaylist(): { songs: SongDTO[]; total: number; currentIndex: number } {
    const songs = this.songService.getAllSongs();
    const currentIndex = this.playlistService.getCurrentIndex();
    return { songs: songs.map((s) => this.toSongDTO(s)), total: songs.length, currentIndex };
  }

  public getHistory(): SongDTO[] {
    this.playerService.getStatus();
    const history = this.historyService.getHistory();
    return history.map((s) => this.toSongDTO(s));
  }

  public setCurrentSong(id: number): PlayerStatusDTO {
    this.playlistService.setCurrentSong(id);
    this.playerService.stop();
    return this.buildStatusDTO();
  }

  public stop(): PlayerStatusDTO {
    this.playerService.stop();
    this.playlistService.getCurrentSong();
    return this.buildStatusDTO();
  }

  private buildStatusDTO(): PlayerStatusDTO {
    const status = this.playerService.getStatus();
    const currentSong = this.playlistService.getCurrentSong();
    const totalSongs = this.songService.getAllSongs().length;

    return {
      status: status as unknown as string,
      currentSong: currentSong ? this.toSongDTO(currentSong) : null,
      totalSongs,
    };
  }

  private toSongDTO(song: Song): SongDTO {
    return {
      id: song.id,
      title: song.title,
      artist: song.artist,
      duration: song.duration,
      audioUrl: song.audioUrl,
      coverUrl: song.coverUrl,
    };
  }
}
