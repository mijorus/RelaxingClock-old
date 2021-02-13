exports.handler = async function (event, context) {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: 'Method not supported'
        }
    }

    const key = process.env.PIXABAY_API_KEY;

    if (!key) {
        return {
            statusCode: 404,
            body: 'Key not set'
        }
    }

    return {
        statusCode: 405,
        body: JSON.stringify({
            apiKey: key,
        })
    }
}