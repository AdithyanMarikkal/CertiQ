import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "../style/admin.css";
import { getContractInstance } from "../utils/getABI.js";
const API_URL =import.meta.env.VITE_GETABI || "http://localhost:5000/api/abi";

async function fetchABI() {
  try {
      const response = await fetch(API_URL);
      return await response.json();
  } catch (error) {
      console.error("Error fetching ABI:", error);
      return null;
  }
}
let contractABI = null;
async function init() {
  contractABI = await fetchABI();
}
init();

const Admin = () => {
  const [pendingInstitutes, setPendingInstitutes] = useState([]);
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
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
      const contract = await getContractInstance(contractAddress);
      if (!contract) return;
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
    setLoading(true);

    try {
      const contract = await getContractInstance(contractAddress);
      if (!contract) return;
      
      // Get all InstituteRequested events
      const requestFilter = contract.filters.InstituteRequested();
      const requestEvents = await contract.queryFilter(requestFilter);
      
      // Get all InstituteRegistered events
      const registeredFilter = contract.filters.InstituteRegistered();
      const registeredEvents = await contract.queryFilter(registeredFilter);
      
      // Extract addresses from events
      const requestedAddresses = requestEvents.map(event => event.args.instituteAddress);
      const registeredAddresses = registeredEvents.map(event => event.args.instituteAddress);
      
      // Filter out addresses that have already been registered
      const pendingAddresses = requestedAddresses.filter(
        addr => !registeredAddresses.includes(addr)
      );
      
      // For each pending address, check if it's still in the pendingRequests mapping
      const confirmedPending = [];
      for (const addr of pendingAddresses) {
        const pendingInfo = await contract.getPendingInstitute(addr);
        if (pendingInfo[3]) { // Check if exists flag is true
          confirmedPending.push({
            address: addr,
            name: pendingInfo[0],
            acronym: pendingInfo[1],
            website: pendingInfo[2]
          });
        }
      }
      
      setPendingInstitutes(confirmedPending);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const approveInstitute = async (instituteAddress) => {
    if (!window.ethereum || !contractAddress) return;
    setLoading(true);

    try {
      const contract = await getContractInstance(contractAddress);
      if (!contract) return;

      const tx = await contract.approveRegistration(instituteAddress);
      await tx.wait();

      alert("Institute approved successfully!");
      fetchPendingRequests(); // Refresh list
    } catch (error) {
      console.error("Approval failed:", error);
      alert("Failed to approve institute.");
    } finally {
      setLoading(false);
    }
  };

  const rejectInstitute = async (instituteAddress) => {
    if (!window.ethereum || !contractAddress || actionInProgress) return;
    setActionInProgress(true);

    try {
      const contract = await getContractInstance(contractAddress);
      if (!contract) return;

      const tx = await contract.rejectRegistration(instituteAddress);
      await tx.wait();

      alert("Institute rejected successfully!");
      fetchPendingRequests(); // Refresh list
    } catch (error) {
      console.error("Rejection failed:", error);
      alert("Failed to reject institute.");
    } finally {
      setActionInProgress(false);
    }
  };

  // Setup event listener for real-time updates
  useEffect(() => {
    if (!contractAddress || !window.ethereum) return;

    const setupEventListeners = async () => {
      const contract = await getContractInstance(contractAddress);
      if (!contract) return;
      
      // Listen for new registration requests
      contract.on("InstituteRequested", (address, name) => {
        console.log("New institute requested:", address, name);
        fetchPendingRequests();
      });
      
      // Listen for new approvals
      contract.on("InstituteRegistered", (address, name, time) => {
        console.log("Institute registered:", address, name);
        fetchPendingRequests();
      });

      contract.on("InstituteRejected", (address, name) => {
        console.log("Institute rejected:", address, name);
        fetchPendingRequests();
      });
    };
    
    setupEventListeners();
    
    // Cleanup event listeners on component unmount
    return () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      contract.removeAllListeners("InstituteRequested");
      contract.removeAllListeners("InstituteRegistered");
      contract.removeAllListeners("InstituteRejected");
    };
  }, [contractAddress]);

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>
      {!isAdmin ? (
        <p>Access Denied: You are not the admin.</p>
      ) : (
        <>
          <h2>Pending Registration Requests</h2>
          <button 
            onClick={fetchPendingRequests} 
            disabled={loading}
            className="refresh-button"
          >
            {loading ? "Loading..." : "Refresh Requests"}
          </button>
          
          {loading ? (
            <p>Loading pending requests...</p>
          ) : pendingInstitutes.length === 0 ? (
            <p>No pending requests found.</p>
          ) : (
            <ul className="pending-list">
              {pendingInstitutes.map((institute) => (
                <li key={institute.address} className="pending-item">
                  <div className="institute-details">
                    <p><strong>Name:</strong> {institute.name}</p>
                    <p><strong>Acronym:</strong> {institute.acronym}</p>
                    <p><strong>Website:</strong> {institute.website}</p>
                    <p><strong>Address:</strong> {institute.address}</p>
                  </div>

                  
                  <div className="action-buttons">
                  <button 
                    onClick={() => approveInstitute(institute.address)} 
                    disabled={actionInProgress}
                    className="approve-button"
                  >
                    Approve
                  </button>
                  <button 
                      onClick={() => rejectInstitute(institute.address)} 
                      disabled={actionInProgress}
                      className="reject-button"
                    >
                      Reject
                    </button>
                    </div>
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