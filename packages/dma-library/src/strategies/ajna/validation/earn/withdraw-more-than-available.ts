import { ZERO } from '@dma-common/constants'
import { formatCryptoBalance, negativeToZero } from '@dma-common/utils/common'
import { protocols } from '@dma-library/protocols'
import { getPoolLiquidity } from '@dma-library/strategies/ajna/validation'
import { AjnaEarnPosition, AjnaError } from '@dma-library/types'
import BigNumber from 'bignumber.js'

export const validateWithdrawMoreThanAvailable = (
  position: AjnaEarnPosition,
  simulation: AjnaEarnPosition,
  quoteAmount: BigNumber,
  quoteTokenPrecision: number,
): AjnaError[] => {
  const availableToWithdraw = negativeToZero(
    protocols.ajna
      .calculateAjnaMaxLiquidityWithdraw({
        pool: position.pool,
        poolCurrentLiquidity: getPoolLiquidity(position.pool),
        position,
        simulation,
      })
      .decimalPlaces(quoteTokenPrecision),
  )

  if (availableToWithdraw.lt(quoteAmount) && availableToWithdraw.gt(ZERO)) {
    return [
      {
        name: 'withdraw-more-than-available',
        data: {
          amount: formatCryptoBalance(
            BigNumber.min(position.quoteTokenAmount, availableToWithdraw),
          ),
        },
      },
    ]
  } else {
    return []
  }
}
