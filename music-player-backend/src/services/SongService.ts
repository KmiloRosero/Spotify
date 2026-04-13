import type { SongDTO } from '../dtos/SongDTO';
import type { Song } from '../models/Song';
import { AppError } from '../middlewares/errorHandler';
import { sharedPlaylist } from '../structures/sharedPlaylist';

export interface ISongService {
  addSong(dto: SongDTO, position?: number): Song;
  removeSong(id: number): boolean;
  getAllSongs(): Song[];
  findSongById(id: number): Song | null;
  validateNoDuplicate(title: string, artist: string): void;
}

export class SongNotFoundError extends AppError {
  constructor(id: number) {
    super(`Song with id ${id} not found`, 404);
    this.name = 'SongNotFoundError';
  }
}

export class DuplicateSongError extends AppError {
  constructor(title: string, artist: string) {
    super(`Duplicate song: '${title}' by '${artist}' already exists`, 409);
    this.name = 'DuplicateSongError';
  }
}

export class PositionOutOfBoundsError extends AppError {
  constructor(position: number) {
    super(`Position ${position} is out of bounds`, 400);
    this.name = 'PositionOutOfBoundsError';
  }
}

export interface IPlaylistStorage<T> {
  addFirst(data: T): void;
  addLast(data: T): void;
  insertAt(index: number, data: T): void;
  deleteById(id: number): void;
  getAll(): T[];
  getLength(): number;
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

function assertNonEmptyString(value: unknown, fieldName: string): asserts value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new AppError(`${fieldName} is required`, 400);
  }
}

function assertPositiveNumber(value: unknown, fieldName: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new AppError(`${fieldName} must be a positive number`, 400);
  }
}

export class SongService implements ISongService {
  private readonly playlist: IPlaylistStorage<Song>;

  constructor(playlist: IPlaylistStorage<Song> = sharedPlaylist) {
    this.playlist = playlist;
  }

  public addSong(dto: SongDTO, position?: number): Song {
    assertNonEmptyString(dto.title, 'title');
    assertNonEmptyString(dto.artist, 'artist');
    assertPositiveNumber(dto.duration, 'duration');

    const resolvedPosition = position ?? dto.position;
    if (
      resolvedPosition !== undefined &&
      (!Number.isInteger(resolvedPosition) || resolvedPosition < 0)
    ) {
      throw new PositionOutOfBoundsError(resolvedPosition);
    }

    this.validateNoDuplicate(dto.title, dto.artist);

    const song: Song = {
      id: dto.id ?? this.generateId(),
      title: dto.title.trim(),
      artist: dto.artist.trim(),
      duration: dto.duration,
      audioUrl: dto.audioUrl?.trim() ?? '',
      coverUrl: dto.coverUrl?.trim() ?? '',
    };

    const length = this.playlist.getLength();

    if (resolvedPosition === 0) {
      this.playlist.addFirst(song);
      return song;
    }

    if (resolvedPosition === undefined || resolvedPosition >= length) {
      this.playlist.addLast(song);
      return song;
    }

    this.playlist.insertAt(resolvedPosition, song);
    return song;
  }

  public removeSong(id: number): boolean {
    const existing = this.findSongById(id);
    if (!existing) {
      throw new SongNotFoundError(id);
    }

    try {
      this.playlist.deleteById(id);
    } catch {
      throw new SongNotFoundError(id);
    }

    return true;
  }

  public getAllSongs(): Song[] {
    return this.playlist.getAll();
  }

  public findSongById(id: number): Song | null {
    const all = this.playlist.getAll();
    return all.find((s) => s.id === id) ?? null;
  }

  public validateNoDuplicate(title: string, artist: string): void {
    const titleKey = normalizeKey(title);
    const artistKey = normalizeKey(artist);
    const all = this.playlist.getAll();

    const duplicate = all.some(
      (s) => normalizeKey(s.title) === titleKey && normalizeKey(s.artist) === artistKey,
    );

    if (duplicate) {
      throw new DuplicateSongError(title.trim(), artist.trim());
    }
  }

  private generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1_000_000);
  }
}
