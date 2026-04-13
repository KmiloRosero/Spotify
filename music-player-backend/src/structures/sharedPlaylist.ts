import { DoublyLinkedList } from './DoublyLinkedList';
import type { Song } from '../models/Song';

export const sharedPlaylist = new DoublyLinkedList<Song>();
