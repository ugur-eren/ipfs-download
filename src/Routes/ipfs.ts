import {join} from 'node:path';
import {createReadStream} from 'node:fs';
import express from 'express';
import HTTPStatus from '../Utils/HTTPStatus';
import {IPFS_FOLDER} from '../Utils/Constants';
import {FileDownloader, FileExists} from '../Utils/Helpers';
import IpfsState from '../Utils/IpfsState';

const Router = express.Router();

Router.get('/:hash', async (req, res) => {
  const {hash} = req.params;

  if (!(await FileExists(join(IPFS_FOLDER, hash)))) {
    const response = await FileDownloader(
      `https://cloudflare-ipfs.com/ipfs/${hash}`,
      join(IPFS_FOLDER, hash),
    );

    if (!response.ok) {
      res.status(HTTPStatus.NotFound).send();
      return;
    }

    const contentType = response.response.headers.get('content-type');
    if (contentType) {
      IpfsState.set(hash, contentType);
    }
  }

  res.status(HTTPStatus.OK);

  // Set content-type if available
  const contentType = IpfsState.get(hash);
  if (contentType) {
    res.header('content-type', contentType);
  }

  // Cache for 30 days
  res.header('cache-control', `max-age=${60 * 60 * 24 * 30}`);

  createReadStream(join(IPFS_FOLDER, hash)).pipe(res);
});

export default Router;
