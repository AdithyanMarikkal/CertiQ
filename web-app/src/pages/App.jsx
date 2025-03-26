import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ethers } from "ethers";
import Navbar from "../components/Navbar/Navbar";
import { CenteredBox } from '../components/CenteredBox/CenteredBox';
import Issue from './Issue';
import Register from './Register';
import Verify from './Verify';
import Admin from './Admin';
import { getContractInstance } from "../utils/getABI.js";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || "";
  const featuresRef = useRef(null);
  const aboutRef = useRef(null);

  return (
    <Router>
      <div>
        <Navbar 
        featuresRef={featuresRef} 
        aboutRef={aboutRef}
        />
        <CheckAdmin setIsAdmin={setIsAdmin} contractAddress={contractAddress} />
        <Routes>
          <Route path="/" element={<CenteredBox 
                featuresRef={featuresRef} 
                aboutRef={aboutRef} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/issue" element={<Issue />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/admin" element={isAdmin ? <Admin /> : <CenteredBox />} />
        </Routes>
      </div>
    </Router>
  );
}

// ✅ Admin check inside a separate component
function CheckAdmin({ setIsAdmin, contractAddress }) {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!window.ethereum || !contractAddress) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = await getContractInstance(contractAddress);
        if (!contract) return;
        const userAddress = await signer.getAddress();

        const ownerAddress = await contract.owner();

        if (userAddress.toLowerCase() === ownerAddress.toLowerCase()) {
          setIsAdmin(true);
          navigate("/admin"); // ✅ Navigate only when inside Router
        }
      } catch (error) {
        console.error("Error checking admin:", error);
      }
    };

    checkAdmin();
  }, [contractAddress, navigate]);

  return null; // ✅ This component only runs the effect and doesn't render anything
}

export default App;
