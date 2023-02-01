import {createWriteStream} from 'node:fs';
import fs from 'node:fs/promises';
import fetch from 'node-fetch';

export const GetPostgresTimestamp = (date: Date = new Date()): string => {
  /**
   * Date.prototype.toISOString returns: 2022-01-22T13:59:11.983Z
   * Postgres wants: 2022-01-22 13:59:11
   *
   * Replace T with ` ` (space)
   * Split by . (dot) to remove ms
   */
  return date.toISOString().replace('T', ' ').split('.')[0];
};

export const FileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch (_) {
    return false;
  }
};

export const FileDownloader = async (
  url: string,
  savePath: string,
): Promise<
  | {
      ok: true;
    }
  | {
      ok: false;
      error: 'download' | 'write';
    }
> => {
  return new Promise((resolve) => {
    fetch(url).then((response) => {
      const writeStream = createWriteStream(savePath);

      if (!response.ok || !response.body) {
        resolve({ok: false, error: 'download'});
      }

      response.body.pipe(writeStream);

      writeStream.on('error', () => {
        resolve({ok: false, error: 'write'});
      });

      writeStream.on('finish', () => {
        resolve({ok: true});
      });
    });
  });
};
