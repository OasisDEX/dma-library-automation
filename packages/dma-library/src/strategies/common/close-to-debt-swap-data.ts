import { Address } from '@deploy-configurations/types/address'
import { ZERO } from '@dma-common/constants'
import { calculateFee } from '@dma-common/utils/swap'
import { GetSwapData } from '@dma-library/types/common'
import * as SwapUtils from '@dma-library/utils/swap'
import BigNumber from 'bignumber.js'

interface GetSwapDataForCloseToDebtArgs {
  fromToken: {
    symbol: string
    precision: number
    address: Address
  }
  toToken: {
    symbol: string
    precision: number
    address: Address
  }
  slippage: BigNumber
  swapAmountBeforeFees: BigNumber
  getSwapData: GetSwapData
  __feeOverride?: BigNumber
}

export async function getSwapDataForCloseToDebt({
  fromToken,
  toToken,
  slippage,
  swapAmountBeforeFees,
  getSwapData,
  __feeOverride,
}: GetSwapDataForCloseToDebtArgs) {
  console.log('CLOSING TO DEBT')
  const collectFeeFrom = SwapUtils.acceptedFeeTokenByAddress({
    fromTokenAddress: fromToken.address,
    toTokenAddress: toToken.address,
  })
  console.log('CollectFeeFrom', collectFeeFrom)

  const fee = __feeOverride || SwapUtils.feeResolver(fromToken.symbol, toToken.symbol)
  console.log('fee', fee.toString())

  const preSwapFee =
    collectFeeFrom === 'sourceToken' ? calculateFee(swapAmountBeforeFees, fee.toNumber()) : ZERO
  console.log('pre-swap-fee', preSwapFee.toString())

  const swapAmountAfterFees = swapAmountBeforeFees
    .minus(preSwapFee)
    .integerValue(BigNumber.ROUND_DOWN)
  console.log('swapAmountAfterFees', swapAmountAfterFees.toString())

  const swapData = await getSwapData(
    fromToken.address,
    toToken.address,
    swapAmountAfterFees,
    slippage,
  )
  console.log('fromAmount', swapData.fromTokenAmount.toString())
  console.log('toAmount', swapData.toTokenAmount.toString())

  return { swapData, collectFeeFrom, preSwapFee }
}
