import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../middlewares/errorHandler';
import { MusicPlayerFacade } from '../facade/MusicPlayerFacade';

const facade = new MusicPlayerFacade();

type SuccessResponse<T> = {
  success: true;
  data: T;
  message: string;
};

type ErrorResponse = {
  success: false;
  error: string;
  message: string;
};

export class MusicController {
  public static addSong(req: Request, res: Response, next: NextFunction): void {
    try {
      const { title, artist, duration, position, audioUrl, coverUrl } = req.body as {
        title?: unknown;
        artist?: unknown;
        duration?: unknown;
        position?: unknown;
        audioUrl?: unknown;
        coverUrl?: unknown;
      };

      const dto = {
        title: title as string,
        artist: artist as string,
        duration: duration as number,
        position: typeof position === 'number' ? position : undefined,
        audioUrl: typeof audioUrl === 'string' ? audioUrl : undefined,
        coverUrl: typeof coverUrl === 'string' ? coverUrl : undefined,
      };

      const song = facade.addSong(dto, dto.position);
      const response: SuccessResponse<typeof song> = {
        success: true,
        data: song,
        message: 'Song added successfully',
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static removeSong(req: Request, res: Response, next: NextFunction): void {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        throw new AppError('Invalid song id', 400);
      }

      const removed = facade.removeSong(id);
      const response: SuccessResponse<typeof removed> = {
        success: true,
        data: removed,
        message: 'Song removed successfully',
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static getPlaylist(req: Request, res: Response, next: NextFunction): void {
    try {
      const playlist = facade.getPlaylist();
      const response: SuccessResponse<typeof playlist> = {
        success: true,
        data: playlist,
        message: 'Playlist retrieved successfully',
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static getCurrentSong(req: Request, res: Response, next: NextFunction): void {
    try {
      const current = facade.getCurrentSong();
      const response: SuccessResponse<typeof current> = {
        success: true,
        data: current,
        message: 'Current song retrieved successfully',
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static setCurrentSong(req: Request, res: Response, next: NextFunction): void {
    try {
      const { id } = req.body as { id?: unknown };
      const numericId = Number(id);
      if (!Number.isFinite(numericId)) {
        throw new AppError('Invalid song id', 400);
      }

      const status = facade.setCurrentSong(numericId);
      const response: SuccessResponse<typeof status> = {
        success: true,
        data: status,
        message: 'Current song updated successfully',
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static play(req: Request, res: Response, next: NextFunction): void {
    try {
      const status = facade.play();
      const response: SuccessResponse<typeof status> = {
        success: true,
        data: status,
        message: 'Playback started',
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static pause(req: Request, res: Response, next: NextFunction): void {
    try {
      const status = facade.pause();
      const response: SuccessResponse<typeof status> = {
        success: true,
        data: status,
        message: 'Playback paused',
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static stop(req: Request, res: Response, next: NextFunction): void {
    try {
      const status = facade.stop();
      const response: SuccessResponse<typeof status> = {
        success: true,
        data: status,
        message: 'Playback stopped',
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static next(req: Request, res: Response, next: NextFunction): void {
    try {
      const status = facade.next();
      const response: SuccessResponse<typeof status> = {
        success: true,
        data: status,
        message: 'Moved to next song',
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static previous(req: Request, res: Response, next: NextFunction): void {
    try {
      const status = facade.previous();
      const response: SuccessResponse<typeof status> = {
        success: true,
        data: status,
        message: 'Moved to previous song',
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static getHistory(req: Request, res: Response, next: NextFunction): void {
    try {
      const history = facade.getHistory();
      const response: SuccessResponse<typeof history> = {
        success: true,
        data: history,
        message: 'History retrieved successfully',
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}
