import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchHistory } from '../../api/musicApi';
import type { Song } from '../../types/Song';
import styles from './HistoryPanel.module.css';

function colorFromArtist(artist: string): string {
  let hash = 0;
  for (let i = 0; i < artist.length; i += 1) {
    hash = (hash * 31 + artist.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  return `hsl(${hue} 70% 45%)`;
}

export function HistoryPanel() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchHistory();
      setSongs(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh().catch(() => {});
  }, [refresh]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void refresh().catch(() => {});
    }, 5000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const items = useMemo(() => songs, [songs]);

  return (
    <aside className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerIcon} aria-hidden="true">
            🕒
          </span>
          <span className={styles.headerTitle}>Historial</span>
        </div>
        <button type="button" className={styles.clearButton} onClick={() => setSongs([])}>
          Limpiar
        </button>
      </div>

      {isLoading && items.length === 0 ? (
        <div className={styles.empty}>Cargando...</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>Sin historial de reproducción</div>
      ) : (
        <div className={styles.list}>
          {items.map((song, index) => {
            const initial = song.artist.trim().slice(0, 1).toUpperCase() || '♪';
            const color = colorFromArtist(song.artist);

            return (
              <div key={`${song.id}-${song.title}-${index}`} className={styles.item}>
                <div className={styles.circle} style={{ backgroundColor: color }}>
                  {initial}
                </div>
                <div className={styles.itemText}>
                  <div className={styles.itemTitle}>{song.title}</div>
                  <div className={styles.itemArtist}>{song.artist}</div>
                </div>
                <div className={styles.itemNote} aria-hidden="true">
                  ♪
                </div>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
