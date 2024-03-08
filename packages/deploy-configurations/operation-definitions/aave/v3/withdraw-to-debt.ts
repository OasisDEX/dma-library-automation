
import { loadContractNames, OPERATION_NAMES } from '@deploy-configurations/constants'
import { Network } from '@deploy-configurations/types/network'
import { getActionHash } from '@deploy-configurations/utils/action-hash'

export function getAaveV3WithdrawToDebtOperationDefinition(network: Network) {
    const SERVICE_REGISTRY_NAMES = loadContractNames(network)

    return {
        name: OPERATION_NAMES.aave.v3.WITHDRAW_TO_DEBT,
        actions: [
            {
                hash: getActionHash(SERVICE_REGISTRY_NAMES.aave.v3.WITHDRAW),
                optional: false,
            },
            {
                hash: getActionHash(SERVICE_REGISTRY_NAMES.common.COLLECT_FEE),
                optional: false,
            },
            {
                hash: getActionHash(SERVICE_REGISTRY_NAMES.common.SWAP_ACTION),
                optional: false,
            },
            {
                hash: getActionHash(SERVICE_REGISTRY_NAMES.common.UNWRAP_ETH),
                optional: false,
            },
            {
                hash: getActionHash(SERVICE_REGISTRY_NAMES.common.RETURN_FUNDS),
                optional: false,
            },
        ],
    }
}
