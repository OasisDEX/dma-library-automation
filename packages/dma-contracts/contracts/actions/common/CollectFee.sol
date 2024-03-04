// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.15;

import { Executable } from "../common/Executable.sol";
import { UseStorageSlot, StorageSlot, Write, Read } from "../../libs/UseStorageSlot.sol";
import { UseRegistry } from "../../libs/UseRegistry.sol";
import { ServiceRegistry } from "../../core/ServiceRegistry.sol";
import { SafeERC20, IERC20 } from "../../libs/SafeERC20.sol";

/**
 * @title CollectFee | Fee Collection Action Contract
 * @notice Collects a fee based on a transaction amount read from an OperationStorage slot
 */
contract CollectFee is Executable, UseStorageSlot, UseRegistry {
    using SafeERC20 for IERC20;
    using Write for StorageSlot.TransactionStorage;
    using Read for StorageSlot.TransactionStorage;

    // Fee percentage (e.g., 1% = 100, 0.5% = 50)
    uint256 public immutable feePercentage;
    address public immutable feeRecipient;
    uint256 constant DIVISOR = 10000;

    constructor(address _registry, uint256 _feePercentage, address _feeRecipient) UseRegistry(ServiceRegistry(_registry)) {
        feePercentage = _feePercentage;
        feeRecipient = _feeRecipient;
    }

    event FeePaid(address indexed beneficiary, uint256 amount, address token);

    /**
     * @param data Encoded calldata that conforms to the asset address and optionally other parameters
     */
    function execute(bytes calldata data, uint8[] memory paramsMap) external payable override {
        address asset = parseInputs(data);
        uint256 transactionAmount = store().readUint(bytes32(0), paramsMap[0]);
        uint256 feeAmount = (transactionAmount * feePercentage) / DIVISOR;

        // Transfer fee from the user's proxy to the feeRecipient
        IERC20(asset).safeTransferFrom(msg.sender, feeRecipient, feeAmount);

        emit FeePaid(feeRecipient, feeAmount, asset);
    }

    function parseInputs(bytes memory _callData) public pure returns (address asset) {
        return abi.decode(_callData, (address));
    }
}
