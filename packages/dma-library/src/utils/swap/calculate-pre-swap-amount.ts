import { DEFAULT_FEE, ZERO } from '@oasisdex/dma-common/constants'
import { calculateFee } from '@oasisdex/dma-common/utils/swap'
import BigNumber from 'bignumber.js'

export function calculatePreSwapFeeAmount(
  collectFeeFrom: 'sourceToken' | 'targetToken' | undefined,
  swapAmountBeforeFees: BigNumber,
  fee: BigNumber = new BigNumber(DEFAULT_FEE),
) {
  return collectFeeFrom === 'sourceToken'
    ? calculateFee(swapAmountBeforeFees, fee.toNumber())
    : ZERO
}