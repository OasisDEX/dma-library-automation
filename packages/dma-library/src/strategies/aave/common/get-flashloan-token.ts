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
  const { USDC } = addresses.tokens
  console.log('DEBUG >> Get flashloan token for:', protocol)
  console.log('DEBUG >> Network:', network)
  if (protocol === 'Spark') {
    const flashloanToken = { token: debt }
    console.log('DEBUG >> Spark protocol flashloan token:', flashloanToken)
    return {
      flashloan: flashloanToken,
    }
  }

  // All operations relevant to Automation use Balancer as the flashloan action
  // There's currently no DAI balance on Balancer
  // So we're using USDC as the flashloan token for all operations
  const flashloanToken = { symbol: 'USDC' as const, address: USDC, precision: 6 }

  return {
    flashloan: {
      token: flashloanToken,
    },
  }
}
