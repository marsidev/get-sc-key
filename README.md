## What is this?

This is an API to generate a fresh API key for Supercell games for your current IP. It supports [Clash Royale](https://developer.clashroyale.com), [Clash of Clans](https://developer.clashofclans.com) and [Brawl Stars](https://developer.brawlstars.com).

## Why?

Those API's has a limitation of **one API key per IP** and a maximum of 10 API keys per user. This is fine if you are using a single IP, but if you are using multiple IPs, you will need to generate a new API key for each IP.

## How to use it?

You can use this API by making a POST request to the following URL `https://get-sc-key-production.up.railway.app` adding in the body your user credentials and the game id you want to generate a key for. Example:
```json
{
  "game": "clashroyale",
  "email": "yourmail",
  "password": "yourpassword"
}
```
Then you will receive a JSON response like this: 
```json
{
  "name": "Key generated at 8/2/2022 6:19:26 p. m.",
  "description": "Key for non-commercial use",
  "ipRange": [
    "xx.xx.xx.xx"
  ],
  "key": "your_key"
}
```
    Supported game IDs: clashroyale, clashofclans, brawlstars, cr, coc, bs
    Mirror API URLs: https://get-sc-key.vercel.app, https://get-sc-key.herokuapp.com

## Run locally
- `$ npm run install`
- `$ npm run start`
- Then you can make your requests to `https://localhost:1234`

## How it works?

This API login into the game developer portal with your credentials, check if exists a key for your IP and if not, **delete the first key** and generate a new one for your IP. Otherwise, it will return the existing key. The logic is inspired on [TheLearneer/supercell-api](https://github.com/TheLearneer/supercell-api). The IP is obtained from [ipify](https://api.ipify.org/).

## Optional parameters
### `whitelist`
You can send a whitelist array of API key-names to avoid deleting them. Example:
```json
{
  "game": "coc",
  "email": "yourmail",
  "password": "yourpassword",
  "whitelist": [
    "important-key-1",
    "important-key-2"
  ]
}
```

### `fixedIp`
You can set a fixed IP to use instead of the current one. Example:
```json
{
  "game": "bs",
  "email": "yourmail",
  "password": "yourpassword",
  "fixedIp": "11.22.33.44"
}
```

## Contributing

Any contributions you make are greatly appreciated. If you have a suggestion that would make this better, please fork the repo and create a Pull Request. You can also simply [open an issue](https://github.com/marsidev/get-sc-key/issues/new).