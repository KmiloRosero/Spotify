"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerService = exports.CannotPauseError = exports.CannotPlayError = void 0;
const PlayerStatus_1 = require("../models/PlayerStatus");
const errorHandler_1 = require("../middlewares/errorHandler");
const PlaylistService_1 = require("./PlaylistService");
class CannotPlayError extends errorHandler_1.AppError {
    constructor() {
        super('Cannot play: no current song selected', 400);
        this.name = 'CannotPlayError';
    }
}
exports.CannotPlayError = CannotPlayError;
class CannotPauseError extends errorHandler_1.AppError {
    constructor() {
        super('Cannot pause: player is not playing', 400);
        this.name = 'CannotPauseError';
    }
}
exports.CannotPauseError = CannotPauseError;
class PlayerService {
    constructor(playlistService = new PlaylistService_1.PlaylistService()) {
        this.status = PlayerStatus_1.PlayerStatus.STOPPED;
        this.playlistService = playlistService;
    }
    play() {
        const currentSong = this.playlistService.getCurrentSong();
        if (!currentSong) {
            throw new CannotPlayError();
        }
        this.status = PlayerStatus_1.PlayerStatus.PLAYING;
        return this.status;
    }
    pause() {
        if (this.status !== PlayerStatus_1.PlayerStatus.PLAYING) {
            throw new CannotPauseError();
        }
        this.status = PlayerStatus_1.PlayerStatus.PAUSED;
        return this.status;
    }
    stop() {
        this.status = PlayerStatus_1.PlayerStatus.STOPPED;
        return this.status;
    }
    getStatus() {
        return this.status;
    }
    isPlaying() {
        return this.status === PlayerStatus_1.PlayerStatus.PLAYING;
    }
}
exports.PlayerService = PlayerService;
