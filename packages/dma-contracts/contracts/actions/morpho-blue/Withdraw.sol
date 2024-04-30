// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.15;

import { Executable } from "../../common/Executable.sol";
import { UseStorageSlot, StorageSlot, Write, Read } from "../../../libs/UseStorageSlot.sol";
import { ServiceRegistry } from "../../../core/ServiceRegistry.sol";
import { WithdrawData } from "../../core/types/MorphoBlue.sol";
import { MORPHO_BLUE } from "../../core/constants/MorphoBlue.sol";
import { IMorpho } from "../../interfaces/morpho-blue/IMorpho.sol";

/**
 * @title Withdraw | MorphoBlue Action contract
 * @notice Withdraw collateral from Morpho Blue's lending pool
 */
contract MorphoBlueWithdraw is Executable, UseStorageSlot, UseRegistry {
  using Write for StorageSlot.TransactionStorage;

  constructor(address _registry) UseStore(_registry) {}

  /**
   * @param data Encoded calldata that conforms to the WithdrawData struct
   */
  function execute(bytes calldata data, uint8[] memory) external payable override {
    WithdrawData memory withdrawData = parseInputs(data);

    IMorpho morphoBlue = IMorpho(registry.getRegisteredService(MORPHO_BLUE));
    morphoBlue.withdrawCollateral(
      withdrawData.marketParams,
      withdrawData.amount,
      address(this),
      withdrawData.to
    );

    store().write(bytes32(withdrawData.amount));
  }

  function parseInputs(bytes memory _callData) public pure returns (WithdrawData memory params) {
    return abi.decode(_callData, (WithdrawData));
  }
}
