import express from 'express';

import IPFS from './Routes/ipfs';

const Router = express.Router();

Router.use('/ipfs', IPFS);

export default Router;
