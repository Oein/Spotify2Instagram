# Spotify2Instagram

Upload what you are listening on spotify!

# Data dirs

```
Mac : ~/Library/Application Support/Spotify2Instagram
```

```
Listen count : Appdata/listens
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

# Example env

```env
IG_USERNAME="Spotify2InstagramUser"
IG_PASSWORD="HardestP@ssW0rdInTheWorld"
SP_CLIENT_ID="abcdefghijklmnopqrstuvwxyz1234567890"
SP_SECRET_KEY="0987654321bcdefghijklmnopqrstuv1234"
```
