"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicController = void 0;
const errorHandler_1 = require("../middlewares/errorHandler");
const MusicPlayerFacade_1 = require("../facade/MusicPlayerFacade");
const facade = new MusicPlayerFacade_1.MusicPlayerFacade();
class MusicController {
    static addSong(req, res, next) {
        try {
            const { title, artist, duration, position, audioUrl, coverUrl } = req.body;
            const dto = {
                title: title,
                artist: artist,
                duration: duration,
                position: typeof position === 'number' ? position : undefined,
                audioUrl: typeof audioUrl === 'string' ? audioUrl : undefined,
                coverUrl: typeof coverUrl === 'string' ? coverUrl : undefined,
            };
            const song = facade.addSong(dto, dto.position);
            const response = {
                success: true,
                data: song,
                message: 'Song added successfully',
            };
            res.status(201).json(response);
        }
        catch (err) {
            next(err);
        }
    }
    static removeSong(req, res, next) {
        try {
            const id = Number(req.params.id);
            if (!Number.isFinite(id)) {
                throw new errorHandler_1.AppError('Invalid song id', 400);
            }
            const removed = facade.removeSong(id);
            const response = {
                success: true,
                data: removed,
                message: 'Song removed successfully',
            };
            res.status(200).json(response);
        }
        catch (err) {
            next(err);
        }
    }
    static getPlaylist(req, res, next) {
        try {
            const playlist = facade.getPlaylist();
            const response = {
                success: true,
                data: playlist,
                message: 'Playlist retrieved successfully',
            };
            res.status(200).json(response);
        }
        catch (err) {
            next(err);
        }
    }
    static getCurrentSong(req, res, next) {
        try {
            const current = facade.getCurrentSong();
            const response = {
                success: true,
                data: current,
                message: 'Current song retrieved successfully',
            };
            res.status(200).json(response);
        }
        catch (err) {
            next(err);
        }
    }
    static setCurrentSong(req, res, next) {
        try {
            const { id } = req.body;
            const numericId = Number(id);
            if (!Number.isFinite(numericId)) {
                throw new errorHandler_1.AppError('Invalid song id', 400);
            }
            const status = facade.setCurrentSong(numericId);
            const response = {
                success: true,
                data: status,
                message: 'Current song updated successfully',
            };
            res.status(200).json(response);
        }
        catch (err) {
            next(err);
        }
    }
    static play(req, res, next) {
        try {
            const status = facade.play();
            const response = {
                success: true,
                data: status,
                message: 'Playback started',
            };
            res.status(200).json(response);
        }
        catch (err) {
            next(err);
        }
    }
    static pause(req, res, next) {
        try {
            const status = facade.pause();
            const response = {
                success: true,
                data: status,
                message: 'Playback paused',
            };
            res.status(200).json(response);
        }
        catch (err) {
            next(err);
        }
    }
    static stop(req, res, next) {
        try {
            const status = facade.stop();
            const response = {
                success: true,
                data: status,
                message: 'Playback stopped',
            };
            res.status(200).json(response);
        }
        catch (err) {
            next(err);
        }
    }
    static next(req, res, next) {
        try {
            const status = facade.next();
            const response = {
                success: true,
                data: status,
                message: 'Moved to next song',
            };
            res.status(200).json(response);
        }
        catch (err) {
            next(err);
        }
    }
    static previous(req, res, next) {
        try {
            const status = facade.previous();
            const response = {
                success: true,
                data: status,
                message: 'Moved to previous song',
            };
            res.status(200).json(response);
        }
        catch (err) {
            next(err);
        }
    }
    static getHistory(req, res, next) {
        try {
            const history = facade.getHistory();
            const response = {
                success: true,
                data: history,
                message: 'History retrieved successfully',
            };
            res.status(200).json(response);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.MusicController = MusicController;
