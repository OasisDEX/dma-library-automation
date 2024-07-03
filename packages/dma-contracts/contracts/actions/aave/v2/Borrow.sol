// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.24;

import { Executable } from "../../common/Executable.sol";
import { UseStorageSlot, StorageSlot } from "../../../libs/UseStorageSlot.sol";



import { ILendingPool } from "../../../interfaces/aave/ILendingPool.sol";
import { BorrowData } from "../../../core/types/Aave.sol";
import { AAVE_LENDING_POOL } from "../../../core/constants/Aave.sol";

import { IServiceRegistry } from "../../../interfaces/IServiceRegistry.sol";

/**
 * @title Borrow | AAVE Action contract
 * @notice Borrows ETH from AAVE's lending pool
 */
contract AaveBorrow is Executable, UseStorageSlot {
  using StorageSlot for bytes32;
  IServiceRegistry public registry;

  constructor(address _registry) UseStorageSlot() {
    registry = IServiceRegistry(_registry);
  }

  /**
   * @param data Encoded calldata that conforms to the BorrowData struct
   */
  function execute(bytes calldata data, uint8[] memory) external payable override {
    BorrowData memory borrow = parseInputs(data);

    ILendingPool(registry.getRegisteredService(AAVE_LENDING_POOL)).borrow(
      borrow.asset,
      borrow.amount,
      2,
      0,
      address(this)
    );

    getTransactionStorageSlot().write(bytes32(borrow.amount));
  }

  function parseInputs(bytes memory _callData) public pure returns (BorrowData memory params) {
    return abi.decode(_callData, (BorrowData));
  }
}
