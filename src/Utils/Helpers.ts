import {createWriteStream} from 'node:fs';
import fs from 'node:fs/promises';
import fetch, {Response} from 'node-fetch';

/**
 * Checks if a file exists
 * @param filePath Path to the file
 * @returns Boolean indicating if the file exists
 */
export const FileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Downloads a file from a URL and saves it to a path
 * @param url URL to download from
 * @param savePath Path to save the file to
 * @returns Object indicating if the download was successful and the response
 */
export const FileDownloader = async (
  url: string,
  savePath: string,
): Promise<
  | {
      ok: true;
      response: Response;
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
        resolve({ok: true, response});
      });
    });
  });
};
