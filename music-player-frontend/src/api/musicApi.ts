import type { PlayerState, PlayerStatus, PlaylistResponse } from '../types/PlayerState';
import type { Song, SongDTO } from '../types/Song';

const BASE_URL =
  (import.meta as unknown as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ??
  'https://spotify-backend-pvew.onrender.com/api/music';

type ApiSuccess<T> = { success: true; data: T; message: string };
type ApiError = { success: false; error: string; message: string };
type ApiResponse<T> = ApiSuccess<T> | ApiError;

type PlayerStatusDTO = {
  status: string;
  currentSong: Song | null;
  totalSongs: number;
};

function normalizeBackendMessage(message: string): string {
  return message.trim();
}

function toSpanishError(message: string): string {
  const trimmed = normalizeBackendMessage(message);

  const duplicate = trimmed.match(/^Duplicate song:\s*'(.+)'\s+by\s+'(.+)'\s+already exists$/);
  if (duplicate) {
    const [, title, artist] = duplicate;
    return `La canción '${title}' de '${artist}' ya existe`;
  }

  if (/^Song with id\s+\d+\s+not found$/.test(trimmed)) {
    return 'Canción no encontrada';
  }

  if (trimmed === 'Cannot play: no current song selected') {
    return 'No se puede reproducir: no hay una canción seleccionada';
  }

  if (trimmed === 'Cannot pause: player is not playing') {
    return 'No se puede pausar: el reproductor no está reproduciendo';
  }

  return trimmed.length > 0 ? trimmed : 'No se pudo conectar con el servidor';
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, options);
  } catch {
    throw new Error('No se pudo conectar con el servidor');
  }

  const raw = await response.text();
  let parsed: ApiResponse<T> | null = null;
  if (raw.trim().length > 0) {
    try {
      parsed = JSON.parse(raw) as ApiResponse<T>;
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    const message =
      parsed && typeof parsed === 'object' && 'message' in parsed ? String(parsed.message) : '';
    throw new Error(message ? toSpanishError(message) : 'No se pudo conectar con el servidor');
  }

  if (!parsed || parsed.success === false) {
    const message =
      parsed && typeof parsed === 'object' && 'message' in parsed ? String(parsed.message) : '';
    throw new Error(message ? toSpanishError(message) : 'No se pudo conectar con el servidor');
  }

  return parsed.data;
}

function toPlayerState(dto: PlayerStatusDTO): PlayerState {
  const status = dto.status as PlayerStatus;
  return {
    status,
    currentSong: dto.currentSong ?? null,
    totalSongs: dto.totalSongs,
  };
}

export async function fetchPlaylist(): Promise<PlaylistResponse> {
  return request<PlaylistResponse>('/playlist');
}

export async function addSong(dto: SongDTO): Promise<Song> {
  try {
    return await request<Song>('/song', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    throw new Error(message || 'Error al agregar la canción');
  }
}

export async function removeSong(id: number): Promise<boolean> {
  try {
    return await request<boolean>(`/song/${id}`, { method: 'DELETE' });
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    throw new Error(message || 'Canción no encontrada');
  }
}

export async function fetchPlayerState(): Promise<PlayerState> {
  try {
    const [currentSong, playlist] = await Promise.all([
      request<Song | null>('/current'),
      fetchPlaylist(),
    ]);

    return {
      status: 'STOPPED',
      currentSong,
      totalSongs: playlist.total,
    };
  } catch {
    throw new Error('No se pudo conectar con el servidor');
  }
}

export async function playSong(): Promise<PlayerState> {
  try {
    const dto = await request<PlayerStatusDTO>('/play', { method: 'POST' });
    return toPlayerState(dto);
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    throw new Error(message || 'Error al reproducir');
  }
}

export async function pauseSong(): Promise<PlayerState> {
  try {
    const dto = await request<PlayerStatusDTO>('/pause', { method: 'POST' });
    return toPlayerState(dto);
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    throw new Error(message || 'Error al pausar');
  }
}

export async function stopSong(): Promise<PlayerState> {
  try {
    const dto = await request<PlayerStatusDTO>('/stop', { method: 'POST' });
    return toPlayerState(dto);
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    throw new Error(message || 'Error al detener');
  }
}

export async function nextSong(): Promise<PlayerState> {
  try {
    const dto = await request<PlayerStatusDTO>('/next', { method: 'POST' });
    return toPlayerState(dto);
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    throw new Error(message || 'Error al cambiar de canción');
  }
}

export async function previousSong(): Promise<PlayerState> {
  try {
    const dto = await request<PlayerStatusDTO>('/previous', { method: 'POST' });
    return toPlayerState(dto);
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    throw new Error(message || 'Error al cambiar de canción');
  }
}

export async function setCurrentSong(id: number): Promise<PlayerState> {
  try {
    const dto = await request<PlayerStatusDTO>('/current', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    return toPlayerState(dto);
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    throw new Error(message || 'Canción no encontrada');
  }
}

export async function fetchHistory(): Promise<Song[]> {
  try {
    return await request<Song[]>('/history');
  } catch {
    throw new Error('No se pudo cargar el historial');
  }
}
