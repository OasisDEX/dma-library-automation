// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.15;

/**
 * @title A library that operates on a storage slot
 * @notice It is used to storage all kind of information that is going to be used during a transaction life time.
 * @dev The system of contracts that utilize this library work under the assumption
 * that all contracts are called in the scope of a proxy. Using the library will create a storage pointer
 * to a slot in the Proxy instance.
 *
 */
library StorageSlot {
  /**
   * @dev Returns the storage slot position based on the given salt.
   * @param salt The salt used to calculate the storage slot position.
   * @return slotPosition The storage slot position as a bytes32 value.
   */
  function getStorageSlotPosition(string memory salt) internal pure returns (bytes32 slotPosition) {
    slotPosition = bytes32(uint256(keccak256(abi.encodePacked("summer.proxy.storage", salt))));
  }

  /**
   * @dev Returns an array of stored values from a specific storage slot.
   * @param slotPosition The position of the storage slot.
   * @return An array of bytes32 values stored in the specified slot.
   */
  function returnStoredArray(bytes32 slotPosition) internal view returns (bytes32[] memory) {
    bytes32 lengthKey = keccak256(abi.encodePacked(slotPosition, "length"));
    uint256 length;

    assembly {
      length := tload(lengthKey)
    }
    bytes32[] memory values = new bytes32[](length);
    for (uint256 i = 0; i < length; i++) {
      bytes32 key = _getKey(slotPosition, i);
      assembly {
        let loadedValue := tload(key)
        // store the value read from transient storage in the array stored in memory
        mstore(add(values, add(0x20, mul(i, 0x20))), loadedValue)
      }
    }
    return values;
  }

  /**
   * @dev Pusdhes the value to the array stored in slotPosition.
   * @param slotPosition The position of the storage slot, where the array is stored.
   * @param value The value to be pushed to the array.
   * @notice This function updates the length of the storage slot by incrementing it by 1.
   */
  function write(bytes32 slotPosition, bytes32 value) internal {
    // each arryas length is stored in a separate key
    bytes32 lengthKey = keccak256(abi.encodePacked(slotPosition, "length"));
    uint256 length;
    assembly {
      length := tload(lengthKey)
    }
    bytes32 key = _getKey(slotPosition, length);
    assembly {
      // store the value at the key
      tstore(key, value)
      // increment the length
      tstore(lengthKey, add(length, 1))
    }
  }

  /**
   * @dev Reads the value stored at specified index (paramMapping) of the array stored at slotPosition.
   * @param slotPosition The position of the slot of the stored array.
   * @param param The parameter to return if `paramMapping` is 0.
   * @param paramMapping The mapping index to calculate the key for reading the value (index of the item in the array).
   * @return The value stored in the specified slot position.
   */
  function read(
    bytes32 slotPosition,
    bytes32 param,
    uint256 paramMapping
  ) internal view returns (bytes32) {
    // if paramMapping is 0, return the param
    if (paramMapping == 0) return param;
    bytes32 key = _getKey(slotPosition, paramMapping - 1);
    bytes32 value;
    assembly {
      value := tload(key)
    }
    return value;
  }

  /**
   * @dev Reads a uint256 value from the index (paramMapping) of an array stored at specified slotPosition.
   * @param slotPosition The position of the storage slot.
   * @param param The parameter to return if `paramMapping` is 0.
   * @param paramMapping The mapping index to calculate the key for reading the value (index of the item in the array).
   * @return res The uint256 value read from the array.
   */
  function readUint(
    bytes32 slotPosition,
    bytes32 param,
    uint256 paramMapping
  ) internal view returns (uint256 res) {
    res = uint256(read(slotPosition, param, paramMapping));
  }

  /**
   * @dev Returns the key for array stored at specific slot position and array index.
   * @param slotPosition The position of the slot.
   * @param index The index within the slot.
   * @return The key generated using the slot position and index.
   */
  function _getKey(bytes32 slotPosition, uint256 index) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(slotPosition, index));
  }
}

/**
 * @title UseStorageSlot
 * @dev Abstract contract that provides a function to store a value in a storage slot.
 */
abstract contract UseStorageSlot {
  using StorageSlot for bytes32;

  /**
   * @dev Returns byte32 store slot position based on the given salt.
   * @param salt The salt used to calculate the storage slot position.
   * @return The position of the storage slot.
   */
  function storeInSlot(string memory salt) internal pure returns (bytes32) {
    return StorageSlot.getStorageSlotPosition(salt);
  }
}
