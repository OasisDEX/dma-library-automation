import { Network } from '@deploy-configurations/types/network'
import { addressesByNetwork } from '@dma-common/test-utils'
import { RuntimeConfig } from '@dma-common/types/common'
import { balanceOf } from '@dma-common/utils/balances'
import { amountToWei } from '@dma-common/utils/common'
import { executeThroughDPMProxy, executeThroughProxy } from '@dma-common/utils/execute'
import { approve } from '@dma-common/utils/tx'
import {
  AavePositionDetails,
  AavePositionStrategy,
  StrategyDependenciesAave,
} from '@dma-contracts/test/fixtures/types'
import { AaveVersion, strategies } from '@dma-library'
import {
  AaveV2OpenDependencies,
  AaveV3OpenDependencies,
} from '@dma-library/strategies/aave/multiply/open'
import { RiskRatio } from '@domain'
import BigNumber from 'bignumber.js'

import { OpenPositionTypes } from './aave/open-position-types'
import { ETH, MULTIPLE, SLIPPAGE, UNISWAP_TEST_SLIPPAGE, USDC, WBTC } from './common'

const amountInBaseUnit = amountToWei(new BigNumber(0.1), WBTC.precision)
const wBTCtoSteal = amountToWei(new BigNumber(2), WBTC.precision)
const WETHtoSwap = amountToWei(new BigNumber(2), ETH.precision)

async function openWbtcUsdcMultiplyAAVEPosition(
  slippage: BigNumber,
  dependencies: OpenPositionTypes[1],
) {
  const args: OpenPositionTypes[0] = {
    collateralToken: WBTC,
    debtToken: USDC,
    slippage,
    depositedByUser: {
      collateralToken: {
        amountInBaseUnit,
      },
    },
    multiple: new RiskRatio(MULTIPLE, RiskRatio.TYPE.MULITPLE),
    positionType: 'Multiply',
  }

  if (isV2(dependencies)) {
    return await strategies.aave.v2.open(args, dependencies)
  }
  if (isV3(dependencies)) {
    return await strategies.aave.v3.open(args, dependencies)
  }

  throw new Error('Unsupported protocol version')
}

function isV2(dependencies: OpenPositionTypes[1]): dependencies is AaveV2OpenDependencies {
  return dependencies.protocol.version === AaveVersion.v2
}

function isV3(dependencies: OpenPositionTypes[1]): dependencies is AaveV3OpenDependencies {
  return dependencies.protocol.version === AaveVersion.v3
}

export async function wbtcUsdcMultiplyAavePosition({
  proxy,
  isDPM,
  use1inch,
  swapAddress,
  dependencies,
  config,
  getTokens,
  network,
}: {
  proxy: string
  isDPM: boolean
  use1inch: boolean
  swapAddress?: string
  dependencies: StrategyDependenciesAave
  config: RuntimeConfig
  network: Network
  getTokens: (symbol: 'WBTC', amount: BigNumber) => Promise<boolean>
}): Promise<AavePositionDetails | null> {
  const strategy: AavePositionStrategy = 'WBTC/USDC Multiply'

  if (use1inch && !swapAddress) throw new Error('swapAddress is required when using 1inch')

  const addresses = addressesByNetwork(network)

  const mockPrice = new BigNumber(22842.53)
  const getSwapData = use1inch
    ? dependencies.getSwapData(swapAddress)
    : dependencies.getSwapData(mockPrice, {
        from: USDC.precision,
        to: WBTC.precision,
      })

  const position = await openWbtcUsdcMultiplyAAVEPosition(
    use1inch ? SLIPPAGE : UNISWAP_TEST_SLIPPAGE,
    {
      ...dependencies,
      getSwapData,
      isDPMProxy: isDPM,
      proxy: proxy,
      network,
    },
  )

  // We're using uniswap to acquire tokens on recent blocks
  // And impersonation on fixed test blocks
  const amountToGet = use1inch ? WETHtoSwap : wBTCtoSteal
  await getTokens('WBTC', amountToGet)

  await approve(WBTC.address, proxy, amountInBaseUnit, config, false)

  const proxyFunction = isDPM ? executeThroughDPMProxy : executeThroughProxy

  const feeWalletBalanceBefore = await balanceOf(addresses.USDC, addresses.feeRecipient, {
    config,
  })

  const [status] = await proxyFunction(
    proxy,
    {
      address: dependencies.contracts.operationExecutor.address,
      calldata: dependencies.contracts.operationExecutor.interface.encodeFunctionData('executeOp', [
        position.transaction.calls,
        position.transaction.operationName,
      ]),
    },
    config.signer,
    '0',
  )

  if (!status) {
    throw new Error(`Creating ${strategy} position failed`)
  }

  const feeWalletBalanceAfter = await balanceOf(addresses.USDC, addresses.feeRecipient, {
    config,
  })

  let getPosition
  if (isV3(dependencies)) {
    const addresses = dependencies.addresses

    getPosition = async () => {
      return await strategies.aave.v3.view(
        {
          collateralToken: WBTC,
          debtToken: USDC,
          proxy,
        },
        {
          addresses: {
            ...addresses,
            operationExecutor: dependencies.contracts.operationExecutor.address,
          },
          provider: config.provider,
        },
      )
    }
  }
  if (isV2(dependencies)) {
    const addresses = dependencies.addresses
    getPosition = async () => {
      return await strategies.aave.v2.view(
        {
          collateralToken: WBTC,
          debtToken: USDC,
          proxy,
        },
        {
          addresses: {
            ...addresses,
            operationExecutor: dependencies.contracts.operationExecutor.address,
          },
          provider: config.provider,
        },
      )
    }
  }

  if (!getPosition) throw new Error('getPosition is not defined')

  return {
    proxy: proxy,
    getPosition,
    strategy,
    variant: strategy,
    collateralToken: WBTC,
    debtToken: new USDC(dependencies.addresses),
    getSwapData,
    __positionType: 'Multiply',
    __mockPrice: mockPrice,
    __mockMarketPrice: mockPrice,
    __openPositionSimulation: position.simulation,
    __feeWalletBalanceChange: feeWalletBalanceAfter.minus(feeWalletBalanceBefore),
    __feesCollected: feeWalletBalanceAfter.minus(feeWalletBalanceBefore),
  }
}
