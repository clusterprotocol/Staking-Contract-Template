// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StakingToken is ERC20Burnable, Ownable {
    mapping(address => bool) public minters;

    constructor() ERC20("Staking Token", "STK") Ownable(msg.sender) {}

    modifier onlyMinter() {
        require(minters[msg.sender], "Not authorized to mint");
        _;
    }

    function setMinter(address minter, bool enabled) external onlyOwner {
        minters[minter] = enabled;
    }

    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }
}
