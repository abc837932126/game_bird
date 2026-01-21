<template>
  <div class="bg-white border-b px-4 py-2 flex items-center justify-between">
    <!-- 左侧：玩家信息 -->
    <div class="flex items-center gap-2">
      <span class="text-sm font-medium truncate max-w-[120px]">
        {{ game.player.data?.nickname }}
      </span>
      <el-tag type="warning" size="small">
        Lv.{{ game.player.data?.lv || 1 }}
      </el-tag>
    </div>

    <!-- 右侧：余额显示 -->
    <div class="flex items-center gap-3 text-sm">
      <div
        v-for="balance in game.player.data?.player_balance || []"
        :key="balance.balance_id"
        class="flex items-center gap-1"
      >
        <span>{{ getBalanceEmoji(balance.balance_id) }}</span>
        <span :class="getBalanceColorClass(balance.balance_id)">
          {{ balance.count || 0 }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const game = inject('game')

const getBalanceEmoji = (balanceId) => {
  const emojiMap = {
    1: '💰',
    2: '💎',
    3: '🪙'
  }
  return emojiMap[balanceId] || '💰'
}

const getBalanceColorClass = (balanceId) => {
  const colorMap = {
    1: 'font-medium text-yellow-600',
    2: 'font-medium text-blue-600',
    3: 'font-medium text-purple-600'
  }
  return colorMap[balanceId] || 'font-medium text-gray-600'
}
</script>