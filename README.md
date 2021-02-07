![relaxing clock hero](https://res.cloudinary.com/dwdxct1u5/image/upload/v1611696123/Relaxing%20Clock/relaxing-clock-hero_tn7dbw.svg)
# What is RelaxingClock
Relaxing Clock is an **awesome** website that uses Spotify's WEB PLAYBACK SDK to play **awesome** relaxing music to chill you out, and it looks **awesome** 
on your desktop display as screensaver.
It is design to work primarely on desktop computer, as the WEB PLAYBACK SDK is not compatible with smartphones and tablets, but you can still enjoy the look of the time!

## Disclaimer
The images of the cities that you can see when the "Globetrotter" style is enabled (previously located at `/static/svg/cities`) are **NOT** under the same license. 
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

## Report a bug
Please, also include a description of the the error and an output of the browser console if possible, it will help a lot!
  
## Libraries
- jQuery
- Normalize.css
- Mobile-detect.js [LINK](https://github.com/hgoebl/mobile-detect.js)
- Moment.js && Moment-timezone [Link](https://momentjs.com/)
- Anime.js [Link](https://animejs.com/)
- Suncalc [Link](https://github.com/mourner/suncalc)
- RandomColor [Link](https://github.com/davidmerfield/randomColor)
- ConnorAtherton/loaders.css [Link](https://github.com/ConnorAtherton/loaders.css)

## Thanks to 
- aaronpk/pkce-vanilla-js [LINK](https://github.com/aaronpk/pkce-vanilla-js)
- IcoMoon [LINK](https://icomoon.io/app/)
- Linearicons and FontAwesome
- W3S (always thank them)
