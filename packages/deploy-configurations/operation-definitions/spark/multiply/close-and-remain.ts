import { loadContractNames, OPERATION_NAMES } from '@deploy-configurations/constants'
import { Network } from '@deploy-configurations/types/network'
import { getActionHash } from '@deploy-configurations/utils/action-hash'

/**
 * Operation Definition for Spark Close and Remain
 *
 * @remarks
 * Actions not required relative to Close and Exit left for context
 * This operation is used to close a position and remain with the collateral in protocol
 *
 * @param network
 */
export function getSparkCloseAndRemainOperationDefinition(network: Network) {
  const SERVICE_REGISTRY_NAMES = loadContractNames(network)

  return {
    name: OPERATION_NAMES.spark.CLOSE_AND_REMAIN,
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
        hash: getActionHash(SERVICE_REGISTRY_NAMES.spark.PAYBACK),
        optional: false,
      },
      {
        hash: getActionHash(SERVICE_REGISTRY_NAMES.spark.SET_EMODE),
        optional: false,
      },
      {
        hash: getActionHash(SERVICE_REGISTRY_NAMES.spark.WITHDRAW),
        optional: false,
      },
      {
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.SWAP_ACTION),
        optional: false,
      },
      {
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.SEND_TOKEN_AUTO),
        optional: false,
      },
      {
        hash: getActionHash(SERVICE_REGISTRY_NAMES.common.RETURN_FUNDS),
        optional: false,
      },
      /**
        @dev for close and remain we don't ithdraw remaining collateral and return it to the user
      */
      // {
      //   hash: getActionHash(SERVICE_REGISTRY_NAMES.common.WITHDRAW),
      //   optional: false,
      // },
      // {
      //   hash: getActionHash(SERVICE_REGISTRY_NAMES.common.RETURN_FUNDS),
      //   optional: false,
      // },
    ],
    log: false,
  }
}
