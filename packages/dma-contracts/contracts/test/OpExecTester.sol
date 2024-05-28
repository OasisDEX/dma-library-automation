// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.15;






import { Address } from "../libs/Address.sol";



contract OpExecTester {
  using Address for address;

  function execute(
    address opExecutorAddress,
    bytes calldata executionData,
    bytes32 expectedOpName
  ) public {
    bytes memory result = opExecutorAddress.functionCallWithValue(
      executionData,
      0,
      "OpExecTester: low-level call failed"
    );

    bytes32 opName = bytes32(result);
    require(opName == expectedOpName, "OpExecTester: opName mismatch");
  }
}
