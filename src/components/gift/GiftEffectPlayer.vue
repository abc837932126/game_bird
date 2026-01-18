<template>
  <div
      v-show="isPlaying"
      class="gift-effect-overlay fixed top-0 left-0 right-0 z-50 pointer-events-none flex items-center justify-center"
      style="height: 50vh;"
  >
    <div ref="svgaContainer" class="svga-container"></div>
  </div>
</template>

<script setup>
import { ref, inject , onMounted, onUnmounted } from 'vue'
import SVGA from 'svgaplayerweb'
import {getImageUrl} from "@/config/oss.js";

const game = inject('game')
const svgaContainer = ref(null)
const isPlaying = ref(false)
const player = ref(null)
const giftQueue = ref([]) // 礼物队列
const isProcessing = ref(false) // 是否正在播放

// 初始化SVGA播放器
onMounted(() => {
  if (svgaContainer.value) {
    player.value = new SVGA.Player(svgaContainer.value)
    player.value.setContentMode('AspectFill')
  }
})

// 添加礼物到队列
const addToQueue = (giftData) => {
  giftQueue.value.push(giftData)
  processQueue()
}

// 处理队列
const processQueue = async () => {
  if (isProcessing.value || giftQueue.value.length === 0) {
    return
  }

  isProcessing.value = true
  const giftData = giftQueue.value.shift()

  await playEffect(giftData)

  isProcessing.value = false

  // 继续处理下一个
  if (giftQueue.value.length > 0) {
    processQueue()
  }
}

// 播放特效
const playEffect = (giftData) => {
  return new Promise((resolve) => {
    const svgaUrl =getImageUrl('gift' , giftData.gift.nickname , '','svga')

    if (!svgaUrl) {
      console.error('[GiftEffect] SVGA URL为空，无法播放')
      isPlaying.value = false
      resolve()
      return
    }

    if (player.value) {
      player.value.stopAnimation()
      player.value.clear()
    }

    isPlaying.value = true

    // 每次播放时创建新的parser实例
    const parser = new SVGA.Parser()

    parser.load(svgaUrl, (videoItem) => {
      if (!player.value) {
        console.warn('[GiftEffect] Player已销毁，停止播放')
        isPlaying.value = false
        resolve()
        return
      }

      player.value.setVideoItem(videoItem)
      player.value.loops = 1
      player.value.clearsAfterStop = true

      // 定义播放完成回调
      const onFinishCallback = () => {
        if (player.value) {
          player.value.stopAnimation()
          player.value.clear()
        }
        isPlaying.value = false
        resolve()
      }

      // 设置监听器（SVGA库会自动替换旧的监听器）
      player.value.onFinished(onFinishCallback)

      player.value.startAnimation()

    }, (error) => {
      console.error('[GiftEffect] SVGA加载失败:', error)
      if (player.value) {
        player.value.clear()
      }
      isPlaying.value = false
      resolve() // 即使失败也要resolve，继续队列
    })
  })
}

// 清空队列
const clearQueue = () => {
  giftQueue.value = []
  isProcessing.value = false
  isPlaying.value = false
  if (player.value) {
    player.value.stopAnimation()
    player.value.clear()
  }
}

// 暴露方法给父组件
defineExpose({
  addToQueue,
  clearQueue
})

onUnmounted(() => {
  clearQueue()
  if (player.value) {
    player.value.stopAnimation()
    player.value.clear()
    player.value = null
  }
})
</script>

<style scoped>
.gift-effect-overlay {
  max-height: 50vh;
}

.svga-container {
  width: 100%;
  max-width: 600px;
  height: auto;
}
</style>
