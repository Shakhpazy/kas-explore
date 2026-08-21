import axios from 'axios';

const BASE_URL = 'https://api.kaspa.org';

export async function getNetworkBlueScore() {
    try {
        const response = await axios.get(`${BASE_URL}/info/virtual-chain-blue-score`);
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

export async function getNetworkKaspad() {
    try {
        const response = await axios.get(`${BASE_URL}/info/kaspad`);
        return response.data;
    } catch (error) {
        console.error('Error fetching network kaspad info:', error);
        throw error;
    }
}

export async function getNetworkFees() {
    try {
        const response = await axios.get(`${BASE_URL}/info/fee-estimate`);
        return response.data;
    } catch (error) {
        console.error('Error fetching network fee estimate:', error);
        throw error;
    }
}

export async function getPrice() {
    try {
        const response = await axios.get(`${BASE_URL}/info/price`);
        return response.data;
    } catch (error) {
        console.error('Error fetching price info:', error);
        throw error;
    }
}

export async function getNetworkHalving() {
    try {
        const response = await axios.get(`${BASE_URL}/info/halving`);
        return response.data;
    } catch (error) {
        console.error('Error fetching network halving info:', error);
        throw error;
    }
} 

export async function getNetworkHashrate() {
    try {
        const response = await axios.get(`${BASE_URL}/info/hashrate`);
        return response.data;
    } catch (error) {
        console.error('Error fetching network hashrate info:', error);
        throw error;
    }
}

export async function getNetworkHashrateMax() {
    try {
        const response = await axios.get(`${BASE_URL}/info/hashrate/max`);
        return response.data;
    } catch (error) {
        console.error('Error fetching network max hashrate info:', error);
        throw error;
    }
}

export async function getNetworkHashrateHistory() {
    try {
        const response = await axios.get(`${BASE_URL}/info/hashrate/history`);
        return response.data;
    } catch (error) {
        console.error('Error fetching network hashrate history info:', error);
        throw error;
    }
}

export async function getNetworkHealth() {
    try {
        const response = await axios.get(`${BASE_URL}/info/health`);
        return response.data;
    } catch (error) {
        console.error('Error fetching network health info:', error);
        throw error;
    }
}

export async function getNetworkMarketcap() {
    try {
        const response = await axios.get(`${BASE_URL}/info/marketcap`);
        return response.data;
    } catch (error) {
        console.error('Error fetching network market cap info:', error);
        throw error;
    }
}