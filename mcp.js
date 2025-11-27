// Код для работы с MCP API

const API_BASE_URL = 'https://api.example.com';

async function callMcpApi(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    return response.json();
}

export default { callMcpApi };