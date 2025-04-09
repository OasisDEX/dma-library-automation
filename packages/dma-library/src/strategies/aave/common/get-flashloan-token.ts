import { AaveLikeStrategyAddresses } from '@dma-library/operations/aave-like'
import { WithFlashLoanArgs } from '@dma-library/types'
import { AaveLikeProtocol } from '@dma-library/types/protocol'

export interface FlashloanDependencies {
  protocol: AaveLikeProtocol
  network: string
  addresses: AaveLikeStrategyAddresses
  debt: {
    symbol: string
    address: string
    precision: number
  }
}

export function getFlashloanToken({
  network,
  addresses,
  protocol,
  debt,
}: FlashloanDependencies): WithFlashLoanArgs {
  // packages/dma-library/src/utils/flashloan/resolve-provider.ts
  // Note: needs to be aligned with resolveFlashloanProvider

  const { USDC, DAI } = addresses.tokens
  console.log('DEBUG >> Get flashloan token for:', protocol)
  console.log('DEBUG >> Network:', network)
  if (network === 'mainnet' && protocol === 'Spark') {
    const flashloanToken = { token: debt }
    console.log('DEBUG >> Spark protocol flashloan token:', flashloanToken)
    return {
      flashloan: flashloanToken,
    }
  }

  if (network === 'mainnet' && protocol !== 'Spark') {
    const flashloanToken = { symbol: 'DAI' as const, address: DAI, precision: 18 }
    console.log('DEBUG >> Flashloan token:', flashloanToken)
    return {
      flashloan: {
        token: flashloanToken,
      },
    }
  }

  // For all other networks, use USDC as the flashloan token
  const flashloanToken = { symbol: 'USDC' as const, address: USDC, precision: 6 }

  console.log('DEBUG >> Flashloan token:', flashloanToken)

  return {
    flashloan: {
      token: flashloanToken,
    },
  }
}
