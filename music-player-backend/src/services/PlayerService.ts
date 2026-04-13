import { PlayerStatus } from '../models/PlayerStatus';
import { AppError } from '../middlewares/errorHandler';
import type { IPlaylistService } from './PlaylistService';
import { PlaylistService } from './PlaylistService';

export interface IPlayerService {
  play(): PlayerStatus;
  pause(): PlayerStatus;
  stop(): PlayerStatus;
  getStatus(): PlayerStatus;
  isPlaying(): boolean;
}

export class CannotPlayError extends AppError {
  constructor() {
    super('Cannot play: no current song selected', 400);
    this.name = 'CannotPlayError';
  }
}

export class CannotPauseError extends AppError {
  constructor() {
    super('Cannot pause: player is not playing', 400);
    this.name = 'CannotPauseError';
  }
}

export class PlayerService implements IPlayerService {
  private status: PlayerStatus = PlayerStatus.STOPPED;
  private readonly playlistService: IPlaylistService;

  constructor(playlistService: IPlaylistService = new PlaylistService()) {
    this.playlistService = playlistService;
  }

  public play(): PlayerStatus {
    const currentSong = this.playlistService.getCurrentSong();
    if (!currentSong) {
      throw new CannotPlayError();
    }

    this.status = PlayerStatus.PLAYING;
    return this.status;
  }

  public pause(): PlayerStatus {
    if (this.status !== PlayerStatus.PLAYING) {
      throw new CannotPauseError();
    }

    this.status = PlayerStatus.PAUSED;
    return this.status;
  }

  public stop(): PlayerStatus {
    this.status = PlayerStatus.STOPPED;
    return this.status;
  }

  public getStatus(): PlayerStatus {
    return this.status;
  }

  public isPlaying(): boolean {
    return this.status === PlayerStatus.PLAYING;
  }
}
