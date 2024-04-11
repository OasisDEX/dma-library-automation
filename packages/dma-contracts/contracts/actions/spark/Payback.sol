// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.15;

import { Executable } from "../common/Executable.sol";
import { UseStorageSlot, StorageSlot, StorageSlot } from "../../libs/UseStorageSlot.sol";
import { PaybackData } from "../../core/types/Spark.sol";
import { SPARK_LENDING_POOL } from "../../core/constants/Spark.sol";
import { ServiceRegistry } from "../../core/ServiceRegistry.sol";
import { UseRegistry } from "../../libs/UseRegistry.sol";
import { IPool } from "../../interfaces/spark/IPool.sol";

/**
 * @title Payback | Spark Action contract
 * @notice Pays back a specified amount to Spark's lending pool
 */
contract SparkPayback is Executable, UseStorageSlot, UseRegistry {
  using StorageSlot for bytes32;


  constructor(address _registry) UseRegistry(ServiceRegistry(_registry)) {}

  /**
   * @dev Look at UseStore.sol to get additional info on paramsMapping.
   * @dev The paybackAll flag - when passed - will signal the user wants to repay the full debt balance for a given asset
   * @param data Encoded calldata that conforms to the PaybackData struct
   * @param paramsMap Maps operation storage values by index (index offset by +1) to execute calldata params
   */
  function execute(bytes calldata data, uint8[] memory paramsMap) external payable override {
    PaybackData memory payback = parseInputs(data);

    payback.amount = storeInSlot("transaction").readUint(bytes32(payback.amount), paramsMap[1]);

    IPool(getRegisteredService(SPARK_LENDING_POOL)).repay(
      payback.asset,
      payback.paybackAll ? type(uint256).max : payback.amount,
      2,
      address(this)
    );

    storeInSlot("transaction").write(bytes32(payback.amount));
  }

  function parseInputs(bytes memory _callData) public pure returns (PaybackData memory params) {
    return abi.decode(_callData, (PaybackData));
  }
}
