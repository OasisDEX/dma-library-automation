// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity >=0.8.5;

import { Executable } from "../common/Executable.sol";
import { UseStorageSlot, StorageSlot } from "../../libs/UseStorageSlot.sol";


import { IManager } from "../../interfaces/maker/IManager.sol";

import { CdpAllowData } from "../../core/types/Maker.sol";
import { SafeERC20, IERC20 } from "../../libs/SafeERC20.sol";


import { MCD_MANAGER } from "../../core/constants/Maker.sol";
import { IServiceRegistry } from "../../interfaces/IServiceRegistry.sol";

contract CdpAllow is Executable, UseStorageSlot {
  using SafeERC20 for IERC20;
  using StorageSlot for bytes32;
  IServiceRegistry public registry;

  constructor(address _registry) UseStorageSlot() {
    registry = IServiceRegistry(_registry);
  }

  function execute(bytes calldata data, uint8[] memory paramsMap) external payable override {
    CdpAllowData memory cdpAllowData = parseInputs(data);
    cdpAllowData.vaultId = storeInSlot("transaction").readUint(
      bytes32(cdpAllowData.vaultId),
      paramsMap[0]
    );

    IManager manager = IManager(registry.getRegisteredService(MCD_MANAGER));

    manager.cdpAllow(cdpAllowData.vaultId, cdpAllowData.userAddress, 1);
  }

  function parseInputs(bytes memory _callData) public pure returns (CdpAllowData memory params) {
    return abi.decode(_callData, (CdpAllowData));
  }
}
