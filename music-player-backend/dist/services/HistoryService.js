"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryService = void 0;
class HistoryService {
    constructor() {
        this.history = [];
        this.maxSize = 50;
    }
    recordPlay(song) {
        this.history.unshift(song);
        if (this.history.length > this.maxSize) {
            this.history.length = this.maxSize;
        }
    }
    getHistory() {
        return [...this.history];
    }
    clearHistory() {
        this.history.length = 0;
    }
    getLastPlayed() {
        return this.history[0] ?? null;
    }
}
exports.HistoryService = HistoryService;
