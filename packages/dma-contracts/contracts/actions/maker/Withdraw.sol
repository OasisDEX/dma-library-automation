// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity >=0.8.5;

import { Executable } from "../common/Executable.sol";
import { UseStorageSlot, StorageSlot } from "../../libs/UseStorageSlot.sol";

import { MathUtils } from "../../libs/MathUtils.sol";
import { WithdrawData } from "../../core/types/Maker.sol";
import { IManager } from "../../interfaces/maker/IManager.sol";
import { IWETH } from "../../interfaces/tokens/IWETH.sol";
import { MCD_MANAGER } from "../../core/constants/Maker.sol";
import { WETH } from "../../core/constants/Common.sol";
import { IServiceRegistry } from "../../interfaces/IServiceRegistry.sol";

contract MakerWithdraw is Executable, UseStorageSlot {
  using StorageSlot for bytes32;

  IServiceRegistry public registry;

  constructor(address _registry) UseStorageSlot() {
    registry = IServiceRegistry(_registry);
  }

  function execute(bytes calldata data, uint8[] memory paramsMap) external payable override {
    WithdrawData memory withdrawData = parseInputs(data);
    withdrawData.vaultId = getTransactionStorageSlot().readUint(
      bytes32(withdrawData.vaultId),
      paramsMap[0]
    );

    uint256 amountWithdrawn = _withdraw(withdrawData);
    getTransactionStorageSlot().write(bytes32(amountWithdrawn));
  }

  function _withdraw(WithdrawData memory data) internal returns (uint256) {
    address gem = data.joinAddr.gem();
    uint256 convertedAmount = MathUtils.convertTo18(data.joinAddr, data.amount);

    // Unlocks WETH/GEM amount from the CDP
    IManager manager = IManager(registry.getRegisteredService(MCD_MANAGER));
    manager.frob(data.vaultId, -MathUtils.uintToInt(convertedAmount), 0);

    // Moves the amount from the CDP urn to proxy's address
    manager.flux(data.vaultId, address(this), convertedAmount);

    // Exits token/WETH amount to the user's wallet as a token
    data.joinAddr.exit(address(this), convertedAmount);

    if (gem == registry.getRegisteredService(WETH)) {
      // Converts WETH to ETH
      IWETH(gem).withdraw(convertedAmount);
      // Sends ETH back to the user's wallet
      payable(data.userAddress).transfer(convertedAmount);
    }

    return convertedAmount;
  }

  function parseInputs(bytes memory _callData) public pure returns (WithdrawData memory params) {
    return abi.decode(_callData, (WithdrawData));
  }
}
