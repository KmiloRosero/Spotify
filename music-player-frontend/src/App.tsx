import { useMemo, useState } from 'react';
import { AddSongModal } from './components/AddSongModal/AddSongModal';
import { HistoryPanel } from './components/HistoryPanel/HistoryPanel';
import { PlayerBar } from './components/PlayerBar/PlayerBar';
import { Sidebar, type NavItem } from './components/Sidebar/Sidebar';
import { SongList } from './components/SongList/SongList';
import { Toast } from './components/Toast/Toast';
import { usePlaylist } from './hooks/usePlaylist';
import { usePlayer } from './hooks/usePlayer';
import { useToast } from './hooks/useToast';
import type { PlayerState, PlayerStatus, PlaylistResponse } from './types/PlayerState';
import type { Song } from './types/Song';
import styles from './App.module.css';

function App() {
  const { showSuccess, showError, toasts, removeToast } = useToast();

  const { playlist, isLoading, refresh, handleAddSong, handleRemoveSong, handleSetCurrent } =
    usePlaylist(showSuccess, showError);

  const { playerState, handlePlay, handlePause, handleStop } = usePlayer(
    refresh,
    showSuccess,
    showError,
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [activeItem, setActiveItem] = useState<NavItem>('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [localSongs, setLocalSongs] = useState<Song[]>([]);
  const [localCurrentSongId, setLocalCurrentSongId] = useState<number | null>(null);
  const [localStatus, setLocalStatus] = useState<PlayerStatus>('STOPPED');

  const combinedPlaylist = useMemo<PlaylistResponse | null>(() => {
    const backendSongs = playlist?.songs ?? [];
    const songs = [...backendSongs, ...localSongs];
    if (songs.length === 0) return null;
    return { songs, total: songs.length, currentIndex: playlist?.currentIndex ?? -1 };
  }, [localSongs, playlist?.currentIndex, playlist?.songs]);

  const effectivePlayerState = useMemo<PlayerState | null>(() => {
    if (localCurrentSongId !== null) {
      const currentSong = combinedPlaylist?.songs.find((s) => s.id === localCurrentSongId) ?? null;
      return {
        status: localStatus,
        currentSong,
        totalSongs: combinedPlaylist?.total ?? (playlist?.total ?? 0) + localSongs.length,
      };
    }
    if (!playerState) return null;
    return {
      ...playerState,
      totalSongs: (playlist?.total ?? 0) + localSongs.length,
    };
  }, [combinedPlaylist?.songs, combinedPlaylist?.total, localCurrentSongId, localSongs.length, localStatus, playerState, playlist?.total]);

  const playlistForView = useMemo(() => {
    if (!combinedPlaylist) return null;
    if (activeItem !== 'search') return combinedPlaylist;

    const query = searchTerm.trim().toLowerCase();
    if (!query) return { ...combinedPlaylist, songs: combinedPlaylist.songs, total: combinedPlaylist.songs.length };

    const filtered = combinedPlaylist.songs.filter((s) => {
      const title = s.title.toLowerCase();
      const artist = s.artist.toLowerCase();
      return title.includes(query) || artist.includes(query);
    });

    return { ...combinedPlaylist, songs: filtered, total: filtered.length };
  }, [activeItem, combinedPlaylist, searchTerm]);

  const headerTitle =
    activeItem === 'home' ? 'Tu Lista de Reproducción' : activeItem === 'search' ? 'Buscar' : 'Tu Biblioteca';

  const headerSubtitle = useMemo(() => {
    if (activeItem === 'search') {
      const total = playlistForView?.total ?? 0;
      return `${total} resultados`;
    }
    const total = playlistForView?.total ?? 0;
    return `${total} canciones`;
  }, [activeItem, playlistForView?.total]);

  const handleSetCurrentUnified = async (id: number) => {
    if (id < 0) {
      setLocalCurrentSongId(id);
      setLocalStatus('PLAYING');
      return;
    }
    setLocalCurrentSongId(null);
    setLocalStatus('STOPPED');
    await handleSetCurrent(id);
    await handlePlay();
  };

  const handleRemoveUnified = async (id: number) => {
    if (id < 0) {
      setLocalSongs((prev) => {
        const found = prev.find((s) => s.id === id);
        if (found?.audioUrl) URL.revokeObjectURL(found.audioUrl);
        return prev.filter((s) => s.id !== id);
      });
      if (localCurrentSongId === id) {
        setLocalStatus('STOPPED');
        setLocalCurrentSongId(null);
      }
      showSuccess('Canción eliminada');
      return;
    }
    await handleRemoveSong(id);
  };

  const moveRelative = async (delta: number) => {
    const songs = combinedPlaylist?.songs ?? [];
    if (songs.length === 0) return;
    const currentId = effectivePlayerState?.currentSong?.id ?? null;
    const currentIndex = currentId !== null ? songs.findIndex((s) => s.id === currentId) : -1;
    const baseIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (baseIndex + delta + songs.length) % songs.length;
    const nextSong = songs[nextIndex];
    await handleSetCurrentUnified(nextSong.id);
  };

  const handlePlayUnified = async () => {
    if (localCurrentSongId !== null) {
      setLocalStatus('PLAYING');
      return;
    }
    await handlePlay();
  };

  const handlePauseUnified = async () => {
    if (localCurrentSongId !== null) {
      setLocalStatus('PAUSED');
      return;
    }
    await handlePause();
  };

  const handleStopUnified = async () => {
    if (localCurrentSongId !== null) {
      setLocalStatus('STOPPED');
      return;
    }
    await handleStop();
  };

  return (
    <div className={styles.appContainer}>
      <Sidebar onAddSong={() => setShowAddModal(true)} activeItem={activeItem} onNavigate={setActiveItem} />

      <main className={styles.mainContent}>
        {activeItem === 'search' ? (
          <div className={styles.searchBar}>
            <span className={styles.searchIcon} aria-hidden="true">
              ⌕
            </span>
            <input
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título o artista..."
            />
          </div>
        ) : null}

        <SongList
          playlist={playlistForView}
          currentSongId={effectivePlayerState?.currentSong?.id ?? null}
          onSetCurrent={(id) => {
            void (async () => {
              try {
                await handleSetCurrentUnified(id);
              } catch (err) {
                void err;
              }
            })();
          }}
          onRemove={handleRemoveUnified}
          onAdd={() => setShowAddModal(true)}
          isLoading={isLoading}
          showAlbumCovers={activeItem === 'home'}
          headerTitle={headerTitle}
          headerSubtitle={headerSubtitle}
          emptyTitle={activeItem === 'search' ? 'No se encontraron resultados' : undefined}
          emptySubtitle={
            activeItem === 'search' ? 'Prueba con otro término de búsqueda' : undefined
          }
        />
      </main>

      <aside className={styles.rightPanel}>
        <HistoryPanel />
      </aside>

      <div className={styles.playerBarArea}>
        <PlayerBar
          playerState={effectivePlayerState}
          onPlay={() => {
            void handlePlayUnified();
          }}
          onPause={() => {
            void handlePauseUnified();
          }}
          onStop={() => {
            void handleStopUnified();
          }}
          onNext={() => {
            void moveRelative(1);
          }}
          onPrevious={() => {
            void moveRelative(-1);
          }}
        />
      </div>

      {showAddModal ? (
        <AddSongModal
          onClose={() => setShowAddModal(false)}
          onSubmit={async (dto) => {
            await handleAddSong(dto);
          }}
          onSubmitLocal={(song) => {
            setLocalSongs((prev) => [...prev, song]);
            showSuccess('Canción agregada correctamente');
          }}
          totalSongs={playlist?.total ?? 0}
        />
      ) : null}

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;
