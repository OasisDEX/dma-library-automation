import { Network } from '@deploy-configurations/types/network'
import { FlashloanProvider } from '@dma-library/types/common'

export function resolveFlashloanProvider(network: Network): FlashloanProvider {
  // Be aware: this doesn't actually select the provider used for the operation
  // This is "meant" to simply resolve which one is used by an operation
  // Lastly, this is only a best guess re provider given each operation chooses it's own provider
  // So, this can't be relied on to be 100% accurate all of the time - see operations for exact FL action
  switch (network) {
    case Network.MAINNET:
      return FlashloanProvider.Balancer

    // Commented out as no operations relevant to Automation use DssFlash
    // if (lendingProtocol === 'Spark') {
    //   return FlashloanProvider.Balancer
    // }

    // return FlashloanProvider.DssFlash
    case Network.GOERLI:
      return FlashloanProvider.DssFlash
    case Network.OPTIMISM:
      return FlashloanProvider.Balancer
    case Network.ARBITRUM:
      return FlashloanProvider.Balancer
    case Network.BASE:
      return FlashloanProvider.Balancer
    default:
      throw new Error(`Unsupported network ${network}`)
  }
}
