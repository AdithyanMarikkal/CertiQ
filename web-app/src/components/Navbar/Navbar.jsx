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
];

const Navbar = () => {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || "";
  const location = useLocation();

  useEffect(() => {
    const checkWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            checkAdmin(accounts[0]);
          }
        } catch (error) {
          console.error("Error checking MetaMask accounts:", error);
        }
      }
    };

    checkWallet();

  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        checkAdmin(accounts[0]);

      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      alert("Please install MetaMask to use this feature.");
    }
  };

  const checkAdmin = async (walletAddress) => {
    if (!contractAddress) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const owner = await contract.owner();

      setIsAdmin(walletAddress.toLowerCase() === owner.toLowerCase());
    } catch (error) {
      console.error("Error checking admin:", error);
    }
  };

 

  return (
    <nav className="navbar">
      <button onClick={() => navigate("/")}>CertiQ</button>
      <div>
        <button onClick={connectWallet} className="nav-button">
          {account ? "Connected" : "Connect"}
        </button>
        {location.pathname === "/" && account && (
          <button onClick={() => navigate("/register")}>Register Institute</button>
        )}
        
      </div>
    </nav>
  );
};

export default Navbar;

