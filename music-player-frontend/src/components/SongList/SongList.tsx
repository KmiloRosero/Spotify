import { SongItem } from './SongItem';
import styles from './SongList.module.css';
import type { PlaylistResponse } from '../../types/PlayerState';
import type { Song } from '../../types/Song';

function hashToHue(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
}

function coverGradient(song: Song): string {
  const hue = hashToHue(`${song.title}-${song.artist}`);
  const a = `hsl(${hue} 70% 45%)`;
  const b = `hsl(${(hue + 40) % 360} 70% 35%)`;
  const gradient = `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;
  if (song.coverUrl && song.coverUrl.trim().length > 0) {
    return `url("${song.coverUrl}"), ${gradient}`;
  }
  return gradient;
}

type Props = {
  playlist: PlaylistResponse | null;
  currentSongId: number | null;
  onSetCurrent: (id: number) => void;
  onRemove: (id: number) => void;
  onAdd: () => void;
  isLoading: boolean;
  showAlbumCovers?: boolean;
  headerTitle?: string;
  headerSubtitle?: string;
  addButtonText?: string;
  emptyTitle?: string;
  emptySubtitle?: string;
};

export function SongList({
  playlist,
  currentSongId,
  onSetCurrent,
  onRemove,
  onAdd,
  isLoading,
  showAlbumCovers,
  headerTitle,
  headerSubtitle,
  addButtonText,
  emptyTitle,
  emptySubtitle,
}: Props) {
  const songs = playlist?.songs ?? [];
  const total = playlist?.total ?? songs.length;
  const resolvedTitle = headerTitle ?? 'Tu Lista de Reproducción';
  const resolvedSubtitle = headerSubtitle ?? `${total} canciones`;
  const resolvedAddText = addButtonText ?? '+ Agregar canción';
  const resolvedEmptyTitle = emptyTitle ?? 'No hay canciones en tu lista';
  const resolvedEmptySubtitle = emptySubtitle ?? 'Agrega una canción para comenzar';

  return (
    <section>
      {showAlbumCovers && songs.length > 0 ? (
        <div className={styles.albumSection}>
          <div className={styles.albumGrid}>
            {songs.slice(0, 8).map((song) => (
              <button
                key={song.id}
                type="button"
                className={styles.albumCard}
                onClick={() => onSetCurrent(song.id)}
              >
                <div
                  className={styles.albumCover}
                  style={{ backgroundImage: coverGradient(song) }}
                  aria-hidden="true"
                />
                <div className={styles.albumName}>{song.title}</div>
                <div className={styles.albumArtist}>{song.artist}</div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.title}>{resolvedTitle}</div>
          <div className={styles.subtitle}>{resolvedSubtitle}</div>
        </div>
        <button type="button" className={styles.addButton} onClick={onAdd}>
          {resolvedAddText}
        </button>
      </div>

      {isLoading ? (
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.th}>#</th>
              <th className={styles.th}>Título</th>
              <th className={styles.th}>Artista</th>
              <th className={`${styles.th} ${styles.thRight}`}>Duración</th>
              <th className={`${styles.th} ${styles.thRight}`}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }).map((_, idx) => (
              <tr key={idx} className={styles.tbodyRow}>
                <td colSpan={5} className={styles.skeletonRow}>
                  <div className={styles.skeletonBar} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : songs.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyTitle}>{resolvedEmptyTitle}</div>
          <div className={styles.emptySubtitle}>{resolvedEmptySubtitle}</div>
          <button type="button" className={styles.emptyPlus} onClick={onAdd} aria-label="Agregar canción">
            +
          </button>
        </div>
      ) : (
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.th}>#</th>
              <th className={styles.th}>Título</th>
              <th className={styles.th}>Artista</th>
              <th className={`${styles.th} ${styles.thRight}`}>Duración</th>
              <th className={`${styles.th} ${styles.thRight}`}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song, index) => (
              <tr key={song.id} className={styles.tbodyRow}>
                <td colSpan={5}>
                  <SongItem
                    song={song}
                    index={index + 1}
                    isCurrentSong={song.id === currentSongId}
                    onSetCurrent={onSetCurrent}
                    onRemove={onRemove}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
