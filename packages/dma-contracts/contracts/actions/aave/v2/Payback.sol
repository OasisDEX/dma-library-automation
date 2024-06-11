// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.24;

import { Executable } from "../../common/Executable.sol";
import { UseStorageSlot, StorageSlot } from "../../../libs/UseStorageSlot.sol";



import { PaybackData } from "../../../core/types/Aave.sol";
import { ILendingPool } from "../../../interfaces/aave/ILendingPool.sol";

import { AAVE_LENDING_POOL } from "../../../core/constants/Aave.sol";
import { IServiceRegistry } from "../../../interfaces/IServiceRegistry.sol";

/**
 * @title Payback | AAVE Action contract
 * @notice Pays back a specified amount to AAVE's lending pool
 */
contract AavePayback is Executable, UseStorageSlot {
  using StorageSlot for bytes32;

  IServiceRegistry public registry;

  constructor(address _registry) UseStorageSlot() {
    registry = IServiceRegistry(_registry);
  }

  /**
   * @dev Look at UseStore.sol to get additional info on paramsMapping.
   * @dev The paybackAll flag - when passed - will signal the user wants to repay the full debt balance for a given asset
   * @param data Encoded calldata that conforms to the PaybackData struct
   * @param paramsMap Maps operation storage values by index (index offset by +1) to execute calldata params
   */
  function execute(bytes calldata data, uint8[] memory paramsMap) external payable override {
    PaybackData memory payback = parseInputs(data);

    payback.amount = getTransactionStorageSlot().readUint(bytes32(payback.amount), paramsMap[1]);

    ILendingPool(registry.getRegisteredService(AAVE_LENDING_POOL)).repay(
      payback.asset,
      payback.paybackAll ? type(uint256).max : payback.amount,
      2,
      address(this)
    );

    getTransactionStorageSlot().write(bytes32(payback.amount));
  }

  function parseInputs(bytes memory _callData) public pure returns (PaybackData memory params) {
    return abi.decode(_callData, (PaybackData));
  }
}
