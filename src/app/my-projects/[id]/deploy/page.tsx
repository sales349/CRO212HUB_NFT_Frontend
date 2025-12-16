'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import { projectsApi } from '@/lib/api/projects';
import { NFT_CONTRACT_BYTECODE, NFT_CONTRACT_ABI } from '@/lib/contracts/nft-contract';
import type { Project } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DeployContractPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wallet state
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  // Deployment state
  const [deploymentParams, setDeploymentParams] = useState({
    name: '',
    symbol: '',
    maxSupply: 0,
    mintPrice: '0.1',
    baseURI: '',
    treasuryWallet: '',
  });
  const [showBytecode, setShowBytecode] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);

  // Check if wallet is connected on mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();

        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();

          setProvider(provider);
          setSigner(signer);
          setAddress(address);
          setIsConnected(true);
        }
      } catch (err) {
        console.error('Error checking wallet connection:', err);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask or another Web3 wallet');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Check network
      const network = await provider.getNetwork();
      const cronosTestnetChainId = 338n;

      if (network.chainId !== cronosTestnetChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x152' }], // 338 in hex
          });
        } catch (switchError: any) {
          // Chain not added, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x152',
                  chainName: 'Cronos Testnet',
                  nativeCurrency: {
                    name: 'Test CRO',
                    symbol: 'TCRO',
                    decimals: 18,
                  },
                  rpcUrls: ['https://evm-t3.cronos.org'],
                  blockExplorerUrls: ['https://testnet.cronoscan.com'],
                },
              ],
            });
          }
        }
      }

      setProvider(provider);
      setSigner(signer);
      setAddress(address);
      setIsConnected(true);
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      alert(`Failed to connect wallet: ${err.message}`);
    }
  };

  // Fetch project data
  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true);
        const response = await projectsApi.getById(resolvedParams.id);

        if (!response.success || !response.project) {
          throw new Error(response.error || 'Project not found');
        }

        const proj = response.project;
        setProject(proj);

        // Auto-generate base URI for metadata location
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const autoBaseURI = proj.base_uri || `${API_URL}/output/${proj.id}/metadata/`;

        // Initialize deployment params from project
        setDeploymentParams({
          name: proj.name,
          symbol: proj.symbol || proj.name.substring(0, 5).toUpperCase(),
          maxSupply: proj.max_supply,
          mintPrice: proj.mint_price || '0.1',
          baseURI: autoBaseURI,
          treasuryWallet: proj.treasury_wallet || address || '',
        });

        // Check if already deployed
        if (proj.contract_address) {
          setDeployedAddress(proj.contract_address);
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchProject();
  }, [resolvedParams.id, address]);

  const handleDeploy = async () => {
    if (!signer || !isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!deploymentParams.treasuryWallet) {
      alert('Please provide a treasury wallet address');
      return;
    }

    try {
      setDeploying(true);

      // Constructor arguments (in order)
      const constructorArgs = [
        deploymentParams.name,
        deploymentParams.symbol,
        BigInt(deploymentParams.maxSupply),
        ethers.parseEther(deploymentParams.mintPrice),
        deploymentParams.baseURI,
        deploymentParams.treasuryWallet,
      ];

      console.log('Deploying with params:', {
        ...deploymentParams,
        from: address,
      });

      // Create contract factory
      const factory = new ethers.ContractFactory(NFT_CONTRACT_ABI, NFT_CONTRACT_BYTECODE, signer);

      // Deploy contract
      console.log('Deploying contract...');
      const contract = await factory.deploy(...constructorArgs);

      console.log('Transaction hash:', contract.deploymentTransaction()?.hash);
      alert('Contract deployment transaction submitted! Waiting for confirmation...');

      // Wait for deployment
      await contract.waitForDeployment();
      const contractAddress = await contract.getAddress();

      console.log('Contract deployed at:', contractAddress);
      setDeployedAddress(contractAddress);

      // Save contract address to database
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/projects/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_address: contractAddress,
          base_uri: deploymentParams.baseURI,
          treasury_wallet: deploymentParams.treasuryWallet,
          status: 'deployed',
        }),
      });

      if (!response.ok) {
        console.error('Failed to save contract address to database');
      }

      alert(`Contract deployed successfully!\nAddress: ${contractAddress}`);
      setDeploying(false);
    } catch (err: any) {
      console.error('Deployment error:', err);
      alert(`Deployment failed: ${err.message}`);
      setDeploying(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="status-box info" style={{ textAlign: 'center', marginTop: '60px' }}>
          Loading project...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="status-box error" style={{ marginTop: '60px' }}>
          {error}
        </div>
        <button onClick={() => router.push('/my-projects')} className="secondary-btn">
          Back to Projects
        </button>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="header">
        <div className="logo">CRO212HUB</div>
        <button
          onClick={() => router.push(`/my-projects/${resolvedParams.id}`)}
          className="secondary-btn"
          style={{ width: 'auto', padding: '4px 12px' }}
        >
          ← Back to Project
        </button>
      </div>

      <h1>Deploy Smart Contract</h1>
      <p className="subtitle">Deploy your NFT collection contract to Cronos Testnet</p>

      {/* Already Deployed Notice */}
      {deployedAddress && (
        <div className="status-box" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0 }}>Contract Already Deployed</h3>
          <p style={{ marginBottom: '8px' }}>
            Address: <span className="wallet-address">{deployedAddress}</span>
          </p>
          <a
            href={`https://explorer.cronos.org/testnet/address/${deployedAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#60a5fa' }}
          >
            View on Explorer →
          </a>
        </div>
      )}

      {/* Connection Status */}
      {!isConnected ? (
        <div className="status-box warning" style={{ marginBottom: '20px' }}>
          <p style={{ marginBottom: '12px' }}>Please connect your wallet to deploy the contract</p>
          <button onClick={connectWallet} className="primary-btn" style={{ marginTop: 0 }}>
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="status-box" style={{ marginBottom: '20px' }}>
          <p style={{ marginBottom: 0 }}>
            Connected: <span className="wallet-address">{address}</span>
          </p>
        </div>
      )}

      {/* Deployment Parameters */}
      <section className="card" style={{ marginBottom: '16px' }}>
        <h2>Contract Parameters</h2>
        <p className="subtitle">Configure your NFT collection smart contract</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '6px' }}>
              Collection Name
            </label>
            <input
              type="text"
              value={deploymentParams.name}
              onChange={(e) => setDeploymentParams({ ...deploymentParams, name: e.target.value })}
              placeholder="My NFT Collection"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '6px' }}>
              Symbol (Ticker)
            </label>
            <input
              type="text"
              value={deploymentParams.symbol}
              onChange={(e) => setDeploymentParams({ ...deploymentParams, symbol: e.target.value })}
              placeholder="MYNFT"
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '6px' }}>
                Max Supply
              </label>
              <input
                type="number"
                value={deploymentParams.maxSupply}
                onChange={(e) => setDeploymentParams({ ...deploymentParams, maxSupply: parseInt(e.target.value) })}
                placeholder="1000"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '6px' }}>
                Mint Price (CRO)
              </label>
              <input
                type="text"
                value={deploymentParams.mintPrice}
                onChange={(e) => setDeploymentParams({ ...deploymentParams, mintPrice: e.target.value })}
                placeholder="0.1"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '6px' }}>
              Treasury Wallet Address
            </label>
            <input
              type="text"
              value={deploymentParams.treasuryWallet}
              onChange={(e) => setDeploymentParams({ ...deploymentParams, treasuryWallet: e.target.value })}
              placeholder="0x..."
            />
            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px', marginBottom: 0 }}>
              Wallet address that will receive mint proceeds
            </p>
          </div>
        </div>

        {/* Base URI Info (Read-only) */}
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            background: '#020617',
            borderRadius: '8px',
            border: '1px solid #374151',
          }}
        >
          <label style={{ display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '6px' }}>
            Base URI (Metadata Location) - Auto-configured
          </label>
          <code
            style={{
              display: 'block',
              fontSize: '12px',
              color: '#60a5fa',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
              padding: '8px',
              background: '#111827',
              borderRadius: '6px',
            }}
          >
            {deploymentParams.baseURI}
          </code>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px', marginBottom: 0 }}>
            This is automatically set to your metadata storage location. Update via IPFS after generation if needed.
          </p>
        </div>
      </section>

      {/* Contract Bytecode (Optional View) */}
      <section className="card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ marginTop: 0, marginBottom: 0 }}>Contract Bytecode</h3>
          <button
            onClick={() => setShowBytecode(!showBytecode)}
            className="secondary-btn"
            style={{ width: 'auto', padding: '6px 12px', marginTop: 0 }}
          >
            {showBytecode ? 'Hide' : 'Show'}
          </button>
        </div>

        {showBytecode && (
          <div
            style={{
              marginTop: '12px',
              padding: '12px',
              background: '#020617',
              borderRadius: '8px',
              border: '1px solid #374151',
              maxHeight: '300px',
              overflow: 'auto',
            }}
          >
            <code style={{ fontSize: '11px', color: '#9ca3af', wordBreak: 'break-all', fontFamily: 'monospace' }}>
              {NFT_CONTRACT_BYTECODE}
            </code>
          </div>
        )}
      </section>

      {/* Deploy Button */}
      <section className="card">
        <h3 style={{ marginTop: 0 }}>Ready to Deploy?</h3>
        <p style={{ fontSize: '13px', color: '#d1d5db', marginBottom: '16px' }}>
          Deploying will create a new NFT smart contract on Cronos Testnet. Make sure all parameters are correct before
          proceeding.
        </p>

        <button
          onClick={handleDeploy}
          disabled={!isConnected || deploying || !!deployedAddress}
          className="primary-btn"
          style={{ background: deployedAddress ? '#6b7280' : '#6366f1' }}
        >
          {deploying ? 'Deploying...' : deployedAddress ? 'Already Deployed' : 'Deploy Contract to Testnet'}
        </button>

        {isConnected && address && (
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '12px', marginBottom: 0 }}>
            Deploying from: <span className="wallet-address">{address}</span>
          </p>
        )}
      </section>
    </div>
  );
}
