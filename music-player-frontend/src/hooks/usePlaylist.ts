import { useCallback, useEffect, useMemo, useState } from 'react';
import { addSong, fetchPlaylist, removeSong, setCurrentSong } from '../api/musicApi';
import type { PlaylistResponse } from '../types/PlayerState';
import type { SongDTO } from '../types/Song';

interface UsePlaylistReturn {
  playlist: PlaylistResponse | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  handleAddSong: (dto: SongDTO) => Promise<void>;
  handleRemoveSong: (id: number) => Promise<void>;
  handleSetCurrent: (id: number) => Promise<void>;
}

export function usePlaylist(
  onSuccess: (message: string) => void,
  onError: (message: string) => void,
): UsePlaylistReturn {
  const [playlist, setPlaylist] = useState<PlaylistResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPlaylist();
      setPlaylist(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar la lista';
      setError(message);
      onError(message);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  const handleAddSong = useCallback(
    async (dto: SongDTO) => {
      setIsLoading(true);
      setError(null);
      try {
        await addSong(dto);
        await refresh();
        onSuccess('Canción agregada correctamente');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al agregar la canción';
        setError(message);
        onError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [onError, onSuccess, refresh],
  );

  const handleRemoveSong = useCallback(
    async (id: number) => {
      setIsLoading(true);
      setError(null);
      try {
        await removeSong(id);
        await refresh();
        onSuccess('Canción eliminada');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Canción no encontrada';
        setError(message);
        onError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [onError, onSuccess, refresh],
  );

  const handleSetCurrent = useCallback(
    async (id: number) => {
      setIsLoading(true);
      setError(null);
      try {
        await setCurrentSong(id);
        await refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Canción no encontrada';
        setError(message);
        onError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [onError, refresh],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return useMemo(
    () => ({
      playlist,
      isLoading,
      error,
      refresh,
      handleAddSong,
      handleRemoveSong,
      handleSetCurrent,
    }),
    [playlist, isLoading, error, refresh, handleAddSong, handleRemoveSong, handleSetCurrent],
  );
}
