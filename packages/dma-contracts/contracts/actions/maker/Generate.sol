// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity >=0.8.5;

import { Executable } from "../common/Executable.sol";
import { UseStorageSlot, StorageSlot } from "../../libs/UseStorageSlot.sol";

import { IVat } from "../../interfaces/maker/IVat.sol";
import { IManager } from "../../interfaces/maker/IManager.sol";

import { IDaiJoin } from "../../interfaces/maker/IDaiJoin.sol";
import { IJug } from "../../interfaces/maker/IJug.sol";
import { SafeMath } from "../../libs/SafeMath.sol";
import { MathUtils } from "../../libs/MathUtils.sol";
import { GenerateData } from "../../core/types/Maker.sol";
import { MCD_MANAGER, MCD_JUG, MCD_JOIN_DAI } from "../../core/constants/Maker.sol";
import { IServiceRegistry } from "../../interfaces/IServiceRegistry.sol";

contract MakerGenerate is Executable, UseStorageSlot {
  using SafeMath for uint256;
  using StorageSlot for bytes32;

  IServiceRegistry public registry;

  constructor(address _registry) UseStorageSlot() {
    registry = IServiceRegistry(_registry);
  }

  function execute(bytes calldata data, uint8[] memory paramsMap) external payable override {
    GenerateData memory generateData = parseInputs(data);
    generateData.vaultId = storeInSlot("transaction").readUint(
      bytes32(generateData.vaultId),
      paramsMap[1]
    );

    uint256 amountGenerated = _generate(generateData);
    storeInSlot("transaction").write(bytes32(amountGenerated));
  }

  function _generate(GenerateData memory data) internal returns (uint256) {
    IManager manager = IManager(registry.getRegisteredService(MCD_MANAGER));
    IVat vat = manager.vat();

    manager.frob(
      data.vaultId,
      int256(0),
      _getDrawDart(
        vat,
        registry.getRegisteredService(MCD_JUG),
        manager.urns(data.vaultId),
        manager.ilks(data.vaultId),
        data.amount
      )
    );

    manager.move(data.vaultId, address(this), data.amount.mul(MathUtils.RAY));

    address daiJoin = registry.getRegisteredService(MCD_JOIN_DAI);
    if (vat.can(address(this), daiJoin) == 0) {
      vat.hope(daiJoin);
    }

    IDaiJoin(daiJoin).exit(data.to, data.amount);

    return data.amount;
  }

  function _getDrawDart(
    IVat vat,
    address jug,
    address urn,
    bytes32 ilk,
    uint256 wad
  ) internal returns (int256 dart) {
    // Updates stability fee rate
    uint256 rate = IJug(jug).drip(ilk);

    // Gets DAI balance of the urn in the vat
    uint256 dai = vat.dai(urn);

    // If there was already enough DAI in the vat balance, just exits it without adding more debt
    if (dai < wad.mul(MathUtils.RAY)) {
      // Calculates the needed dart so together with the existing dai in the vat is enough to exit wad amount of DAI tokens
      dart = MathUtils.uintToInt(wad.mul(MathUtils.RAY).sub(dai) / rate);
      // This is neeeded due lack of precision. It might need to sum an extra dart wei (for the given DAI wad amount)
      dart = uint256(dart).mul(rate) < wad.mul(MathUtils.RAY) ? dart + 1 : dart;
    }
  }

  function parseInputs(bytes memory _callData) public pure returns (GenerateData memory params) {
    return abi.decode(_callData, (GenerateData));
  }
}
