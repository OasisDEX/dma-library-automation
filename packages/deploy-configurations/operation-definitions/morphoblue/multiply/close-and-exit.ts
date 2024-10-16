import { loadContractNames, OPERATION_NAMES } from '@deploy-configurations/constants'
import { Network } from '@deploy-configurations/types/network'
import { getActionHash } from '@deploy-configurations/utils/action-hash'

export function getMorphoBlueCloseOperationDefinition(network: Network) {
  const SERVICE_REGISTRY_NAMES = loadContractNames(network)

  return {
    name: OPERATION_NAMES.morphoblue.CLOSE_POSITION,
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
