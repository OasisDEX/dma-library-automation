// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.24;

import { Executable } from "../../common/Executable.sol";
import { UseStorageSlot, StorageSlot } from "../../../libs/UseStorageSlot.sol";



import { PaybackData } from "../../../core/types/Aave.sol";



import { AAVE_POOL, AAVE_L2_ENCODER } from "../../../core/constants/Aave.sol";
import { IServiceRegistry } from "../../../interfaces/IServiceRegistry.sol";

/**
 * @title Payback | AAVE V3 Action contract
 * @notice Pays back a specified amount to AAVE's lending pool
 */
interface IL2Pool {
  function repay(bytes32 args) external returns (uint256);
}

interface IL2Encoder {
  function encodeRepayParams(address, uint256, uint256) external view returns (bytes32);
}

contract AaveV3L2Payback is Executable, UseStorageSlot {
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

    IL2Pool(registry.getRegisteredService(AAVE_POOL)).repay(
      IL2Encoder(registry.getRegisteredService(AAVE_L2_ENCODER)).encodeRepayParams(
        payback.asset,
        payback.paybackAll ? type(uint256).max : payback.amount,
        2
      )
    );

    getTransactionStorageSlot().write(bytes32(payback.amount));
  }

  function parseInputs(bytes memory _callData) public pure returns (PaybackData memory params) {
    return abi.decode(_callData, (PaybackData));
  }
}
