"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicPlayerFacade = void 0;
const PlayerStatus_1 = require("../models/PlayerStatus");
const HistoryService_1 = require("../services/HistoryService");
const PlayerService_1 = require("../services/PlayerService");
const PlaylistService_1 = require("../services/PlaylistService");
const SongService_1 = require("../services/SongService");
class MusicPlayerFacade {
    constructor(songService = new SongService_1.SongService(), playlistService = new PlaylistService_1.PlaylistService(), playerService = new PlayerService_1.PlayerService(playlistService), historyService = new HistoryService_1.HistoryService()) {
        this.songService = songService;
        this.playlistService = playlistService;
        this.playerService = playerService;
        this.historyService = historyService;
    }
    addSong(dto, position) {
        const wasEmpty = this.songService.getAllSongs().length === 0;
        const song = this.songService.addSong(dto, position);
        if (wasEmpty) {
            this.playlistService.resetCurrent();
        }
        return this.toSongDTO(song);
    }
    removeSong(id) {
        const current = this.playlistService.getCurrentSong();
        const wasCurrent = current?.id === id;
        const nextCandidate = wasCurrent ? this.playlistService.moveToNext() : null;
        const nextCandidateId = nextCandidate?.id;
        const removed = this.songService.removeSong(id);
        this.playlistService.resetCurrent();
        if (wasCurrent && nextCandidateId !== undefined && nextCandidateId !== id) {
            try {
                this.playlistService.setCurrentSong(nextCandidateId);
            }
            catch { }
        }
        return removed;
    }
    play() {
        const currentSong = this.playlistService.getCurrentSong();
        this.playerService.play();
        if (currentSong) {
            this.historyService.recordPlay(currentSong);
        }
        return this.buildStatusDTO();
    }
    pause() {
        this.playerService.pause();
        this.playlistService.getCurrentSong();
        return this.buildStatusDTO();
    }
    next() {
        const wasPlaying = this.playerService.getStatus() === PlayerStatus_1.PlayerStatus.PLAYING;
        const nextSong = this.playlistService.moveToNext();
        this.playerService.getStatus();
        if (wasPlaying && nextSong) {
            this.playerService.play();
            this.historyService.recordPlay(nextSong);
        }
        return this.buildStatusDTO();
    }
    previous() {
        const wasPlaying = this.playerService.getStatus() === PlayerStatus_1.PlayerStatus.PLAYING;
        const prevSong = this.playlistService.moveToPrevious();
        this.playerService.getStatus();
        if (wasPlaying && prevSong) {
            this.playerService.play();
            this.historyService.recordPlay(prevSong);
        }
        return this.buildStatusDTO();
    }
    getCurrentSong() {
        this.playerService.getStatus();
        const current = this.playlistService.getCurrentSong();
        return current ? this.toSongDTO(current) : null;
    }
    getPlaylist() {
        const songs = this.songService.getAllSongs();
        const currentIndex = this.playlistService.getCurrentIndex();
        return { songs: songs.map((s) => this.toSongDTO(s)), total: songs.length, currentIndex };
    }
    getHistory() {
        this.playerService.getStatus();
        const history = this.historyService.getHistory();
        return history.map((s) => this.toSongDTO(s));
    }
    setCurrentSong(id) {
        this.playlistService.setCurrentSong(id);
        this.playerService.stop();
        return this.buildStatusDTO();
    }
    stop() {
        this.playerService.stop();
        this.playlistService.getCurrentSong();
        return this.buildStatusDTO();
    }
    buildStatusDTO() {
        const status = this.playerService.getStatus();
        const currentSong = this.playlistService.getCurrentSong();
        const totalSongs = this.songService.getAllSongs().length;
        return {
            status: status,
            currentSong: currentSong ? this.toSongDTO(currentSong) : null,
            totalSongs,
        };
    }
    toSongDTO(song) {
        return {
            id: song.id,
            title: song.title,
            artist: song.artist,
            duration: song.duration,
            audioUrl: song.audioUrl,
            coverUrl: song.coverUrl,
        };
    }
}
exports.MusicPlayerFacade = MusicPlayerFacade;
