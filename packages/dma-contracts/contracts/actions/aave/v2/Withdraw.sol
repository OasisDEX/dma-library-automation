// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.15;

import { Executable } from "../../common/Executable.sol";
import { UseStorageSlot, StorageSlot } from "../../../libs/UseStorageSlot.sol";

import { ILendingPool } from "../../../interfaces/aave/ILendingPool.sol";
import { WithdrawData } from "../../../core/types/Aave.sol";
import { AAVE_LENDING_POOL } from "../../../core/constants/Aave.sol";
import { IServiceRegistry } from "../../../interfaces/IServiceRegistry.sol";

/**
 * @title Withdraw | AAVE Action contract
 * @notice Withdraw collateral from AAVE's lending pool
 */
contract AaveWithdraw is Executable, UseStorageSlot {
  using StorageSlot for bytes32;
  IServiceRegistry public registry;

  constructor(address _registry) UseStorageSlot() {
    registry = IServiceRegistry(_registry);
  }

  /**
   * @param data Encoded calldata that conforms to the WithdrawData struct
   */
  function execute(bytes calldata data, uint8[] memory) external payable override {
    WithdrawData memory withdraw = parseInputs(data);

    uint256 amountWithdrawn = ILendingPool(registry.getRegisteredService(AAVE_LENDING_POOL))
      .withdraw(withdraw.asset, withdraw.amount, withdraw.to);

    storeInSlot("transaction").write(bytes32(amountWithdrawn));
  }

  function parseInputs(bytes memory _callData) public pure returns (WithdrawData memory params) {
    return abi.decode(_callData, (WithdrawData));
  }
}
