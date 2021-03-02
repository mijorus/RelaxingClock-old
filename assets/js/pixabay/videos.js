import { getRandomIntInclusive } from "js/utils/utils";

export function generateTags() {
    const tags = [
        ['drone', 'mountain'],
        ['drone', 'sea'],
        ['drone', 'summer'],
        ['drone', 'snow'],
    ]

    return tags[getRandomIntInclusive(0, (tags.length - 1))];
}

var currentVideoIndex = undefined;
export function selectNextVideo(length) {
    if (!currentVideoIndex) {
        currentVideoIndex = getRandomIntInclusive(0, length - 1);
        return currentVideoIndex;
    } else if (currentVideoIndex === length - 1) {
        return 0;
    } else {
        return ++currentVideoIndex;
    }
}

export function getPictureIdUrl(hit, quality = '640x360') {
    return hit.picture_id ? 
        `https://i.vimeocdn.com/video/${hit.picture_id}_${quality}.jpg`
        : undefined;
}

export function getVideoUrl(hit, quality = 'medium') {
    return hit.videos[quality].url
}