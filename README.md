# IPFS Download & Upload

This is a simple node - express server that allows you to download and upload files from IPFS using a simple HTTP request.
I made this to learn how to use IPFS and to make it easier to download and upload files from IPFS.
This is not meant to be used in production, but you can use it if you want.

## How to use

### Download

To download a file from IPFS, you need to make a GET request to the server with the hash of the file you want to download.
Downloaded file will be saved in the `ipfs` folder and served from there. If the file already exists, it will not be downloaded again.

Example using curl:

```bash
curl --location --request GET 'http://server:port/ipfs/{FileHash}'
```

### Upload JSON

To upload a JSON file to IPFS, you need to make a PUT request to the server with the JSON file as the body.

Example using curl:

```bash
curl --location --request PUT 'http://server:port/ipfs/json' \
--header 'Content-Type: application/json' \
--data-raw '{
    "fileName": "Name of the File",
    "data": {
        "somekey":"somevalue"
    }
}'
```

### Upload File

To upload a file to IPFS, you need to make a PUT request to the server with the file as the body.

Example using curl:

```bash
curl --location --request PUT 'http://server:port/ipfs/file' \
--form 'file=@"/Users/Desktop/file.ext"'
```
