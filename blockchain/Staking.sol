// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./RewardToken.sol";

contract Staking is Ownable {
    IERC20 public stakingToken;
    RewardToken public rewardToken;
    uint256 public apy;
    uint256 public cooldownPeriod;

    struct StakeInfo {
        uint256 amount;
        uint256 stakedAt;
        uint256 lastClaimedAt;
        uint256 cooldownStart;
    }

    mapping(address => StakeInfo) public stakes;

    constructor() Ownable(msg.sender) {
        stakingToken = IERC20(0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9);
        rewardToken = RewardToken(0x7711a7CcAF661310882D0462b1379349f316Af0a);
        apy = 25000000;
        cooldownPeriod = 60;
    }

    function calculateReward(address user) public view returns (uint256) {
        StakeInfo memory stakeInfo = stakes[user];
        if (stakeInfo.amount == 0) return 0;
        uint256 duration = block.timestamp - stakeInfo.lastClaimedAt;
        return (stakeInfo.amount * apy * duration) / (365 days * 10000);
    }

    function stake(uint256 _amount) external {
        require(_amount > 0, "Amount must be > 0");
        stakingToken.transferFrom(msg.sender, address(this), _amount);

        StakeInfo storage user = stakes[msg.sender];

        if (user.amount > 0) {
            uint256 pending = calculateReward(msg.sender);
            if (pending > 0) {
                rewardToken.mint(msg.sender, pending);
            }
        }

        user.amount += _amount;
        user.stakedAt = block.timestamp;
        user.lastClaimedAt = block.timestamp;
        user.cooldownStart = 0;
    }

    function initiateUnstake() external {
        StakeInfo storage user = stakes[msg.sender];
        require(user.amount > 0, "No tokens staked");
        user.cooldownStart = block.timestamp;
    }

    function withdraw() external {
        StakeInfo storage user = stakes[msg.sender];
        require(user.amount > 0, "Withdraw failed: no staked tokens");
        require(
            user.cooldownStart > 0,
            "Withdraw failed: unstake not initiated"
        );
        require(
            block.timestamp >= user.cooldownStart + cooldownPeriod,
            "Withdraw failed: cooldown period not completed"
        );

        uint256 reward = calculateReward(msg.sender);
        uint256 amount = user.amount;

        user.amount = 0;
        user.stakedAt = 0;
        user.lastClaimedAt = 0;
        user.cooldownStart = 0;

        stakingToken.transfer(msg.sender, amount);
        rewardToken.mint(msg.sender, reward);
    }

    function setAPY(uint256 _apy) external onlyOwner {
        apy = _apy;
    }

    function setCooldownPeriod(uint256 _cooldown) external onlyOwner {
        cooldownPeriod = _cooldown;
    }
}
