// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";


/// @title Subsquid ERC20 Token
/// @author Subsquid Team
/// @notice You can use this contract for investing in subquid ecosystem
/// @dev The contract is based on openzepplin upgradable ERC20 standards using UUPS upgradability mechanism
contract Subsquid is Initializable, ERC20Upgradeable, ERC20BurnableUpgradeable, 
PausableUpgradeable, OwnableUpgradeable, UUPSUpgradeable {

    /// @notice initialiser function which will only called once upon contract creation
    function initialize() public initializer {
        __ERC20_init("Subsquid", "SQD");
        __ERC20Burnable_init();
        __Pausable_init();
        __Ownable_init();
        __UUPSUpgradeable_init();

        _mint(msg.sender, 1000000000 * 10 ** decimals());
    }

   /// @notice Pauses contract transfers callable only by admin
    function pause() public onlyOwner {
        _pause();
    }

    /// @notice unPauses contract transfers callable only by admin
    function unpause() public onlyOwner {
        _unpause();
    }

    /// @notice Mints token to the to address
    /// @param to Address to mint tokens
    /// @param amount Amount of tokens to be minted
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    } 
    
    /// @dev token transfer hooks called before every transfer
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }

     /// @dev upgrade function called upon during upgrades to the contract
    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}
}