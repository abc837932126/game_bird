<template>
  <div class="min-h-screen bg-white flex flex-col gap-2">
    <!-- 横幅图片 -->
		<div
  			class="h-48 flex items-center justify-center bg-center bg-cover"
  			:style="{ backgroundImage: `url(${getImageUrl('bg', 'bird_game', '_big')})` }">
		</div>


    <!-- 中间解说区域 -->
    <div class="px-8">
      <h1 class="text-2xl font-bold mb-4">欢迎来到 Bird Game World</h1>
      <p class="text-gray-500 leading-relaxed">
        在这个神奇的世界里，你将扮演一只勇敢的护鸟勇士，
        踏上一段充满冒险与惊喜的旅程。
        收集宝物、结交伙伴、探索未知的领域！
      </p>
    </div>

    <!-- 按钮区域 -->
    <div class="flex-1 flex items-center justify-center px-8">
      <el-button type="primary" size="large" class="w-1/2" @click="startGame">
        开始游戏
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { getImageUrl } from '@/config/oss'

const game = inject('game')

const startGame = async () => {
  await game.player.api.start()
  game.player.data.landing = true
}
</script>
