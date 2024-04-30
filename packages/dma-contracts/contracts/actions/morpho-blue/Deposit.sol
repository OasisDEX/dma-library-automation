// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.15;

import { Executable } from "../../common/Executable.sol";
import { UseStorageSlot, StorageSlot, Write, Read } from "../../../libs/UseStorageSlot.sol";
import { ServiceRegistry } from "../../../core/ServiceRegistry.sol";
import { DepositData } from "../../core/types/MorphoBlue.sol";
import { MORPHO_BLUE } from "../../core/constants/MorphoBlue.sol";
import { IMorpho } from "../../interfaces/morpho-blue/IMorpho.sol";

/**
 * @title Deposit | Morpho Blue Action contract
 * @notice Deposits the specified asset as collateral on MorphoBlue's lending pool
 */
contract MorphoBlueDeposit is Executable, UseStorageSlot, UseRegistry {
  using Write for StorageSlot.TransactionStorage;
  using Read for StorageSlot.TransactionStorage;

  constructor(address _registry) UseStore(_registry) {}

  /**
   * @param data Encoded calldata that conforms to the DepositData struct
   * @param paramsMap Maps operation storage values by index (index offset by +1) to execute calldata params
   */
  function execute(bytes calldata data, uint8[] memory paramsMap) external payable override {
    DepositData memory depositData = parseInputs(data);

    uint256 mappedDepositAmount = store().readUint(
      bytes32(depositData.amount),
      paramsMap[1],
      address(this)
    );

    uint256 actualDepositAmount = depositData.sumAmounts
    ? mappedDepositAmount + depositData.amount
    : mappedDepositAmount;

    IMorpho morphoBlue = IMorpho(registry.getRegisteredService(MORPHO_BLUE));
    morphoBlue.supplyCollateral(
      depositData.marketParams,
      actualDepositAmount,
      address(this),
      bytes("")
    );

    store().write(bytes32(actualDepositAmount));
  }

  function parseInputs(bytes memory _callData) public pure returns (DepositData memory params) {
    return abi.decode(_callData, (DepositData));
  }
}
