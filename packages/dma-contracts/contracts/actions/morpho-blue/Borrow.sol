// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.15;

import { Executable } from "../common/Executable.sol";
import { UseStorageSlot, StorageSlot, Write, Read } from "../../libs/UseStorageSlot.sol";
import { ServiceRegistry } from "../../core/ServiceRegistry.sol";
import { BorrowData } from "../../core/types/MorphoBlue.sol";
import { MORPHO_BLUE } from "../../core/constants/MorphoBlue.sol";
import { IMorpho } from "../../interfaces/morpho-blue/IMorpho.sol";
import { UseRegistry } from "../../libs/UseRegistry.sol";

/**
 * @title Borrow | Morpho Blue Action contract
 * @notice Borrows token from MorphoBlue's lending pool
 */
contract MorphoBlueBorrow is Executable, UseStorageSlot, UseRegistry {
  using Write for StorageSlot.TransactionStorage;

  constructor(address _registry) UseRegistry(ServiceRegistry(_registry)) {}

  /**
   * @param data Encoded calldata that conforms to the BorrowData struct
   */
  function execute(bytes calldata data, uint8[] memory) external payable override {
    BorrowData memory borrowData = parseInputs(data);

    IMorpho morphoBlue = IMorpho(getRegisteredService(MORPHO_BLUE));
    morphoBlue.borrow(borrowData.marketParams, borrowData.amount, 0, address(this), address(this));

    store().write(bytes32(borrowData.amount));
  }

  function parseInputs(bytes memory _callData) public pure returns (BorrowData memory params) {
    return abi.decode(_callData, (BorrowData));
  }
}
