import { loadContractNames, OPERATION_NAMES } from '@deploy-configurations/constants'
import { Network } from '@deploy-configurations/types/network'
import { getActionHash } from '@deploy-configurations/utils/action-hash'

export function getMorphoBlueWithdrawOperationDefinition(network: Network) {
  const SERVICE_REGISTRY_NAMES = loadContractNames(network)

  return {
    name: OPERATION_NAMES.morphoblue.WITHDRAW,
    actions: [
      {
        label: SERVICE_REGISTRY_NAMES.morphoblue.WITHDRAW,
        hash: getActionHash(SERVICE_REGISTRY_NAMES.morphoblue.WITHDRAW),
        optional: false,
      },
      {
        label: SERVICE_REGISTRY_NAMES.common.COLLECT_FEE,
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.COLLECT_FEE),
        optional: false,
      },
      {
        label: SERVICE_REGISTRY_NAMES.common.UNWRAP_ETH,
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.UNWRAP_ETH),
        optional: false,
      },
      {
        label: SERVICE_REGISTRY_NAMES.common.RETURN_FUNDS,
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.RETURN_FUNDS),
        optional: false,
      },
    ],
  }
}
