import { formatCryptoBalance } from '@dma-common/utils/common/formaters'

import { AjnaPosition } from '../../../types/ajna'
import { AjnaError } from '../../../types/common'

export function validateBorrowUndercollateralized(
  position: AjnaPosition,
  positionBefore: AjnaPosition,
): AjnaError[] {
  if (position.thresholdPrice.gt(position.pool.lowestUtilizedPrice)) {
    return [
      {
        name: 'borrow-undercollateralized',
        data: {
          amount: formatCryptoBalance(positionBefore.debtAvailable()),
        },
      },
    ]
  }
  return []
}

export function validateWithdrawUndercollateralized(
  position: AjnaPosition,
  positionBefore: AjnaPosition,
): AjnaError[] {
  if (position.thresholdPrice.gt(position.pool.lowestUtilizedPrice)) {
    return [
      {
        name: 'withdraw-undercollateralized',
        data: {
          amount: formatCryptoBalance(positionBefore.collateralAvailable),
        },
      },
    ]
  }
  return []
}