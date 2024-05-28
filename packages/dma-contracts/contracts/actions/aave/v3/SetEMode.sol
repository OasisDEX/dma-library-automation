// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.15;

import { Executable } from "../../common/Executable.sol";
import { UseStorageSlot, StorageSlot, StorageSlot } from "../../../libs/UseStorageSlot.sol";
import { ServiceRegistry } from "../../../core/ServiceRegistry.sol";



import { SetEModeData } from "../../../core/types/Aave.sol";
import { AAVE_POOL } from "../../../core/constants/Aave.sol";
import { IPoolV3 } from "../../../interfaces/aaveV3/IPoolV3.sol";
import { UseRegistry } from "../../../libs/UseRegistry.sol";


/**
 * @title SetEMode | AAVE V3 Action contract
 * @notice Sets the user's eMode on AAVE's lending pool
 */
contract AaveV3SetEMode is Executable, UseStorageSlot, UseRegistry {
  using StorageSlot for bytes32;


  constructor(address _registry) UseRegistry(ServiceRegistry(_registry)) {}

  /**
   * @param data Encoded calldata that conforms to the SetEModeData struct
   */
  function execute(bytes calldata data, uint8[] memory) external payable override {
    SetEModeData memory emode = parseInputs(data);

    IPoolV3(getRegisteredService(AAVE_POOL)).setUserEMode(emode.categoryId);

    storeInSlot("transaction").write(bytes32(uint256(emode.categoryId)));
  }

  function parseInputs(bytes memory _callData) public pure returns (SetEModeData memory params) {
    return abi.decode(_callData, (SetEModeData));
  }
}
