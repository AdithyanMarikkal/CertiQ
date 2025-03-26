import { ethers } from "ethers";

const API_URL =import.meta.env.VITE_GETABI || "http://localhost:5000/api/abi"; // Change to Render URL after deployment

async function fetchABI() {
    try {
        const response = await fetch(API_URL);
        return await response.json();
    } catch (error) {
        console.error("Error fetching ABI:", error);
        return null;
    }
}

export async function getContractInstance(contractAddress) {
    if (!window.ethereum) {
        alert("MetaMask is not installed!");
        return null;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    const contractABI = await fetchABI();
    if (!contractABI) {
        alert("Failed to fetch contract ABI.");
        return null;
    }

    return new ethers.Contract(contractAddress, contractABI, signer);
}