import { Router } from 'express';
import { MusicController } from '../controllers/MusicController';

const router = Router();

router.post('/song', MusicController.addSong);
router.delete('/song/:id', MusicController.removeSong);

router.get('/playlist', MusicController.getPlaylist);
router.get('/current', MusicController.getCurrentSong);
router.post('/current', MusicController.setCurrentSong);

router.post('/play', MusicController.play);
router.post('/pause', MusicController.pause);
router.post('/stop', MusicController.stop);
router.post('/next', MusicController.next);
router.post('/previous', MusicController.previous);

router.get('/history', MusicController.getHistory);

export default router;
