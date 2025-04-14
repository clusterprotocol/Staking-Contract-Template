require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const SEPOLIA_RPC = process.env.SEPOLIA_RPC;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const INITIAL_APY = 1000; // 10% in basis points
const COOLDOWN = 60; // seconds

if (!SEPOLIA_RPC || !PRIVATE_KEY) {
  console.error('❌ Missing SEPOLIA_RPC or PRIVATE_KEY in .env file.');
  process.exit(1);
}

const buildPath = path.resolve(__dirname, 'build');
const outputPath = path.resolve(__dirname, 'contracts');

const rewardTokenName = 'RewardToken';
const stakingContractName = 'Staking';

const rewardTokenAbi = JSON.parse(
  fs.readFileSync(path.join(buildPath, `${rewardTokenName}.abi`), 'utf8')
);
const rewardTokenBytecode = fs.readFileSync(
  path.join(buildPath, `${rewardTokenName}.bin`),
  'utf8'
);

const stakingAbi = JSON.parse(
  fs.readFileSync(path.join(buildPath, `${stakingContractName}.abi`), 'utf8')
);
const stakingBytecode = fs.readFileSync(
  path.join(buildPath, `${stakingContractName}.bin`),
  'utf8'
);

async function deploy() {
  const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // Deploy RewardToken first
  const RewardTokenFactory = new ethers.ContractFactory(
    rewardTokenAbi,
    rewardTokenBytecode,
    wallet
  );
  console.log('⏳ Deploying RewardToken...');
  const rewardToken = await RewardTokenFactory.deploy();
  await rewardToken.deployed();
  console.log(`✅ RewardToken deployed at: ${rewardToken.address}`);

  // Save reward token address and abi
  fs.writeFileSync(
    path.join(outputPath, `${rewardTokenName}-address.json`),
    JSON.stringify({ address: rewardToken.address }, null, 2)
  );
  fs.writeFileSync(
    path.join(outputPath, `${rewardTokenName}-abi.json`),
    JSON.stringify(rewardTokenAbi, null, 2)
  );

  const rewardTokenAddress = '0x7711a7CcAF661310882D0462b1379349f316Af0a';

  // Deploy Staking contract
  const StakingFactory = new ethers.ContractFactory(
    stakingAbi,
    stakingBytecode,
    wallet
  );
  console.log('⏳ Deploying Staking contract...');
  const stakingContract = await StakingFactory.deploy();
  await stakingContract.deployed();
  console.log(`✅ Staking deployed at: ${stakingContract.address}`);

  // Save staking address and abi
  fs.writeFileSync(
    path.join(outputPath, `${stakingContractName}-address.json`),
    JSON.stringify({ address: stakingContract.address }, null, 2)
  );
  fs.writeFileSync(
    path.join(outputPath, `${stakingContractName}-abi.json`),
    JSON.stringify(stakingAbi, null, 2)
  );

  console.log('🚀 Deployment complete.');
}

deploy().catch(console.error);
