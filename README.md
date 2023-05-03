# Spotify2Instagram

Upload what you are listening on spotify!

# Data dirs

```
Mac : ~/Library/Application Support/Spotify2Instagram
```

```
Listen count : Appdata/listens
Images cache : Appdata/imgs
Error logs : Appdata/errors
Config file : Appdata/config.env
```

# Clone, Build, Enjoy

```sh
git clone https://github.com/Oein/Spotify2Instagram.git
cd Spotify2Instagram

npm install
npm run build
npm run release
```

# Where to get Spotify Client ID and Secret

Spotify developer dashboard is on [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)

- Your spotify application's website will be `sptoinsta://main`
- Your spotify application's redirect URI will be `sptoinsta://oauth`

# How to upgrade from `Top listens` not supported versions

1. Replace `https3A2F2Fopenspotifycom2F` to `[Empty]` in all files' names in your **Listen count** Directory
2. Replace `https3A2F2Fopenspotifycom2F` to `[Empty]` in all files' names in your **Images cache** Directory

# Example env

```env
IG_USERNAME="Spotify2InstagramUser"
IG_PASSWORD="HardestP@ssW0rdInTheWorld"
SP_CLIENT_ID="abcdefghijklmnopqrstuvwxyz1234567890"
SP_SECRET_KEY="0987654321bcdefghijklmnopqrstuv1234"
```
