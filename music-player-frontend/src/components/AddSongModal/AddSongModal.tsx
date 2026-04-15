import { useEffect, useMemo, useState } from 'react';
import type { Song, SongDTO } from '../../types/Song';
import styles from './AddSongModal.module.css';

type Props = {
  onClose: () => void;
  onSubmit: (dto: SongDTO) => Promise<void> | void;
  onSubmitLocal?: (song: Song) => Promise<void> | void;
  totalSongs: number;
};

type PositionMode = 'end' | 'start' | 'specific';

function filenameWithoutExtension(filename: string): string {
  const idx = filename.lastIndexOf('.');
  return idx > 0 ? filename.slice(0, idx) : filename;
}

export function AddSongModal({ onClose, onSubmit, onSubmitLocal, totalSongs }: Props) {
  const [title, setTitle] = useState<string>('');
  const [artist, setArtist] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [positionMode, setPositionMode] = useState<PositionMode>('end');
  const [specificPosition, setSpecificPosition] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localAudioUrl, setLocalAudioUrl] = useState<string>('');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (localAudioUrl) URL.revokeObjectURL(localAudioUrl);
    };
  }, [localAudioUrl]);

  const dto = useMemo<SongDTO>(() => {
    const parsedDuration = Number(duration);
    const position =
      positionMode === 'end'
        ? undefined
        : positionMode === 'start'
          ? 0
          : specificPosition.trim().length
            ? Number(specificPosition)
            : undefined;

    return {
      title: title.trim(),
      artist: artist.trim(),
      duration: Number.isFinite(parsedDuration) ? parsedDuration : 0,
      position,
    };
  }, [title, artist, duration, positionMode, specificPosition]);

  const validate = (): boolean => {
    if (localAudioUrl && onSubmitLocal) {
      const parsedDuration = Number(duration);
      const nextErrors: Record<string, string> = {};
      if (!title.trim()) nextErrors.title = 'El título es obligatorio';
      if (!artist.trim()) nextErrors.artist = 'El artista es obligatorio';
      if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
        nextErrors.duration = 'La duración debe ser mayor a 0';
      }
      setErrors(nextErrors);
      return Object.keys(nextErrors).length === 0;
    }

    const nextErrors: Record<string, string> = {};

    if (!dto.title) nextErrors.title = 'El título es obligatorio';
    if (!dto.artist) nextErrors.artist = 'El artista es obligatorio';

    if (!Number.isFinite(dto.duration) || dto.duration <= 0) {
      nextErrors.duration = 'La duración debe ser mayor a 0';
    } else if (dto.duration > 3600) {
      nextErrors.duration = 'La duración máxima es 3600 segundos';
    }

    if (positionMode === 'specific') {
      const posNumber = Number(specificPosition);
      if (!Number.isInteger(posNumber) || posNumber < 0) {
        nextErrors.position = 'La posición debe ser un número entero (0 o mayor)';
      } else if (posNumber > totalSongs) {
        nextErrors.position = `La posición máxima es ${totalSongs}`;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.title}>Agregar canción</div>

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            if (!validate()) return;
            if (localAudioUrl && onSubmitLocal) {
              const parsedDuration = Number(duration);
              const localSong: Song = {
                id: -Date.now(),
                title: title.trim(),
                artist: artist.trim(),
                duration: Number.isFinite(parsedDuration) ? parsedDuration : 0,
                audioUrl: localAudioUrl,
              };

              Promise.resolve(onSubmitLocal(localSong))
                .then(() => onClose())
                .catch(() => {});
              return;
            }

            Promise.resolve(onSubmit(dto))
              .then(() => onClose())
              .catch(() => {});
          }}
        >
          <div className={styles.field}>
            <label className={styles.label} htmlFor="audioFile">
              Canción desde tu PC (mp3)
            </label>
            <input
              id="audioFile"
              className={styles.input}
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (localAudioUrl) URL.revokeObjectURL(localAudioUrl);
                const objectUrl = URL.createObjectURL(file);
                setLocalAudioUrl(objectUrl);

                const name = filenameWithoutExtension(file.name);
                if (!title.trim()) setTitle(name);
                if (!artist.trim()) setArtist('Local');

                const audio = new Audio();
                audio.preload = 'metadata';
                audio.src = objectUrl;
                audio.onloadedmetadata = () => {
                  const seconds = Math.max(1, Math.round(audio.duration));
                  setDuration(String(seconds));
                };
              }}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="title">
              Título de la canción
            </label>
            <input
              id="title"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Blinding Lights"
            />
            {errors.title ? <div className={styles.errorText}>{errors.title}</div> : null}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="artist">
              Artista
            </label>
            <input
              id="artist"
              className={styles.input}
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Ej: The Weeknd"
            />
            {errors.artist ? <div className={styles.errorText}>{errors.artist}</div> : null}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="duration">
              Duración (segundos)
            </label>
            <input
              id="duration"
              className={styles.input}
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min={1}
              max={3600}
            />
            {errors.duration ? <div className={styles.errorText}>{errors.duration}</div> : null}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="positionMode">
              Agregar en posición
            </label>
            <select
              id="positionMode"
              className={styles.input}
              value={positionMode}
              onChange={(e) => setPositionMode(e.target.value as PositionMode)}
              disabled={Boolean(localAudioUrl)}
            >
              <option value="end">Al final de la lista</option>
              <option value="start">Al inicio de la lista</option>
              <option value="specific">En posición específica...</option>
            </select>

            {positionMode === 'specific' ? (
              <div className={styles.specificRow}>
                <input
                  className={styles.input}
                  type="number"
                  value={specificPosition}
                  onChange={(e) => setSpecificPosition(e.target.value)}
                  min={0}
                  max={totalSongs}
                  placeholder={`0 - ${totalSongs}`}
                />
                {errors.position ? <div className={styles.errorText}>{errors.position}</div> : null}
              </div>
            ) : null}
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitButton}>
              Agregar canción
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
