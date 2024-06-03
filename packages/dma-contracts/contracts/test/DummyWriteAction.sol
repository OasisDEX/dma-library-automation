// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.15;

import { Executable } from "../../contracts/actions/common/Executable.sol";
import { SafeERC20, IERC20 } from "../../contracts/libs/SafeERC20.sol";
import { UseStorageSlot, StorageSlot, StorageSlot } from "../libs/UseStorageSlot.sol";

contract DummyWriteAction is Executable, UseStorageSlot {
  using SafeERC20 for IERC20;
  using StorageSlot for bytes32;

  function execute(bytes calldata _calldata, uint8[] memory) external payable override {
    getTransactionStorageSlot().write(bytes32(abi.decode(_calldata, (uint256))));
  }
}
