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
import styles from './App.module.css';

function App() {
  const { showSuccess, showError, toasts, removeToast } = useToast();

  const { playlist, isLoading, refresh, handleAddSong, handleRemoveSong, handleSetCurrent } =
    usePlaylist(showSuccess, showError);

  const { playerState, handlePlay, handlePause, handleStop, handleNext, handlePrevious } = usePlayer(
    refresh,
    showSuccess,
    showError,
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [activeItem, setActiveItem] = useState<NavItem>('home');
  const [searchTerm, setSearchTerm] = useState('');

  const playlistForView = useMemo(() => {
    if (!playlist) return null;
    if (activeItem !== 'search') return playlist;

    const query = searchTerm.trim().toLowerCase();
    if (!query) return { ...playlist, songs: playlist.songs, total: playlist.songs.length };

    const filtered = playlist.songs.filter((s) => {
      const title = s.title.toLowerCase();
      const artist = s.artist.toLowerCase();
      return title.includes(query) || artist.includes(query);
    });

    return { ...playlist, songs: filtered, total: filtered.length };
  }, [activeItem, playlist, searchTerm]);

  const headerTitle =
    activeItem === 'home' ? 'Tu Lista de Reproducción' : activeItem === 'search' ? 'Buscar' : 'Tu Biblioteca';

  const headerSubtitle = useMemo(() => {
    if (activeItem === 'search') {
      const total = playlistForView?.total ?? 0;
      return `${total} resultados`;
    }
    const total = playlist?.total ?? 0;
    return `${total} canciones`;
  }, [activeItem, playlist?.total, playlistForView?.total]);

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
          currentSongId={playerState?.currentSong?.id ?? null}
          onSetCurrent={(id) => {
            void (async () => {
              try {
                await handleSetCurrent(id);
                await handlePlay();
              } catch (err) {
                void err;
              }
            })();
          }}
          onRemove={handleRemoveSong}
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
          playerState={playerState}
          onPlay={handlePlay}
          onPause={handlePause}
          onStop={handleStop}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      </div>

      {showAddModal ? (
        <AddSongModal
          onClose={() => setShowAddModal(false)}
          onSubmit={async (dto) => {
            await handleAddSong(dto);
          }}
          totalSongs={playlist?.total ?? 0}
        />
      ) : null}

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;
