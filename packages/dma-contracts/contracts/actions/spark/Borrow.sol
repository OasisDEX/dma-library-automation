// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.15;

import { Executable } from "../common/Executable.sol";
import { UseStorageSlot, StorageSlot, StorageSlot } from "../../libs/UseStorageSlot.sol";
import { BorrowData } from "../../core/types/Spark.sol";
import { SPARK_LENDING_POOL } from "../../core/constants/Spark.sol";
import { IPool } from "../../interfaces/spark/IPool.sol";
import { ServiceRegistry } from "../../core/ServiceRegistry.sol";
import { UseRegistry } from "../../libs/UseRegistry.sol";

/**
 * @title Borrow | Spark Action contract
 * @notice Borrows tokens from Spark's lending pool
 */
contract SparkBorrow is Executable, UseStorageSlot, UseRegistry {
  using StorageSlot for bytes32;

  constructor(address _registry) UseRegistry(ServiceRegistry(_registry)) {}

  /**
   * @param data Encoded calldata that conforms to the BorrowData struct
   */
  function execute(bytes calldata data, uint8[] memory) external payable override {
    BorrowData memory borrow = parseInputs(data);

    IPool(getRegisteredService(SPARK_LENDING_POOL)).borrow(
      borrow.asset,
      borrow.amount,
      2,
      0,
      address(this)
    );

    storeInSlot("transaction").write(bytes32(borrow.amount));
  }

  function parseInputs(bytes memory _callData) public pure returns (BorrowData memory params) {
    return abi.decode(_callData, (BorrowData));
  }
}
