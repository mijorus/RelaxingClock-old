const axios = require('axios');
const { jsonQueryParse } = require('json-query-string');

exports.handler = async (event, context) => {
     if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed", event: event }) }
    } else {
        console.log(event);
        const bodyParams = JSON.parse(event.body);
        const baseURL = 'https://api.intra.42.fr/oauth/token'
        const code = bodyParams.code
        const state = bodyParams.state

        const apiResponse = await axios.post(baseURL, {
            client_id : '78c220293ecfd19a38ca6ce01e1e2f45452148cf98302e5568af77a130714ed8',
            grant_type : 'authorization_code',
            client_secret : `${process.env.FR_SECRET}`,
            code : `${code}`,
            redirect_uri : 'http://localhost:3000/',
            state : `${state}`
        })
            .then((res) => {
                return res
            })
            .catch((err) => {
                return err
            })
        
        console.log(apiResponse.data);
        
        if (apiResponse.status === 200) {
            return {
                statusCode: 200,
                body: JSON.stringify(apiResponse.data)
            }
        } else {
            return {
                statusCode: 401,
                body: JSON.stringify(apiResponse.data)
            }
        }
    }
}