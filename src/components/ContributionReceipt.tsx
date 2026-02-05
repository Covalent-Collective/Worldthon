'use client'

import { Card, CardContent } from './ui/Card'
import type { ContributionReceipt as Receipt } from '@/lib/types'
import { truncateHash } from '@/lib/utils'

interface ContributionReceiptProps {
  receipts: Receipt[]
}

export function ContributionReceipt({ receipts }: ContributionReceiptProps) {
  if (receipts.length === 0) return null

  return (
    <Card className="mt-4 bg-gray-50 border-dashed">
      <CardContent className="p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          기여 영수증
        </h4>

        <div className="space-y-2">
          {receipts.map((receipt, index) => (
            <div
              key={receipt.nodeId}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs">
                  {index + 1}
                </span>
                <span className="text-gray-600 font-mono text-xs">
                  {truncateHash(receipt.contributor)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black transition-all duration-500"
                    style={{ width: `${receipt.percentage}%` }}
                  />
                </div>
                <span className="text-gray-900 font-medium w-10 text-right">
                  {receipt.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
          이 답변은 위 기여자들의 지식 노드를 기반으로 생성되었습니다.
          기여자들은 인용 횟수에 따라 WLD 보상을 받습니다.
        </p>
      </CardContent>
    </Card>
  )
}
