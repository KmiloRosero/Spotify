import type { Song } from '../../types/Song';
import styles from './SongList.module.css';

type Props = {
  song: Song;
  index: number;
  isCurrentSong: boolean;
  onSetCurrent: (id: number) => void;
  onRemove: (id: number) => void;
};

function formatDuration(durationSeconds: number): string {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function SongItem({ song, index, isCurrentSong, onSetCurrent, onRemove }: Props) {
  const handleRemove = () => {
    const confirmed = window.confirm(`¿Eliminar '${song.title}'?`);
    if (!confirmed) return;
    onRemove(song.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSetCurrent(song.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSetCurrent(song.id);
        }
      }}
      className={styles.itemButton}
      data-active={isCurrentSong ? 'true' : 'false'}
    >
      <div className={styles.leftCell}>
        {isCurrentSong ? (
          <span className={styles.equalizer} aria-hidden="true">
            <span className={styles.bar} />
            <span className={styles.bar} />
            <span className={styles.bar} />
          </span>
        ) : (
          <span aria-hidden="true">{index}</span>
        )}
      </div>

      <div className={styles.itemLeft}>
        <div className={`${styles.itemTitle} ${isCurrentSong ? styles.itemTitleActive : ''}`}>
          {song.title}
        </div>
        <div className={styles.itemArtist}>{song.artist}</div>
      </div>

      <div className={styles.artistCell}>{song.artist}</div>
      <div className={styles.itemDuration}>{formatDuration(song.duration)}</div>

      <div className={styles.actionsCell}>
        <button
          type="button"
          className={styles.removeButton}
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
          aria-label="Eliminar canción"
        >
          🗑 Eliminar
        </button>
      </div>
    </div>
  );
}
