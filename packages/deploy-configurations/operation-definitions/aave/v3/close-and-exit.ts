import { loadContractNames, OPERATION_NAMES } from '@deploy-configurations/constants'
import { Network } from '@deploy-configurations/types/network'
import { getActionHash } from '@deploy-configurations/utils/action-hash'

/**
 * Operation Definition for Aave V3 Close and Exit
 *
 * @remarks
 * Defines an operation that closes the position and withdraws
 * the remaining value as either collateral or debt from the protocol
 *
 * @param network
 */
export function getAaveV3CloseAndExitOperationDefinition(network: Network) {
  const SERVICE_REGISTRY_NAMES = loadContractNames(network)

  return {
    name: OPERATION_NAMES.aave.v3.CLOSE_AND_EXIT,
    actions: [
      {
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.TAKE_A_FLASHLOAN_BALANCER),
        optional: false,
      },
      {
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.SET_APPROVAL),
        optional: false,
      },
      {
        hash: getActionHash(SERVICE_REGISTRY_NAMES.aave.v3.DEPOSIT),
        optional: false,
      },
      {
        hash: getActionHash(SERVICE_REGISTRY_NAMES.aave.v3.WITHDRAW),
        optional: false,
      },
      {
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.SWAP_ACTION),
        optional: false,
      },
      {
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.SET_APPROVAL),
        optional: false,
      },
      {
        hash: getActionHash(SERVICE_REGISTRY_NAMES.aave.v3.PAYBACK),
        optional: false,
      },
      {
        hash: getActionHash(SERVICE_REGISTRY_NAMES.aave.v3.WITHDRAW_AUTO),
        optional: false,
      },
      {
        hash: getActionHash(SERVICE_REGISTRY_NAMES.aave.v3.WITHDRAW),
        optional: false,
      },
      {
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.RETURN_FUNDS),
        optional: false,
      },
      {
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.RETURN_FUNDS),
        optional: false,
      },
      {
        hash: getActionHash(SERVICE_REGISTRY_NAMES.aave.v3.SET_EMODE),
        optional: false,
      },
    ],
  }
}
