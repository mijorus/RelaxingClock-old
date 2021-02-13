const axios = require('axios');

exports.handler = async function (event, context) {
    const ip = event.headers['client-ip'];

console.log(event)
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: 'Method not supported'
        }
    }

    try {
        const res = await axios.get('https://ipapi.co/' + ip + '/json/', {
            headers: {
                'content-type': 'application/json'
            }
        })

        if (res.data.error) {
            throw 'Request Errors';
        } else { 
            return {
                statusCode: 200,
                body: JSON.stringify({
                    unixtime: Math.floor(Date.now() / 1000),
                    timezone: res.data.timezone,
                })
            }
        }

    } catch (err) {
        return {
            statusCode: 500,
            body: 'Request failed'
        }
    }
}