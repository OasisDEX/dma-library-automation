// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.15;

import { Executable } from "../common/Executable.sol";
import { UseStorageSlot, StorageSlot, Write, Read } from "../../libs/UseStorageSlot.sol";
import { ServiceRegistry } from "../../core/ServiceRegistry.sol";
import { WithdrawData } from "../../core/types/MorphoBlue.sol";
import { MORPHO_BLUE } from "../../core/constants/MorphoBlue.sol";
import { IMorpho } from "../../interfaces/morpho-blue/IMorpho.sol";
import { UseRegistry } from "../../libs/UseRegistry.sol";

/**
 * @title Withdraw | MorphoBlue Action contract
 * @notice Withdraw collateral from Morpho Blue's lending pool
 * with the amount to withdraw being read from an OperationStorage slot
 */
contract MorphoBlueWithdrawAuto is Executable, UseStorageSlot, UseRegistry {
  using Write for StorageSlot.TransactionStorage;
  using Read for StorageSlot.TransactionStorage;

  constructor(address _registry) UseRegistry(ServiceRegistry(_registry)) {}

  /**
   * @param data Encoded calldata that conforms to the WithdrawData struct
   */
  function execute(bytes calldata data, uint8[] memory paramsMap) external payable override {
    WithdrawData memory withdraw = parseInputs(data);
    
    uint256 mappedWithdrawAmount = store().readUint(
      bytes32(0),
      paramsMap[0]
    );

    IMorpho morphoBlue = IMorpho(getRegisteredService(MORPHO_BLUE));
    morphoBlue.withdrawCollateral(
      withdraw.marketParams,
      mappedWithdrawAmount,
      address(this),
      withdraw.to
    );

    store().write(bytes32(mappedWithdrawAmount));
  }

  function parseInputs(bytes memory _callData) public pure returns (WithdrawData memory params) {
    return abi.decode(_callData, (WithdrawData));
  }
}

