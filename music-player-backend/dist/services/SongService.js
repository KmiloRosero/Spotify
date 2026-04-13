"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SongService = exports.PositionOutOfBoundsError = exports.DuplicateSongError = exports.SongNotFoundError = void 0;
const errorHandler_1 = require("../middlewares/errorHandler");
const sharedPlaylist_1 = require("../structures/sharedPlaylist");
class SongNotFoundError extends errorHandler_1.AppError {
    constructor(id) {
        super(`Song with id ${id} not found`, 404);
        this.name = 'SongNotFoundError';
    }
}
exports.SongNotFoundError = SongNotFoundError;
class DuplicateSongError extends errorHandler_1.AppError {
    constructor(title, artist) {
        super(`Duplicate song: '${title}' by '${artist}' already exists`, 409);
        this.name = 'DuplicateSongError';
    }
}
exports.DuplicateSongError = DuplicateSongError;
class PositionOutOfBoundsError extends errorHandler_1.AppError {
    constructor(position) {
        super(`Position ${position} is out of bounds`, 400);
        this.name = 'PositionOutOfBoundsError';
    }
}
exports.PositionOutOfBoundsError = PositionOutOfBoundsError;
function normalizeKey(value) {
    return value.trim().toLowerCase();
}
function assertNonEmptyString(value, fieldName) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new errorHandler_1.AppError(`${fieldName} is required`, 400);
    }
}
function assertPositiveNumber(value, fieldName) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
        throw new errorHandler_1.AppError(`${fieldName} must be a positive number`, 400);
    }
}
class SongService {
    constructor(playlist = sharedPlaylist_1.sharedPlaylist) {
        this.playlist = playlist;
    }
    addSong(dto, position) {
        assertNonEmptyString(dto.title, 'title');
        assertNonEmptyString(dto.artist, 'artist');
        assertPositiveNumber(dto.duration, 'duration');
        const resolvedPosition = position ?? dto.position;
        if (resolvedPosition !== undefined &&
            (!Number.isInteger(resolvedPosition) || resolvedPosition < 0)) {
            throw new PositionOutOfBoundsError(resolvedPosition);
        }
        this.validateNoDuplicate(dto.title, dto.artist);
        const song = {
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
    removeSong(id) {
        const existing = this.findSongById(id);
        if (!existing) {
            throw new SongNotFoundError(id);
        }
        try {
            this.playlist.deleteById(id);
        }
        catch {
            throw new SongNotFoundError(id);
        }
        return true;
    }
    getAllSongs() {
        return this.playlist.getAll();
    }
    findSongById(id) {
        const all = this.playlist.getAll();
        return all.find((s) => s.id === id) ?? null;
    }
    validateNoDuplicate(title, artist) {
        const titleKey = normalizeKey(title);
        const artistKey = normalizeKey(artist);
        const all = this.playlist.getAll();
        const duplicate = all.some((s) => normalizeKey(s.title) === titleKey && normalizeKey(s.artist) === artistKey);
        if (duplicate) {
            throw new DuplicateSongError(title.trim(), artist.trim());
        }
    }
    generateId() {
        return Date.now() + Math.floor(Math.random() * 1000000);
    }
}
exports.SongService = SongService;
