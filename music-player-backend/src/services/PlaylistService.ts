import type { Song } from '../models/Song';
import { AppError } from '../middlewares/errorHandler';
import type { ListNode } from '../structures/Node';
import { sharedPlaylist } from '../structures/sharedPlaylist';

export interface IPlaylistService {
  getCurrentSong(): Song | null;
  setCurrentSong(id: number): Song;
  moveToNext(): Song | null;
  moveToPrevious(): Song | null;
  resetCurrent(): void;
  getCurrentIndex(): number;
}

export interface IPlaylistTraversal<T> {
  getHead(): ListNode<T> | null;
  getTail(): ListNode<T> | null;
  getLength(): number;
}

export class SongNotFoundError extends AppError {
  constructor(id: number) {
    super(`Song with id ${id} not found`, 404);
    this.name = 'SongNotFoundError';
  }
}

export class PlaylistService implements IPlaylistService {
  private readonly playlist: IPlaylistTraversal<Song>;
  private currentNode: ListNode<Song> | null = null;

  constructor(playlist: IPlaylistTraversal<Song> = sharedPlaylist) {
    this.playlist = playlist;
  }

  public getCurrentSong(): Song | null {
    const head = this.playlist.getHead();
    if (!head) return null;

    if (!this.currentNode) {
      this.currentNode = head;
    }
    return this.currentNode.data;
  }

  public setCurrentSong(id: number): Song {
    const node = this.findNodeById(id);
    if (!node) {
      throw new SongNotFoundError(id);
    }
    this.currentNode = node;
    return node.data;
  }

  public moveToNext(): Song | null {
    const head = this.playlist.getHead();
    const tail = this.playlist.getTail();
    if (!head || !tail) return null;

    if (!this.currentNode) {
      this.currentNode = head;
      return this.currentNode.data;
    }

    this.currentNode = this.currentNode.next ?? head;
    return this.currentNode.data;
  }

  public moveToPrevious(): Song | null {
    const head = this.playlist.getHead();
    const tail = this.playlist.getTail();
    if (!head || !tail) return null;

    if (!this.currentNode) {
      this.currentNode = head;
      return this.currentNode.data;
    }

    this.currentNode = this.currentNode.prev ?? tail;
    return this.currentNode.data;
  }

  public resetCurrent(): void {
    this.currentNode = this.playlist.getHead();
  }

  public getCurrentIndex(): number {
    const head = this.playlist.getHead();
    if (!head || !this.currentNode) return -1;

    let index = 0;
    let node: ListNode<Song> | null = head;
    while (node) {
      if (node === this.currentNode) return index;
      node = node.next;
      index += 1;
    }

    return -1;
  }

  private findNodeById(id: number): ListNode<Song> | null {
    const head = this.playlist.getHead();
    if (!head) return null;

    let node: ListNode<Song> | null = head;
    while (node) {
      if (node.data.id === id) return node;
      node = node.next;
    }
    return null;
  }
}
