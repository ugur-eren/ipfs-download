import fs from 'node:fs/promises';
import {join} from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import router from './router';
import {FileExists} from './Utils/Helpers';
import {IPFS_FOLDER} from './Utils/Constants';
import IpfsState from './Utils/IpfsState';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use('/', router);

const PORT = process.env.PORT || 3002;

app.listen(PORT, async () => {
  const contentTypesPath = join(IPFS_FOLDER, 'ContentTypes.json');

  // Create ContentTypes.json if it doesn't exist
  if (!(await FileExists(contentTypesPath))) {
    await fs.writeFile(contentTypesPath, '{}', 'utf-8');
  }

  // Initialize IpfsState with the ContentTypes.json file contents
  IpfsState.initialize(JSON.parse(await fs.readFile(contentTypesPath, 'utf-8')));

  // Subscribe to IpfsState changes and write the new state to ContentTypes.json
  IpfsState.subscribe(async () => {
    await fs.writeFile(contentTypesPath, JSON.stringify(IpfsState.state), 'utf-8');
  });

  console.info(`Express server started listening on port ${PORT}`);
});
