import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import "../style/register.css"; 

const contractABI = [
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_institute", type: "address" }],
    name: "isRegistered",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_instituteAddress", type: "address" },
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_acronym", type: "string" },
      { internalType: "string", name: "_website", type: "string" },
    ],
    name: "requestRegistration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [institutionName, setInstitutionName] = useState("");
  const [acronym, setAcronym] = useState("");
  const [website, setWebsite] = useState("");
  const navigate = useNavigate();
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || "";

  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            checkIfRegistered(accounts[0]);
          }
        } catch (error) {
          console.error("Error connecting MetaMask:", error);
        }
      }
    };
    connectWallet();
  }, []);

  const checkIfRegistered = async (walletAddress) => {
    if (!walletAddress || !contractAddress) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const registered = await contract.isRegistered(walletAddress);

      setIsRegistered(registered);
      if (registered) {
        alert("You are already registered as an institute.");
      }
    } catch (error) {
      console.error("Error checking registration:", error);
    }
  };

  const requestRegistration = async () => {
    if (!window.ethereum) return;
    if (!institutionName.trim() || !acronym.trim() || !website.trim()) {
      alert("All fields are required.");
      return;
    }
    if (!account) {
      alert("Connect your wallet first.");
      return;
    }
    if (isRegistered) {
      alert("You are already registered.");
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const tx = await contract.requestRegistration(account, institutionName, acronym, website);
      await tx.wait();

      alert("Registration request sent successfully! Await admin approval.");
      navigate("/");
    } catch (error) {
      console.error("Request failed:", error);
      alert("Failed to send request. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
        <h1 className="registration-title">Request Institute Registration</h1>
        
        <div className="form-group">
          <label htmlFor="institutionName">Institution Name</label>
          <input
            id="institutionName"
            type="text"
            placeholder="Enter Institution Name"
            value={institutionName}
            onChange={(e) => setInstitutionName(e.target.value)}
            disabled={loading || isRegistered}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="acronym">Acronym</label>
          <input
            id="acronym"
            type="text"
            placeholder="Enter Acronym"
            value={acronym}
            onChange={(e) => setAcronym(e.target.value)}
            disabled={loading || isRegistered}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="website">Website URL</label>
          <input
            id="website"
            type="text"
            placeholder="Enter Website URL"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            disabled={loading || isRegistered}
          />
        </div>

        <button 
          className="registration-button"
          onClick={requestRegistration} 
          disabled={loading || !account || isRegistered}
        >
          {loading ? "Requesting..." : isRegistered ? "Already Registered" : "Request Registration"}
        </button>
      </div>
    </div>
  );
};

export default Register;
