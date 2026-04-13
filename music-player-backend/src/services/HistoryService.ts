import type { Song } from '../models/Song';

export interface IHistoryService {
  recordPlay(song: Song): void;
  getHistory(): Song[];
  clearHistory(): void;
  getLastPlayed(): Song | null;
}

export class HistoryService implements IHistoryService {
  private readonly history: Song[] = [];
  private readonly maxSize = 50;

  public recordPlay(song: Song): void {
    this.history.unshift(song);
    if (this.history.length > this.maxSize) {
      this.history.length = this.maxSize;
    }
  }

  public getHistory(): Song[] {
    return [...this.history];
  }

  public clearHistory(): void {
    this.history.length = 0;
  }

  public getLastPlayed(): Song | null {
    return this.history[0] ?? null;
  }
}
