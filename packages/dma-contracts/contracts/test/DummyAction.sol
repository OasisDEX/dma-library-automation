// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.15;

import { Executable } from "../actions/common/Executable.sol";
import { SafeERC20, IERC20 } from "../libs/SafeERC20.sol";
import { SetApprovalData } from "../core/types/Common.sol";
import { UseStorageSlot, StorageSlot } from "../libs/UseStorageSlot.sol";
import { OperationStorage } from "../core/OperationStorage.sol";

contract DummyAction is Executable, UseStorageSlot {
  using SafeERC20 for IERC20;
  using StorageSlot for bytes32;


  event DummyActionEvent(address sender, uint256 amount);

  constructor(address _registry) UseStorageSlot() {}

  function execute(bytes calldata, uint8[] memory) external payable override {
    storeInSlot("transaction").write(bytes32("123"));

    emit DummyActionEvent(msg.sender, 123);
  }
}
