import { loadContractNames, OPERATION_NAMES } from '@deploy-configurations/constants'
import { Network } from '@deploy-configurations/types/network'
import { getActionHash } from '@deploy-configurations/utils/action-hash'

export function getAaveOpenDepositBorrowV3OperationDefinition(network: Network) {
  const SERVICE_REGISTRY_NAMES = loadContractNames(network)

  return {
    name: OPERATION_NAMES.aave.v3.OPEN_DEPOSIT_BORROW,
    actions: [
      {
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.WRAP_ETH),
        optional: true,
      },
      // {
      //   hash: getActionHash(SERVICE_REGISTRY_NAMES.common.PULL_TOKEN),
      //   optional: true,
      // },
      // {
      //   hash: getActionHash(SERVICE_REGISTRY_NAMES.common.SWAP_ACTION),
      //   optional: true,
      // },
      {
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.SET_APPROVAL),
        optional: false,
      },
      {
        hash: getActionHash(SERVICE_REGISTRY_NAMES.aave.v3.DEPOSIT),
        optional: false,
      },
      {
        hash: getActionHash(SERVICE_REGISTRY_NAMES.aave.v3.BORROW),
        optional: true,
      },
      // {
      //   hash: getActionHash(SERVICE_REGISTRY_NAMES.common.UNWRAP_ETH),
      //   optional: true,
      // },
      {
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.RETURN_FUNDS),
        optional: true,
      },
      {
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.POSITION_CREATED),
        optional: false,
      },
    ],
  }
}
