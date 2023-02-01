import {join} from 'node:path';

export const IPFS_FOLDER = join(__dirname, '../../ipfs');
export const IPFS_API_URL = process.env.IPFS_API_URL || 'https://cloudflare-ipfs.com/ipfs/{hash}';
