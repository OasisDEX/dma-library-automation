// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.15;

import { Executable } from "../../common/Executable.sol";
import { UseStorageSlot, StorageSlot } from "../../../libs/UseStorageSlot.sol";
import { OperationStorage } from "../../../core/OperationStorage.sol";
import { IPoolV3 } from "../../../interfaces/aaveV3/IPoolV3.sol";
import { DepositData } from "../../../core/types/Aave.sol";
import { SafeMath } from "../../../libs/SafeMath.sol";

import { AAVE_POOL, AAVE_L2_ENCODER } from "../../../core/constants/Aave.sol";
import { IServiceRegistry } from "../../../interfaces/IServiceRegistry.sol";

/**
 * @title Deposit | AAVE V3 Action contract
 * @notice Deposits the specified asset as collateral on AAVE's lending pool
 */

interface IL2Pool {
  function supply(bytes32) external;

  function setUserUseReserveAsCollateral(bytes32) external;
}

interface IL2Encoder {
  function encodeSupplyParams(address, uint256, uint16) external view returns (bytes32);

  function encodeSetUserUseReserveAsCollateral(address, bool) external view returns (bytes32);
}

contract AaveV3L2Deposit is Executable, UseStorageSlot {
  using StorageSlot for bytes32;

  using SafeMath for uint256;
  IServiceRegistry public registry;

  constructor(address _registry) UseStorageSlot() {
    registry = IServiceRegistry(_registry);
  }

  /**
   * @dev Look at UseStore.sol to get additional info on paramsMapping
   * @param data Encoded calldata that conforms to the DepositData struct
   * @param paramsMap Maps operation storage values by index (index offset by +1) to execute calldata params
   */
  function execute(bytes calldata data, uint8[] memory paramsMap) external payable override {
    DepositData memory deposit = parseInputs(data);

    uint256 mappedDepositAmount = storeInSlot("transaction").readUint(
      bytes32(deposit.amount),
      paramsMap[1]
    );

    uint256 actualDepositAmount = deposit.sumAmounts
      ? mappedDepositAmount.add(deposit.amount)
      : mappedDepositAmount;

    IL2Pool(registry.getRegisteredService(AAVE_POOL)).supply(
      IL2Encoder(registry.getRegisteredService(AAVE_L2_ENCODER)).encodeSupplyParams(
        deposit.asset,
        actualDepositAmount,
        0
      )
    );

    if (deposit.setAsCollateral) {
      IL2Pool(registry.getRegisteredService(AAVE_POOL)).setUserUseReserveAsCollateral(
        IL2Encoder(registry.getRegisteredService(AAVE_L2_ENCODER))
          .encodeSetUserUseReserveAsCollateral(deposit.asset, true)
      );
    }

    storeInSlot("transaction").write(bytes32(actualDepositAmount));
  }

  function parseInputs(bytes memory _callData) public pure returns (DepositData memory params) {
    return abi.decode(_callData, (DepositData));
  }

  receive() external payable {}
}
