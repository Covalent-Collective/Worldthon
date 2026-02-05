'use client'

import { useUserStore } from '@/stores/userStore'

interface RewardGaugeProps {
  showDetails?: boolean
}

export function RewardGauge({ showDetails = true }: RewardGaugeProps) {
  const { rewards } = useUserStore()

  const powerLevel = Math.min(100, rewards.contributionPower)
  const powerColor = powerLevel >= 80 ? 'from-green-400 to-green-600' :
                     powerLevel >= 50 ? 'from-yellow-400 to-yellow-600' :
                     'from-gray-400 to-gray-600'

  return (
    <div className="space-y-4">
      {/* Contribution Power Gauge */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Contribution Power
          </span>
          <span className="text-sm font-bold text-gray-900">
            {powerLevel}%
          </span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${powerColor} transition-all duration-700 ease-out`}
            style={{ width: `${powerLevel}%` }}
          />
        </div>
      </div>

      {showDetails && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-900">
                {rewards.totalCitations}
              </div>
              <div className="text-xs text-gray-500">총 인용 횟수</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-900">
                {rewards.contributions.length}
              </div>
              <div className="text-xs text-gray-500">기여한 노드</div>
            </div>
          </div>

          {/* Pending WLD */}
          <div className="bg-black text-white rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400">수령 가능한 보상</div>
                <div className="text-2xl font-bold flex items-baseline gap-1">
                  {rewards.pendingWLD.toFixed(4)}
                  <span className="text-sm font-normal text-gray-400">WLD</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="black">
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
