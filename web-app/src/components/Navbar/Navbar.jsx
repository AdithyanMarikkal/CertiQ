import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Add useLocation
import { ethers } from "ethers";
import "./Navbar.css";

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
  }
];

const Navbar = () => {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [contract, setContract] = useState(null);
  const navigate = useNavigate();
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || "";
  const location = useLocation();
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const initContract = async () => {
      if (window.ethereum && contractAddress) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const contractInstance = new ethers.Contract(contractAddress, contractABI, provider);
          setContract(contractInstance);
        } catch (error) {
          console.error("Error initializing contract:", error);
        }
      }
    };
    
    initContract();
  }, [contractAddress]);


  useEffect(() => {
    const checkWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            checkAdmin(accounts[0]);
            checkIfRegistered(accounts[0]);
          }
        } catch (error) {
          console.error("Error checking MetaMask accounts:", error);
        }
      }
    };

    if (contract) {
      checkWallet();
    }

  }, [contract]);
  

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        checkAdmin(accounts[0]);

        if (contract) {
          checkIfRegistered(accounts[0]);
        }

      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      alert("Please install MetaMask to use this feature.");
    }
  };

  const checkAdmin = async (walletAddress) => {
    if (!contractAddress || !contract) return;

    try {
      const owner = await contract.owner();
    setIsAdmin(walletAddress.toLowerCase() === owner.toLowerCase());
    } catch (error) {
      console.error("Error checking admin:", error);
    }
  };

  const checkIfRegistered = async (address) => {
    if (!contract) return;
    try {
      const registered = await contract.isRegistered(address);
      setIsRegistered(registered);
    } catch (error) {
      console.error("Error checking registration status:", error);
      setIsRegistered(false);
    }
  };

 

  return (
    <nav className="navbar">
      <button onClick={() => navigate("/")}>CertiQ</button>
      <div>
        <button onClick={connectWallet} className="nav-button">
          {account ? "Connected" : "Connect"}
        </button>
        {location.pathname === "/" && account && !isRegistered &&(
          <button onClick={() => navigate("/register")}>Register Institute</button>
        )}
        
      </div>
    </nav>
  );
};

export default Navbar;

