import { loadContractNames, OPERATION_NAMES } from '@deploy-configurations/constants'
import { Network } from '@deploy-configurations/types/network'
import { getActionHash } from '@deploy-configurations/utils/action-hash'

export function getMorphoBlueAdjustUpOperationDefinition(network: Network) {
  const SERVICE_REGISTRY_NAMES = loadContractNames(network)

  return {
    name: OPERATION_NAMES.morphoblue.ADJUST_RISK_UP,
    actions: [
      {
        label: SERVICE_REGISTRY_NAMES.common.TAKE_A_FLASHLOAN_BALANCER,
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.TAKE_A_FLASHLOAN_BALANCER),
        optional: false,
      },
      {
        label: SERVICE_REGISTRY_NAMES.common.PULL_TOKEN,
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.PULL_TOKEN),
        optional: true,
      },
      {
        label: SERVICE_REGISTRY_NAMES.common.WRAP_ETH,
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.WRAP_ETH),
        optional: true,
      },
      {
        label: SERVICE_REGISTRY_NAMES.common.SWAP_ACTION,
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.SWAP_ACTION),
        optional: false,
      },
      {
        label: SERVICE_REGISTRY_NAMES.common.SET_APPROVAL,
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.SET_APPROVAL),
        optional: false,
      },
      {
        label: SERVICE_REGISTRY_NAMES.morphoblue.DEPOSIT,
        hash: getActionHash(SERVICE_REGISTRY_NAMES.morphoblue.DEPOSIT),
        optional: false,
      },
      {
        label: SERVICE_REGISTRY_NAMES.morphoblue.BORROW,
        hash: getActionHash(SERVICE_REGISTRY_NAMES.morphoblue.BORROW),
        optional: false,
      },
      {
        label: SERVICE_REGISTRY_NAMES.common.SEND_TOKEN_AUTO,
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.SEND_TOKEN),
        optional: false,
      },
    ],
    log: false,
  }
}
