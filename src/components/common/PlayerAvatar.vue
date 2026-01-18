<template>
  <div class="player-avatar" :style="{ width: size + 'px', height: size + 'px' }">
    <!-- 头像层：独立的头像显示 -->
    <div v-if="avatarFrameId" class="relative" :style="{ width: size + 'px', height: size + 'px' }" >
      <!-- 头像背景层 -->
      <el-avatar
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          :size="size * 0.7"
          :src="avatarUrl"
      />

      <!-- SVGA 动画前景层 -->
      <div ref="svgaContainer" class="absolute inset-0 z-10" ></div>
    </div>
    <el-avatar v-else :size="size * 0.7" :src="avatarUrl"/>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, onActivated, watch, inject, onBeforeUnmount, onDeactivated, nextTick} from 'vue'
import {getImageUrl} from '@/config/oss'
import SVGA from 'svgaplayerweb'

const game = inject('game')

const props = defineProps({
  playerId: {type: Number, required: true},
  sex: {type: Number, required: true},
  avatarFrameId: {type: Number, default: null},
  size: {type: Number, default: 40}
})

const svgaContainer = ref(null)
let svgaPlayer = null
let svgaParser = null // 存储 parser 引用以便清理

// 计算头像URL
const avatarUrl = computed(() => {
  const avatarId = ((props.playerId - 1) % 12) + 1
  return getImageUrl('head', `${props.sex}/${avatarId}`)
})

// 加载SVGA头像框
const loadAvatarFrame = async () => {

  if (!props.avatarFrameId || !svgaContainer.value) {
    return
  }

  // 清理旧的parser
  if (svgaParser) {
    svgaParser = null
  }

  // 清理旧的player
  if (svgaPlayer) {
    svgaPlayer.stopAnimation()
    svgaPlayer.clear()
    svgaPlayer = null
  }

  try {


    // 通过ID查找frame对象获取nickname
    const frame = game.game_avatar_frame.getById(props.avatarFrameId)

    if (!frame || !frame.nickname) {
      return
    }

    const svgaUrl = game.game_avatar_frame.getFrameSvgaUrl(frame.nickname)


    // 创建 SVGA Player，设置为填充模式
    // 确保容器有正确的尺寸
    const containerWidth = svgaContainer.value.offsetWidth
    const containerHeight = svgaContainer.value.offsetHeight


    if (containerWidth === 0 || containerHeight === 0) {
      return
    }

    svgaPlayer = new SVGA.Player(svgaContainer.value)
    svgaPlayer.setContentMode("AspectFill")

    // 每次加载创建新的parser实例
    svgaParser = new SVGA.Parser()

    svgaParser.load(svgaUrl, (videoItem) => {
      if (!svgaPlayer) {
        return
      }

      svgaPlayer.setVideoItem(videoItem)
      svgaPlayer.loops = 0 // 无限循环
      svgaPlayer.startAnimation()
    }, (error) => {
      console.error('[头像框] SVGA加载失败:', error)
    })
  } catch (error) {
    console.error('[头像框] 加载异常:', error)
  }
}

onMounted(async () => {
  // console.log('[PlayerAvatar] 组件挂载', `playerId=${props.playerId}, frameId=${props.avatarFrameId}`)
  await nextTick()

  await loadAvatarFrame()
})

// 页面激活时，重新启动动画（如果已有 player）或重新加载
onActivated(async () => {
  // console.log('[PlayerAvatar] 页面激活', `playerId=${props.playerId}, frameId=${props.avatarFrameId}, hasPlayer=${!!svgaPlayer}`)
  if (svgaPlayer) {
    svgaPlayer.startAnimation()
  } else if (props.avatarFrameId && svgaContainer.value) {
    // 如果没有 player 但有头像框ID，说明是新消息，需要重新加载
    await nextTick()
    await loadAvatarFrame()
  }
})

// 页面停用时，停止动画以节省资源
onDeactivated(() => {
  if (svgaPlayer) {
    // console.log('[PlayerAvatar] 页面停用，停止动画', `playerId=${props.playerId}, frameId=${props.avatarFrameId}`)
    svgaPlayer.pauseAnimation()
  }
})

// 监听头像框ID变化
const stopWatcher1 = watch(() => props.avatarFrameId, async () => {
  await nextTick()

  await loadAvatarFrame()
})

// 监听容器ref变化（重要：确保DOM渲染后再加载）
const stopWatcher2 = watch(svgaContainer, async () => {
  if (svgaContainer.value && props.avatarFrameId) {
    await nextTick()

    await loadAvatarFrame()
  }
})

onBeforeUnmount(() => {
  // console.log('[PlayerAvatar] 组件销毁，清理 SVGA 资源', props.playerId)

  // 停止watchers
  if (stopWatcher1) {
    stopWatcher1()
  }
  if (stopWatcher2) {
    stopWatcher2()
  }

  // 清理 parser
  if (svgaParser) {
    // console.log('[PlayerAvatar] 清理 SVGA parser', props.playerId)
    svgaParser = null
  }

  // 组件销毁时清理资源
  if (svgaPlayer) {
    // console.log('[PlayerAvatar] 清理 SVGA player', props.playerId)
    svgaPlayer.stopAnimation()
    svgaPlayer.clear()
    svgaPlayer = null
  }
})
</script>

<style scoped>



</style>
