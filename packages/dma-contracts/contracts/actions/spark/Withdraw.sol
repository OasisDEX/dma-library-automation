// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.15;

import { Executable } from "../common/Executable.sol";
import { UseStorageSlot, StorageSlot, Write, Read } from "../../libs/UseStorageSlot.sol";
import { WithdrawData } from "../../core/types/Spark.sol";
import { SPARK_LENDING_POOL } from "../../core/constants/Spark.sol";
import { IPool } from "../../interfaces/spark/IPool.sol";
import { ServiceRegistry } from "../../core/ServiceRegistry.sol";
import { UseRegistry } from "../../libs/UseRegistry.sol";

/**
 * @title Withdraw | Spark Action contract
 * @notice Withdraw collateral from Spark's lending pool
 */
contract SparkWithdraw is Executable, UseStorageSlot, UseRegistry {
  using Write for StorageSlot.TransactionStorage;

  constructor(address _registry) UseRegistry(ServiceRegistry(_registry)) {}

  /**
   * @param data Encoded calldata that conforms to the WithdrawData struct
   */
  function execute(bytes calldata data, uint8[] memory) external payable override {
    WithdrawData memory withdraw = parseInputs(data);

    uint256 amountWithdrawn = IPool(getRegisteredService(SPARK_LENDING_POOL)).withdraw(
      withdraw.asset,
      withdraw.amount,
      withdraw.to
    );

    store().write(bytes32(amountWithdrawn));
  }

  function parseInputs(bytes memory _callData) public pure returns (WithdrawData memory params) {
    return abi.decode(_callData, (WithdrawData));
  }
}
