// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./Subsquid.sol";


contract SubsquidV1 is Subsquid {

    function getVersion() public pure returns (string memory) {
       return "v1.0.0";
    }
}