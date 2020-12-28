export const compatibility = {
    login: false,
    isMobile: false,
    urlEncoding: true,
    notification: false,
    //Credits: https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
    firefox: typeof InstallTrigger !== 'undefined',
    onlineStatus: false,
}

export function runCompatibilityDetector() {
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    const md = new MobileDetect(window.navigator.userAgent);

    if (md.mobile() === null && window.btoa) {
        compatibility.login = true;
    }

    if (!window.btoa) {
        urlEncoding = false;
    }

    if (md.mobile() !== null) {
        compatibility.isMobile = true;
    }

    if ('Notification' in window) {
        compatibility.notification = true;
    }

    compatibility.onlineStatus = navigator.onLine;
}


function updateOnlineStatus() {
    compatibility.onlineStatus = navigator.onLine;
}