"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaylistService = exports.SongNotFoundError = void 0;
const errorHandler_1 = require("../middlewares/errorHandler");
const sharedPlaylist_1 = require("../structures/sharedPlaylist");
class SongNotFoundError extends errorHandler_1.AppError {
    constructor(id) {
        super(`Song with id ${id} not found`, 404);
        this.name = 'SongNotFoundError';
    }
}
exports.SongNotFoundError = SongNotFoundError;
class PlaylistService {
    constructor(playlist = sharedPlaylist_1.sharedPlaylist) {
        this.currentNode = null;
        this.playlist = playlist;
    }
    getCurrentSong() {
        const head = this.playlist.getHead();
        if (!head)
            return null;
        if (!this.currentNode) {
            this.currentNode = head;
        }
        return this.currentNode.data;
    }
    setCurrentSong(id) {
        const node = this.findNodeById(id);
        if (!node) {
            throw new SongNotFoundError(id);
        }
        this.currentNode = node;
        return node.data;
    }
    moveToNext() {
        const head = this.playlist.getHead();
        const tail = this.playlist.getTail();
        if (!head || !tail)
            return null;
        if (!this.currentNode) {
            this.currentNode = head;
            return this.currentNode.data;
        }
        this.currentNode = this.currentNode.next ?? head;
        return this.currentNode.data;
    }
    moveToPrevious() {
        const head = this.playlist.getHead();
        const tail = this.playlist.getTail();
        if (!head || !tail)
            return null;
        if (!this.currentNode) {
            this.currentNode = head;
            return this.currentNode.data;
        }
        this.currentNode = this.currentNode.prev ?? tail;
        return this.currentNode.data;
    }
    resetCurrent() {
        this.currentNode = this.playlist.getHead();
    }
    getCurrentIndex() {
        const head = this.playlist.getHead();
        if (!head || !this.currentNode)
            return -1;
        let index = 0;
        let node = head;
        while (node) {
            if (node === this.currentNode)
                return index;
            node = node.next;
            index += 1;
        }
        return -1;
    }
    findNodeById(id) {
        const head = this.playlist.getHead();
        if (!head)
            return null;
        let node = head;
        while (node) {
            if (node.data.id === id)
                return node;
            node = node.next;
        }
        return null;
    }
}
exports.PlaylistService = PlaylistService;
