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
      <div class="flex items-center gap-1">
        <span>💰</span>
        <span class="font-medium text-yellow-600">
          {{ game.player.data?.balance_1 || 0 }}
        </span>
      </div>
      <div class="flex items-center gap-1">
        <span>💎</span>
        <span class="font-medium text-blue-600">
          {{ game.player.data?.balance_2 || 0 }}
        </span>
      </div>
      <div class="flex items-center gap-1">
        <span>🪙</span>
        <span class="font-medium text-purple-600">
          {{ game.player.data?.balance_3 || 0 }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const game = inject('game')
</script>