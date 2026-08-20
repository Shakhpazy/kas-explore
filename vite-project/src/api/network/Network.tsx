import axios from 'axios';

const BASE_URL = 'https://api.kaspa.org';

export async function getNetworkBlueScore() {
    try {
        const response = await axios.get(`${BASE_URL}/info/blue-score`);
        return response.data;
    } catch (error) {
        console.error('Error fetching network blue score:', error);
        throw error;
    }
}

export async function getNetworkCoinsupply() {
    try {
        const response = await axios.get(`${BASE_URL}/info/coinsupply`);
        return response.data;
    } catch (error) {
        console.error('Error fetching network coin supply:', error);
        throw error;
    }
}
