// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "../Subsquid.sol";


contract SubsquidV2 is Subsquid {

    function getVersion() public pure returns (string memory) {
       return "v2.0.0";
    }
}