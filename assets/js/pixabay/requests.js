let apiKey = '20260573-2eafd6a566d87c22e06be61bf';

export function getKey() {
    if (apiKey) {
        return $.Deferred()
            .done(() => true)
            .resolve()
    }
    
    return $.ajax({
        method: "GET",
        url: '/.netlify/functions/pixabay',
        dataType: "json",
    })
        .done((res) => {
            if (res.apiKey) {
                apiKey = res.apiKey;
                return true;
            }
        })
        .fail(function (error) {
            console.error(error.responseText);
        })
}

/**
 * 
 * @param {array} query 
 * @param {string} category 
 * @param {Object} additionalParams
 */
export function getVideos(query = [], category, additionalParams = {}, order = 'popular', video_type = 'film') {
    if (!apiKey) return [];

    let queryString = '';
    if (query.length > 0) {
        query.forEach((param, index, array) => queryString += (array.length === (index + 1)) ? `${param}` : `${param}+`);
    }


    return $.ajax({
        method: 'GET',
        url: 'https://pixabay.com/api/videos',
        data: {
            key: apiKey,
            q: queryString,
            category: category,
            order: order,
            lang: 'en',
            video_type: video_type,
            safesearch: true,
            ...additionalParams,
        }
    })  
        .done((res) => {
            return res;
        })
        .fail((error) => {
            console.error(error.responseText);
        })
}