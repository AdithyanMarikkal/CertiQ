import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const contractABI = [
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPendingRequests",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_institute", type: "address" }],
    name: "approveRegistration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const Admin = () => {
  const [pendingInstitutes, setPendingInstitutes] = useState([]);
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || "";

  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            checkAdmin(accounts[0]);
          }
        } catch (error) {
          console.error("Error connecting MetaMask:", error);
        }
      }
    };
    connectWallet();
  }, []);

  const checkAdmin = async (walletAddress) => {
    if (!walletAddress || !contractAddress) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const ownerAddress = await contract.owner();

      setIsAdmin(ownerAddress.toLowerCase() === walletAddress.toLowerCase());
      if (ownerAddress.toLowerCase() === walletAddress.toLowerCase()) {
        fetchPendingRequests();
      }
    } catch (error) {
      console.error("Error checking admin:", error);
    }
  };

  const fetchPendingRequests = async () => {
    if (!contractAddress) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const requests = await contract.getPendingRequests();
      setPendingInstitutes(requests);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  const approveInstitute = async (instituteAddress) => {
    if (!window.ethereum || !contractAddress) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const tx = await contract.approveRegistration(instituteAddress);
      await tx.wait();

      alert("Institute approved successfully!");
      fetchPendingRequests(); // Refresh list
    } catch (error) {
      console.error("Approval failed:", error);
      alert("Failed to approve institute.");
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>
      {!isAdmin ? (
        <p>Access Denied: You are not the admin.</p>
      ) : (
        <>
          <h2>Pending Registration Requests</h2>
          {pendingInstitutes.length === 0 ? (
            <p>No pending requests.</p>
          ) : (
            <ul>
              {pendingInstitutes.map((institute) => (
                <li key={institute}>
                  {institute}
                  <button onClick={() => approveInstitute(institute)}>Approve</button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default Admin;
