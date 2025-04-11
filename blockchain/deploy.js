require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

// Load environment variables
const SEPOLIA_RPC = process.env.SEPOLIA_RPC;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const TOKEN_ADDRESS = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9"; // WETH on Sepolia // e.g. DAI or your own token
const INITIAL_APY = 1000; // 10% in basis points
const COOLDOWN = 60; // in seconds

if (!SEPOLIA_RPC || !PRIVATE_KEY) {
  console.error("❌ Missing SEPOLIA_RPC or PRIVATE_KEY in .env file.");
  process.exit(1);
}

// Define paths
const outputPath = path.resolve(__dirname, 'contracts');
const buildPath = path.resolve(__dirname, 'build');
const contractName = 'Staking'; // Update this if your contract name changes

// Load compiled contract
const abiPath = path.join(buildPath, `${contractName}.abi`);
const bytecodePath = path.join(buildPath, `${contractName}.bin`);

if (!fs.existsSync(abiPath) || !fs.existsSync(bytecodePath)) {
  console.error("❌ Compiled contract files not found. Ensure you have run compile.js.");
  process.exit(1);
}

const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
const bytecode = fs.readFileSync(bytecodePath, 'utf8');

// Deploy contract
async function deploy() {
  console.log("🚀 Starting deployment...");

  // Set up provider and wallet
  const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // Create contract factory
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);

  try {
    console.log("⏳ Deploying contract...");
    const contract = await factory.deploy(TOKEN_ADDRESS, INITIAL_APY, COOLDOWN);

    console.log("⏳ Waiting for deployment to be mined...");
    await contract.deployed();

    // Write ABI to a JSON file
    const abiOutputPath = path.join(outputPath, `${contractName}-abi.json`);
    fs.writeFileSync(abiOutputPath, JSON.stringify(abi, null, 2));
    console.log(`✅ ABI saved to: ${abiOutputPath}`);

    // Write contract address to a JSON file
    const addressOutputPath = path.join(outputPath, `${contractName}-address.json`);
    fs.writeFileSync(
      addressOutputPath,
      JSON.stringify({ address: contract.address }, null, 2)
    );

    console.log(`✅ Contract deployed successfully!`);
    console.log(`- Contract Address: ${contract.address}`);
    console.log(`- Transaction Hash: ${contract.deployTransaction.hash}`);
  } catch (error) {
    console.error("❌ Deployment failed:", error);
  }
}

deploy();