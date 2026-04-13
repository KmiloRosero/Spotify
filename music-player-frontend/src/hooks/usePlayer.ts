import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchPlayerState,
  nextSong,
  pauseSong,
  playSong,
  previousSong,
  stopSong,
} from '../api/musicApi';
import type { PlayerState } from '../types/PlayerState';

interface UsePlayerReturn {
  playerState: PlayerState | null;
  isLoading: boolean;
  handlePlay: () => Promise<void>;
  handlePause: () => Promise<void>;
  handleStop: () => Promise<void>;
  handleNext: () => Promise<void>;
  handlePrevious: () => Promise<void>;
  refreshPlayer: () => Promise<void>;
}

export function usePlayer(
  onPlaylistRefresh: () => Promise<void>,
  onSuccess: (message: string) => void,
  onError: (message: string) => void,
): UsePlayerReturn {
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const intervalIdRef = useRef<number | null>(null);

  const refreshPlayer = useCallback(async () => {
    try {
      const state = await fetchPlayerState();
      setPlayerState((prev) => {
        if (!prev) return state;
        return { ...state, status: prev.status };
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar el estado';
      onError(message);
    }
  }, [onError]);

  const handlePlay = useCallback(async () => {
    setIsLoading(true);
    try {
      const state = await playSong();
      setPlayerState(state);
      onSuccess('▶ Reproduciendo');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al reproducir';
      onError(message);
    } finally {
      setIsLoading(false);
    }
  }, [onError, onSuccess]);

  const handlePause = useCallback(async () => {
    setIsLoading(true);
    try {
      const state = await pauseSong();
      setPlayerState(state);
      onSuccess('⏸ Pausado');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al pausar';
      onError(message);
    } finally {
      setIsLoading(false);
    }
  }, [onError, onSuccess]);

  const handleStop = useCallback(async () => {
    setIsLoading(true);
    try {
      const state = await stopSong();
      setPlayerState(state);
      await onPlaylistRefresh();
      onSuccess('Detenido');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al detener';
      onError(message);
    } finally {
      setIsLoading(false);
    }
  }, [onError, onPlaylistRefresh, onSuccess]);

  const handleNext = useCallback(async () => {
    setIsLoading(true);
    try {
      const state = await nextSong();
      setPlayerState(state);
      await onPlaylistRefresh();
      onSuccess('⏭ Siguiente canción');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cambiar de canción';
      onError(message);
    } finally {
      setIsLoading(false);
    }
  }, [onError, onPlaylistRefresh, onSuccess]);

  const handlePrevious = useCallback(async () => {
    setIsLoading(true);
    try {
      const state = await previousSong();
      setPlayerState(state);
      await onPlaylistRefresh();
      onSuccess('⏮ Canción anterior');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cambiar de canción';
      onError(message);
    } finally {
      setIsLoading(false);
    }
  }, [onError, onPlaylistRefresh, onSuccess]);

  useEffect(() => {
    void refreshPlayer();
  }, [refreshPlayer]);

  useEffect(() => {
    if (playerState?.status !== 'PLAYING') {
      if (intervalIdRef.current !== null) {
        window.clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      return;
    }

    if (intervalIdRef.current !== null) return;

    intervalIdRef.current = window.setInterval(() => {
      void refreshPlayer();
    }, 3000);

    return () => {
      if (intervalIdRef.current !== null) {
        window.clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [playerState?.status, refreshPlayer]);

  return useMemo(
    () => ({
      playerState,
      isLoading,
      handlePlay,
      handlePause,
      handleStop,
      handleNext,
      handlePrevious,
      refreshPlayer,
    }),
    [
      playerState,
      isLoading,
      handlePlay,
      handlePause,
      handleStop,
      handleNext,
      handlePrevious,
      refreshPlayer,
    ],
  );
}
