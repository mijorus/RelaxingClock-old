let apiKey = undefined;

export function getKey() {
    if (apiKey) {
        return $.Deferred.done(() => true);
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
export function getVideos(query, category, additionalParams = {}, order = 'popular', video_type = 'film') {
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
            q: query,
            category: category,
            order: order,
            video_type: video_type,
            safesearch: true,
            ...additionalParams,
        }
    })
        .fail(function (error) {
            console.error(error.responseText);
        })
}