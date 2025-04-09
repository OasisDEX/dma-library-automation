import { Network } from '@deploy-configurations/types/network'
import { Protocol } from '@deploy-configurations/types/protocol'
import { FlashloanProvider } from '@dma-library/types/common'

export function resolveFlashloanProvider(
  network: Network,
  lendingProtocol?: Protocol,
  debtTokenAddress?: string,
): FlashloanProvider {
  switch (network) {
    case Network.MAINNET:
      if (lendingProtocol === 'Spark') {
        if (debtTokenAddress === '0x6B175474E89094C44Da98b954EedeAC495271d0F') {
          // Use DssFlash even on Spark if the debt token is DAI
          return FlashloanProvider.DssFlash
        }

        return FlashloanProvider.Balancer
      }

      return FlashloanProvider.DssFlash
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
