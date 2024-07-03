// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity >=0.8.5;

import { Executable } from "../common/Executable.sol";
import { UseStorageSlot, StorageSlot } from "../../libs/UseStorageSlot.sol";
import { IManager } from "../../interfaces/maker/IManager.sol";

import { OpenVaultData } from "../../core/types/Maker.sol";
import { MCD_MANAGER } from "../../core/constants/Maker.sol";
import { IServiceRegistry } from "../../interfaces/IServiceRegistry.sol";

contract MakerOpenVault is Executable, UseStorageSlot {
  using StorageSlot for bytes32;
  IServiceRegistry public registry;

  constructor(address _registry) UseStorageSlot() {
    registry = IServiceRegistry(_registry);
  }

  function execute(bytes calldata data, uint8[] memory) external payable override {
    OpenVaultData memory openVaultData = parseInputs(data);

    uint256 vaultId = _openVault(openVaultData);
    getTransactionStorageSlot().write(bytes32(vaultId));
  }

  function _openVault(OpenVaultData memory data) internal returns (uint256) {
    bytes32 ilk = data.joinAddress.ilk();

    IManager manager = IManager(registry.getRegisteredService(MCD_MANAGER));
    uint256 vaultId = manager.open(ilk, address(this));

    return vaultId;
  }

  function parseInputs(bytes memory _callData) public pure returns (OpenVaultData memory params) {
    return abi.decode(_callData, (OpenVaultData));
  }
}
