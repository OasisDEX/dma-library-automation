// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.15;
// TODO: Remove this for prod deploy

import "../actions/common/Executable.sol";
import { UseStorageSlot, StorageSlot } from "../libs/UseStorageSlot.sol";



import "../interfaces/tokens/IWETH.sol";
import "../interfaces/IExchange.sol";
import "../core/OperationStorage.sol";
import { SafeMath } from "../libs/SafeMath.sol";
import { SwapData } from "../core/types/Common.sol";

contract DummySwap is Executable, UseStorageSlot {
  using SafeMath for uint256;
  using StorageSlot for bytes32;

  IWETH private immutable WETH;
  address private immutable exchange;

  constructor(ServiceRegistry _registry, IWETH _weth, address _exchange) UseStorageSlot() {
    WETH = _weth;
    exchange = _exchange;
  }

  function execute(bytes calldata data, uint8[] memory) external payable override {
    SwapData memory swap = abi.decode(data, (SwapData));
    IERC20(swap.fromAsset).approve(exchange, swap.amount);

    if (address(this).balance > 0) {
      WETH.deposit{ value: address(this).balance }();
    }

    uint256 balanceBefore = IERC20(swap.toAsset).balanceOf(address(this));

    IExchange(exchange).swapTokenForToken(
      swap.fromAsset,
      swap.toAsset,
      swap.amount,
      swap.receiveAtLeast
    );

    uint256 balanceAfter = IERC20(swap.toAsset).balanceOf(address(this));
    uint256 amountBought = balanceAfter.sub(balanceBefore);

    require(amountBought >= swap.receiveAtLeast, "Exchange / Received less");

    getTransactionStorageSlot().write(bytes32(amountBought));
  }
}
