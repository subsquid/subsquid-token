// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20CappedUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";


/**
 * @title Subsquid Token Contract
 * @dev This is the implementation of the ERC20 Subsquid Token.
 *
 * The token is initially owned by the owner address
 * (Address of a Gnosis multisig contract) in the constructor. 
 * An initial supply is passed in the constructor that will be
 * assigned to the owner and will be the max cap for the token.
 *
 */
contract Subsquid is Initializable, ERC20Upgradeable, ERC20BurnableUpgradeable, 
PausableUpgradeable, ERC20CappedUpgradeable, AccessControlUpgradeable, UUPSUpgradeable {

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    /// @dev initialiser function which will only called once upon contract creation
    /// @param owner Address to transfer ownership of the token
    /// @param _initialSupply initial supply of the token that would also be the token CAP
    function initialize(address owner, uint256 _initialSupply) public initializer {
        require(owner != address(0), "ERC20: owner cannot be zero address");
        __ERC20_init("Subsquid", "SQD");
        __ERC20Capped_init(_initialSupply); 
        __ERC20Burnable_init();
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _setupRole(DEFAULT_ADMIN_ROLE, owner);
        _setupRole(PAUSER_ROLE, owner);
        _mint(owner, _initialSupply);
        _setupRole(MINTER_ROLE, owner);
        _setupRole(UPGRADER_ROLE, owner);
    }

   /// @dev Pauses contract transfers callable only by admin with PAUSER role
    function pause()  public virtual onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /// @dev unPauses contract transfers callable only by admin with PAUSER role
    function unpause() public virtual onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /// @dev Mints token to the to address
    /// @param to Address to mint tokens
    /// @param amount Amount of tokens to be minted
    function mint(address to, uint256 amount) 
        public 
        virtual
        whenNotPaused
        onlyRole(MINTER_ROLE) 
    {
        _mint(to, amount);
    } 

    /// @dev Overides internal mint function to use capped varient
    /// @param account Address to mint tokens
    /// @param amount Amount of tokens to be minted
    function _mint(address account, uint256 amount)
        internal
        virtual
        override(ERC20Upgradeable, ERC20CappedUpgradeable)
    {
        ERC20CappedUpgradeable._mint(account, amount);
    }

    /// @dev token transfer hooks called before every transfer
    /// @param from Address to transfer tokens from
    /// @param to  Address to transfer tokens to
    /// @param amount  amount of tokens to be transferred 
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        virtual
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }

     /// @dev upgrade function called upon during upgrades to the contract
     /// @param newImplementation Address of the new contract implementation
    function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(UPGRADER_ROLE)
        virtual
        override
    {}
}