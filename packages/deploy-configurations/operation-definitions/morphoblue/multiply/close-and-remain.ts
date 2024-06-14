import { loadContractNames, OPERATION_NAMES } from '@deploy-configurations/constants'
import { Network } from '@deploy-configurations/types/network'
import { getActionHash } from '@deploy-configurations/utils/action-hash'

/**
 * Operation Definition for MorphoBlue Close and Remain
 *
 * @remarks
 * Actions not required relative to Close and Exit left for context
 * This operation is used to close a position and remain with the collateral in protocol
 *
 * @param network
 */
export function getMorphoBlueCloseAndRemainOperationDefinition(network: Network) {
  const SERVICE_REGISTRY_NAMES = loadContractNames(network)

  return {
    name: OPERATION_NAMES.morphoblue.CLOSE_AND_REMAIN,
    actions: [
      {
        label: SERVICE_REGISTRY_NAMES.common.TAKE_A_FLASHLOAN_BALANCER,
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.TAKE_A_FLASHLOAN_BALANCER),
        optional: false,
      },
      {
        label: SERVICE_REGISTRY_NAMES.common.SET_APPROVAL,
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.SET_APPROVAL),
        optional: false,
      },
      {
        label: SERVICE_REGISTRY_NAMES.morphoblue.PAYBACK,
        hash: getActionHash(SERVICE_REGISTRY_NAMES.morphoblue.PAYBACK),
        optional: false,
      },
      {
        label: SERVICE_REGISTRY_NAMES.morphoblue.WITHDRAW,
        hash: getActionHash(SERVICE_REGISTRY_NAMES.morphoblue.WITHDRAW),
        optional: false,
      },
      {
        label: SERVICE_REGISTRY_NAMES.common.SWAP_ACTION,
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.SWAP_ACTION),
        optional: false,
      },
      {
        label: SERVICE_REGISTRY_NAMES.common.SEND_TOKEN_AUTO,
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.SEND_TOKEN_AUTO),
        optional: false,
      },
      {
        label: SERVICE_REGISTRY_NAMES.common.RETURN_FUNDS,
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.RETURN_FUNDS),
        optional: false,
      },
    ],
    log: false,
  }
}
