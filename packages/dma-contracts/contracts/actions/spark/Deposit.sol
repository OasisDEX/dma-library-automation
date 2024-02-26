// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.15;

import { Executable } from "../common/Executable.sol";
import { UseStorageSlot, StorageSlot, Write, Read } from "../../libs/UseStorageSlot.sol";
import { DepositData } from "../../core/types/Spark.sol";
import { SPARK_LENDING_POOL } from "../../core/constants/Spark.sol";
import { IPool } from "../../interfaces/spark/IPool.sol";
import { ServiceRegistry } from "../../core/ServiceRegistry.sol";
import { UseRegistry } from "../../libs/UseRegistry.sol";
import { SafeMath } from "../../libs/SafeMath.sol";

/**
 * @title Deposit | Spark Action contract
 * @notice Deposits the specified asset as collateral to Spark's lending pool
 */
contract SparkDeposit is Executable, UseStorageSlot, UseRegistry {
  using Read for StorageSlot.TransactionStorage;
  using Write for StorageSlot.TransactionStorage;
  using SafeMath for uint256;

  constructor(address _registry) UseRegistry(ServiceRegistry(_registry)) {}

  /**
   * @dev Look at UseStore.sol to get additional info on paramsMapping
   * @param data Encoded calldata that conforms to the DepositData struct
   * @param paramsMap Maps operation storage values by index (index offset by +1) to execute calldata params
   */
  function execute(bytes calldata data, uint8[] memory paramsMap) external payable override {
    DepositData memory deposit = parseInputs(data);

    uint256 mappedDepositAmount = store().readUint(
      bytes32(deposit.amount),
      paramsMap[1],
      address(this)
    );

    uint256 actualDepositAmount = deposit.sumAmounts
      ? mappedDepositAmount.add(deposit.amount)
      : mappedDepositAmount;

    IPool(registry.getRegisteredService(SPARK_LENDING_POOL)).supply(
      deposit.asset,
      actualDepositAmount,
      address(this),
      0
    );

    if (deposit.setAsCollateral) {
      IPool(registry.getRegisteredService(SPARK_LENDING_POOL)).setUserUseReserveAsCollateral(
        deposit.asset,
        true
      );
    }

    store().write(bytes32(actualDepositAmount));
  }

  function parseInputs(bytes memory _callData) public pure returns (DepositData memory params) {
    return abi.decode(_callData, (DepositData));
  }
}
