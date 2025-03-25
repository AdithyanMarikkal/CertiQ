import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import "../pages/register.css"; 

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
      if (!window.ethereum) {
        alert("MetaMask is required to register.");
        return;
      }
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            checkIfRegistered(accounts[0]);
          }
          window.ethereum.on("accountsChanged", (newAccounts) => {
            if (newAccounts.length > 0) {
              setAccount(newAccounts[0]);
              checkIfRegistered(newAccounts[0]);
            } else {
              setAccount(null);
              setIsRegistered(false);
            }
          });
        } catch (error) {
          console.error("Error connecting MetaMask:", error);
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

      //For debugging 
      console.log("Requesting registration for:");
      console.log("Institution Name:", institutionName);
      console.log("Acronym:", acronym);
      console.log("Website:", website);
      console.log("Institute Address:", account);


      //lines above for debugging



      const tx = await contract.requestRegistration(institutionName, acronym, website);
      console.log("Transaction sent:", tx.hash);
      //above line for debugging
      await tx.wait();

      alert("Registration request sent successfully! Await admin approval.");
      navigate("/");
    } catch (error) {
      console.error("Request failed:", error);
      if (error.code === -32002) {
        alert("MetaMask is already processing a request. Please wait.");
      } else if (error.code === "CALL_EXCEPTION") {
        alert("Transaction reverted. Please check contract requirements.");
      } else {
        alert("Failed to send request. Check console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="register-container">
    <div className="decoration decoration-1"></div>
    <div className="decoration decoration-2"></div>
      <div className="register-content">
        <div className="register-card">
          <h1 className="register-title">Request Institute Registration</h1>
          
          
          <div className="form-group">
            <label htmlFor="institutionName">Institution Name</label>
            <input
              id="institutionName"
              type="text"
              placeholder="Enter Institution Name"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              disabled={loading || isRegistered}
              className="register-input"
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
              className="register-input"
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
              className="register-input"
            />
          </div>

          <button 
            className="register-button"
            onClick={requestRegistration} 
            disabled={loading || !account || isRegistered}
          >
            {loading ? "Requesting..." : isRegistered ? "Already Registered" : "Request Registration"}
          </button>
        </div>
      </div>
    </div>
  </>
  );
};

export default Register;