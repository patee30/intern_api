
async function GetAccessToken(value, getAccessToken) {
    const api_key = value.toString();
    const data_raw = {'code': api_key};

    const request = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data_raw)
    };

    const response = await fetch(`${access_token_endpoint}/v1/token`, request);
     
    const data_rep = await response.json();

    getAccessToken(data_rep.access_token.toString());

    await delayAsync(10);
}

function delayAsync(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}