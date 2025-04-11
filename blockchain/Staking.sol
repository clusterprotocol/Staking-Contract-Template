// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Staking is Ownable {
    IERC20 public stakingToken;

    uint256 public apy; // Annual percentage yield in basis points (e.g. 1000 = 10%)
    uint256 public cooldownPeriod; // Cooldown period in seconds

    struct StakeInfo {
        uint256 amount;
        uint256 stakedAt;
        uint256 lastClaimedAt;
        uint256 cooldownStart;
    }

    mapping(address => StakeInfo) public stakes;

    constructor(
        address _token,
        uint256 _apy,
        uint256 _cooldown
    ) Ownable(msg.sender) {
        stakingToken = IERC20(_token);
        apy = _apy;
        cooldownPeriod = _cooldown;
    }

    function stake(uint256 _amount) external {
        require(_amount > 0, "Stake failed: amount must be greater than 0");

        uint256 allowance = stakingToken.allowance(msg.sender, address(this));
        require(
            allowance >= _amount,
            "Stake failed: insufficient token allowance"
        );

        uint256 balance = stakingToken.balanceOf(msg.sender);
        require(balance >= _amount, "Stake failed: insufficient token balance");

        bool success = stakingToken.transferFrom(
            msg.sender,
            address(this),
            _amount
        );
        require(success, "Stake failed: token transferFrom failed");

        StakeInfo storage user = stakes[msg.sender];

        if (user.amount > 0) {
            uint256 pendingReward = calculateReward(msg.sender);
            if (pendingReward > 0) {
                bool rewardSuccess = stakingToken.transfer(
                    msg.sender,
                    pendingReward
                );
                require(rewardSuccess, "Stake failed: reward payout failed");
            }
        }

        user.amount += _amount;
        user.stakedAt = block.timestamp;
        user.lastClaimedAt = block.timestamp;
        user.cooldownStart = 0;
    }

    function initiateUnstake() external {
        require(stakes[msg.sender].amount > 0, "No tokens staked");
        stakes[msg.sender].cooldownStart = block.timestamp;
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

        // Reset stake data
        user.amount = 0;
        user.stakedAt = 0;
        user.lastClaimedAt = 0;
        user.cooldownStart = 0;

        uint256 contractBalance = stakingToken.balanceOf(address(this));
        require(
            contractBalance >= amount + reward,
            "Withdraw failed: insufficient contract balance"
        );

        bool success = stakingToken.transfer(msg.sender, amount + reward);
        require(success, "Withdraw failed: token transfer failed");
    }

    function calculateReward(address _user) public view returns (uint256) {
        StakeInfo storage user = stakes[_user];
        if (user.amount == 0) return 0;

        uint256 duration = block.timestamp - user.lastClaimedAt;
        return (user.amount * apy * duration) / (365 days * 10000); // APY in basis points
    }

    function setAPY(uint256 _apy) external onlyOwner {
        apy = _apy;
    }

    function setCooldownPeriod(uint256 _cooldown) external onlyOwner {
        cooldownPeriod = _cooldown;
    }
}
