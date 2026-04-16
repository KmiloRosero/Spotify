import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type RefObject } from 'react';
import type { PlayerState } from '../../types/PlayerState';
import styles from './PlayerBar.module.css';

type Props = {
  playerState: PlayerState | null;
  externalAudioRef?: RefObject<HTMLAudioElement>;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrevious: () => void;
};

function formatDuration(durationSeconds: number): string {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = Math.floor(durationSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function badgeText(status: PlayerState['status']): string {
  if (status === 'PLAYING') return 'REPRODUCIENDO';
  if (status === 'PAUSED') return 'PAUSADO';
  return 'DETENIDO';
}

export function PlayerBar({ playerState, externalAudioRef, onPlay, onPause, onStop, onNext, onPrevious }: Props) {
  const currentSong = playerState?.currentSong ?? null;
  const status = playerState?.status ?? 'STOPPED';
  const totalSongs = playerState?.totalSongs ?? 0;
  const isPlaying = status === 'PLAYING';
  
  const internalAudioRef = useRef<HTMLAudioElement>(null);
  const audioRef = externalAudioRef ?? internalAudioRef;
  
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(currentSong?.duration ?? 0);
  const [volume, setVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [needsPlayClick, setNeedsPlayClick] = useState<boolean>(false);

  const displayedTime = status === 'STOPPED' ? 0 : currentTime;
  const durationLabel = formatDuration(duration);
  const progressPct = duration > 0 ? Math.min(100, Math.max(0, (displayedTime / duration) * 100)) : 0;
  
  const progressStyle = { ['--progress-pct']: progressPct } as CSSProperties & {
    ['--progress-pct']?: number;
  };
  
  const volumeStyle = { ['--volume-pct']: isMuted ? 0 : volume } as CSSProperties & {
    ['--volume-pct']?: number;
  };

  const statusClass =
    status === 'PLAYING'
      ? styles.statusPlaying
      : status === 'PAUSED'
        ? styles.statusPaused
        : styles.statusStopped;

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    if (externalAudioRef) {
      const onTimeUpdate = () => {
        setCurrentTime(el.currentTime);
      };
      const onLoadedMetadata = () => {
        setDuration(el.duration);
      };
      const onEnded = () => {
        onNext();
      };

      el.addEventListener('timeupdate', onTimeUpdate);
      el.addEventListener('loadedmetadata', onLoadedMetadata);
      el.addEventListener('ended', onEnded);
      return () => {
        el.removeEventListener('timeupdate', onTimeUpdate);
        el.removeEventListener('loadedmetadata', onLoadedMetadata);
        el.removeEventListener('ended', onEnded);
      };
    }

    return;
  }, [audioRef, externalAudioRef, onNext]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    onNext();
  };

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current
        .play()
        .then(() => setNeedsPlayClick(false))
        .catch(() => setNeedsPlayClick(true));
    } else {
      audioRef.current.pause();
    }
  }, [audioRef, isPlaying, currentSong]);

  // Sincronizar estado de Stop
  useEffect(() => {
    if (status === 'STOPPED' && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [audioRef, status]);

  // Sincronizar volumen
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume / 100;
  }, [audioRef, volume, isMuted]);

  const handleSeekChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = Number(e.target.value);
    if (!Number.isFinite(value) || !audioRef.current) return;
    
    audioRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const handleSkip = (deltaSeconds: number): void => {
    if (!audioRef.current) return;
    const newTime = Math.min(duration, Math.max(0, audioRef.current.currentTime + deltaSeconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleMuteToggle = (): void => {
    setIsMuted((prev) => !prev);
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) setIsMuted(false);
  };

  const getVolumeIcon = (): string => {
    if (isMuted || volume === 0) return '🔇';
    if (volume < 40) return '🔈';
    if (volume < 70) return '🔉';
    return '🔊';
  };

  return (
    <div className={styles.container}>
      {!externalAudioRef && currentSong && currentSong.audioUrl && (
        <audio
          ref={internalAudioRef}
          src={currentSong.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
      )}

      <div className={styles.left}>
        <div className={styles.albumArt} aria-hidden="true" />
        <div className={styles.songInfo}>
          <div className={styles.songTitle}>{currentSong ? currentSong.title : 'Sin canción'}</div>
          <div className={styles.songArtist}>{currentSong ? currentSong.artist : '—'}</div>
        </div>
        <button type="button" className={styles.favorite} aria-label="Favorito">♥</button>
      </div>

      <div className={styles.center}>
        {currentSong ? (
          <>
            <div className={styles.controls}>
              <button
                type="button"
                className={styles.controlButton}
                onClick={onPrevious}
                aria-label="Anterior"
              >
                ⏮
              </button>
              <button
                type="button"
                className={styles.controlButton}
                onClick={() => handleSkip(-10)}
                aria-label="Retroceder 10 segundos"
                title="Retroceder 10s"
              >
                ⏪
              </button>
              <button
                type="button"
                className={styles.playButton}
                onClick={isPlaying ? onPause : onPlay}
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button
                type="button"
                className={styles.controlButton}
                onClick={() => handleSkip(10)}
                aria-label="Adelantar 10 segundos"
                title="Adelantar 10s"
              >
                ⏩
              </button>
              <button
                type="button"
                className={styles.controlButton}
                onClick={onNext}
                aria-label="Siguiente"
              >
                ⏭
              </button>
              <button
                type="button"
                className={styles.controlButton}
                onClick={onStop}
                aria-label="Detener"
              >
                ⏹
              </button>
            </div>

            {!currentSong.audioUrl ? (
              <div className={styles.noSong}>Esta canción no tiene audio. Agrégala desde tu PC o pega una URL mp3.</div>
            ) : needsPlayClick ? (
              <div className={styles.noSong}>Toca ▶ para activar el sonido (el navegador bloqueó autoplay).</div>
            ) : null}

            <div className={styles.progressRow}>
              <div>{formatDuration(displayedTime)}</div>
              <input
                type="range"
                min={0}
                max={duration > 0 ? duration : 100}
                value={displayedTime}
                onChange={handleSeekChange}
                className={styles.progressSlider}
                title="Arrastra para adelantar o retroceder"
                style={progressStyle}
              />
              <div style={{ textAlign: 'right' }}>{durationLabel}</div>
            </div>
          </>
        ) : (
          <div className={styles.noSong}>Selecciona una canción para comenzar</div>
        )}
      </div>

      <div className={styles.rightSection}>
        <span className={`${styles.statusBadge} ${statusClass}`}>{badgeText(status)}</span>

        <div className={styles.volumeControl}>
          <button
            type="button"
            className={styles.volumeIcon}
            onClick={handleMuteToggle}
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {getVolumeIcon()}
          </button>

          <input
            type="range"
            min={0}
            max={100}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className={styles.volumeSlider}
            title={`Volumen: ${isMuted ? 0 : volume}%`}
            style={volumeStyle}
          />

          <span className={styles.volumeLabel}>{isMuted ? 0 : volume}%</span>
        </div>

        <span className={styles.totalSongs}>{totalSongs} canciones</span>
      </div>
    </div>
  );
}
