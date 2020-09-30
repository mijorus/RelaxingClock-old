# What is RelaxingClock
Relaxing Clock is an **awesome** website that uses Spotify's WEB PLAYBACK SDK to play **awesome** relaxing music to chill you out, and it looks **awesome** 
on your desktop display as screensaver.
It is design to work primarely on desktop computer, as the WEB PLAYBACK SDK is not compatible with smartphones and tablets, but you can still enjoy the look of the time!

## Disclaimer
The images of the cities that you can see when the "Globetrotter" style is enabled (previously located at `/static/svg/cities`) are **NOT** under the same licence. 
They are artworks owned by Shutterstock user @JosepPerianes and you can't use or download them without the artist's permission. Those images are now hosted on 
external sources and will not be included in the build.

## Build yourself
Requirements:
- Hugo 0.75.1 **Extended** (always check `netlify.toml` before attempting a build, to make sure you are using the same version of the server). You can get
    HUGO [HERE](https://gohugo.io/)
- A Client ID for your app (required if you want to use the Spotify Integration). You can create a new app [HERE](https://developer.spotify.com/dashboard/applications)

Clone this REPO:
```
https://github.com/mijorus/RelaxingClock.git
```  
  
Set your ClientID as an environment variable (code for Windows PowerShell)
```
$env:HUGO_SPOTIFY_CLIENT_ID="YOUR_CLIENT_ID_HERE"
```  
  
Launch the HUGO server
```
hugo server --environment development -p 3000
```
make sure you are using the --environment flag
  

Enjoy!