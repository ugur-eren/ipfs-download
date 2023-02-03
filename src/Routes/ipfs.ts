import {join} from 'node:path';
import {createReadStream} from 'node:fs';
import express from 'express';
import fetch from 'node-fetch';
import fileUpload from 'express-fileupload';
import FormData from 'form-data';
import HTTPStatus from '../Utils/HTTPStatus';
import {IPFS_API_URL, IPFS_FOLDER, PINATA_JWT_TOKEN} from '../Utils/Constants';
import {FileDownloader, FileExists} from '../Utils/Helpers';
import IpfsState from '../Utils/IpfsState';

const Router = express.Router();

Router.put('/json', async (req, res) => {
  const {fileName, data} = req.body;

  const content = JSON.stringify({
    pinataOptions: {
      cidVersion: 1,
    },
    pinataMetadata: {
      name: fileName,
    },
    pinataContent: data,
  });

  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    body: content,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PINATA_JWT_TOKEN}`,
    },
  });

  const responseJSON = await response.json();

  res.status(HTTPStatus.OK).send(responseJSON);
});

Router.put(
  '/file',
  fileUpload({
    useTempFiles: false,
  }),
  async (req, res) => {
    if (!req.files?.file) {
      res.status(HTTPStatus.BadRequest).send('No file provided');
      return;
    }

    let {file} = req.files;
    if (Array.isArray(file)) {
      if (file.length > 1) {
        res.status(HTTPStatus.BadRequest).send('Multiple files provided');
        return;
      }

      // eslint-disable-next-line prefer-destructuring
      file = file[0];
    }

    if (!file) {
      res.status(HTTPStatus.BadRequest).send('No file provided');
      return;
    }

    const formData = new FormData();
    formData.append('file', file.data, {
      filename: file.name,
      contentType: file.mimetype,
    });
    formData.append('pinataMetadata', JSON.stringify({name: file.name}));
    formData.append('pinataOptions', JSON.stringify({cidVersion: 0}));

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      body: formData.getBuffer(),
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${PINATA_JWT_TOKEN}`,
      },
    });

    const responseJSON = await response.json();

    res.status(HTTPStatus.OK).send(responseJSON);
  },
);

Router.get('/:hash', async (req, res) => {
  const {hash} = req.params;

  // Download the file if it doesn't exist
  if (!(await FileExists(join(IPFS_FOLDER, hash)))) {
    const response = await FileDownloader(
      IPFS_API_URL.replace('{hash}', hash),
      join(IPFS_FOLDER, hash),
    );

    if (!response.ok) {
      res.status(HTTPStatus.NotFound).send();
      return;
    }

    // Set content-type to the IPFS state if available
    const contentType = response.response.headers.get('content-type');
    if (contentType) {
      IpfsState.set(hash, contentType);
    }
  }

  res.status(HTTPStatus.OK);

  // Set content-type header if available
  const contentType = IpfsState.get(hash);
  if (contentType) {
    res.header('content-type', contentType);
  }

  // Cache for 30 days
  res.header('cache-control', `max-age=${60 * 60 * 24 * 30}`);

  createReadStream(join(IPFS_FOLDER, hash)).pipe(res);
});

export default Router;
