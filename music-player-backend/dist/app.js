"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const errorHandler_1 = require("./middlewares/errorHandler");
const musicRoutes_1 = __importDefault(require("./routes/musicRoutes"));
const SongService_1 = require("./services/SongService");
const PlaylistService_1 = require("./services/PlaylistService");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)({ origin: '*' }));
app.use(express_1.default.json());
// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        message: '✅ Backend de Spotify funcionando correctamente',
        status: 'OK',
        time: new Date(),
    });
});
// Servir la carpeta de audios
app.use('/audio', express_1.default.static(path_1.default.join(__dirname, '../public/audio')));
app.use('/covers', express_1.default.static(path_1.default.join(__dirname, '../public/covers')));
app.use('/api/music', musicRoutes_1.default);
app.get('/health', (_req, res) => {
    res.json({ success: true, message: 'Music Player API is running' });
});
const songService = new SongService_1.SongService();
const playlistService = new PlaylistService_1.PlaylistService();
const seedSongs = [
    {
        title: 'Todavia me amas',
        artist: 'Aventura',
        duration: 200,
        audioUrl: 'http://localhost:3001/audio/Todavia%20me%20amas%20de%20Aventura.mp3',
        coverUrl: 'http://localhost:3001/covers/Tadavia%20me%20amas.jpg.jpg',
    },
    {
        title: '30 mil pies',
        artist: 'Cris mj',
        duration: 200,
        audioUrl: '',
        coverUrl: 'http://localhost:3001/covers/30%20mil%20pies.jpg.jpg',
    },
    {
        title: 'Titulo de amor',
        artist: 'Diomedes',
        duration: 234,
        audioUrl: '',
        coverUrl: 'http://localhost:3001/covers/Titulo%20de%20amor.jpg.jpg',
    },
    {
        title: 'Otros planes',
        artist: 'Kris R y hades66',
        duration: 141,
        audioUrl: '',
        coverUrl: 'http://localhost:3001/covers/otros%20planes.jpg.jpg',
    },
    {
        title: 'Ultra complicado remix',
        artist: 'Kris R y blessd y Kenny duie',
        duration: 203,
        audioUrl: '',
        coverUrl: 'http://localhost:3001/covers/ultra%20complicado.jpg.jpg',
    },
];
for (const seed of seedSongs) {
    try {
        songService.addSong(seed);
    }
    catch { }
}
playlistService.resetCurrent();
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    process.stdout.write(`Music Player API running on http://localhost:${PORT}\n`);
});
exports.default = app;
