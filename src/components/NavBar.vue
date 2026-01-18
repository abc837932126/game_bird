<template>
  <!-- 礼物赠送组件 -->
  <GiftSendDialog ref="giftSendDialogRef" />
  <div class="grid grid-cols-5 border-t bg-white">
    <div
      v-for="nav in navList"
      :key="nav.name"
      @click="game.page = nav.name"
      :class="['py-3 text-center cursor-pointer', game.page === nav.name ? 'text-purple-500' : 'text-gray-500']"
    >
      <!-- 如果是好友导航且有待处理申请，显示红点 -->
      <el-badge v-if="nav.name === 'page_friend'" :value="pendingCount" :hidden="pendingCount === 0" type="danger" :offset="[5, 0]">
        <div class="text-xl">{{ nav.icon }}</div>
      </el-badge>
      <!-- 如果是工会导航且有待处理申请，显示红点 -->
      <el-badge v-else-if="nav.name === 'page_guild'" :value="guildApplicationCount" :hidden="guildApplicationCount === 0" type="danger" :offset="[5, 0]">
        <div class="text-xl">{{ nav.icon }}</div>
      </el-badge>
      <div v-else class="text-xl">{{ nav.icon }}</div>
      <div class="text-xs mt-1">{{ nav.label }}</div>
    </div>
    <!-- 全屏按钮 -->
    <div
      @click="toggleFullscreen"
      class="py-3 text-center cursor-pointer text-gray-500"
    >
      <div class="text-xl">{{ fullscreenIcon }}</div>
      <div class="text-xs mt-1">全屏</div>
    </div>
  </div>
</template>

<script setup>
import GiftSendDialog from './common/GiftSendDialog.vue'
import { inject, ref, computed, onMounted, onUnmounted } from 'vue'
import { ElBadge } from 'element-plus'
import screenfull from 'screenfull'

const game = inject('game')
const isFullscreen = ref(false)
const giftSendDialogRef = ref(null)

// 获取待处理好友申请数量
const pendingCount = computed(() => {
  return game.player_friend?.pendingCount || 0
})

// 获取待处理工会申请数量
const guildApplicationCount = computed(() => {
  return game.guild_application?.pendingCount || 0
})

const navList = [
  { name: 'page_home', label: '首页', icon: '🏠' },
  { name: 'page_daily', label: '每日', icon: '📅' },
  { name: 'page_bank', label: '银行', icon: '🏦' },
  { name: 'page_player_item', label: '背包', icon: '🎒' },
  { name: 'page_shop', label: '商店', icon: '🛒' },
  { name: 'page_ladder', label: '天梯', icon: '🏆' },
  { name: 'page_team', label: '队伍', icon: '⚔️' },
  { name: 'page_leaderboard', label: '排行', icon: '📊' },
  { name: 'page_chat', label: '聊天', icon: '💬' },
  { name: 'page_friend', label: '好友', icon: '👥' },
  { name: 'page_guild', label: '工会', icon: '🏰' },
  { name: 'page_player_info', label: '我的', icon: '👤' },
  { name: 'page_player_bird', label: '仓库', icon: '🐦' },
  { name: 'page_jiaotang', label: '教堂', icon: '⛪' }
]

// 全屏切换功能
const toggleFullscreen = () => {
  if (screenfull.isEnabled) {
    screenfull.toggle()
  }
}

// 监听全屏状态变化
const handleFullscreenChange = () => {
  if (screenfull.isEnabled) {
    isFullscreen.value = screenfull.isFullscreen
  }
}

onMounted(() => {
  if (screenfull.isEnabled) {
    screenfull.on('change', handleFullscreenChange)
  }
  // 加载待处理好友申请数量
  if (game.player_friend) {
    game.player_friend.updatePending()
  }
  // 加载待处理工会申请数量（如果玩家是工会管理员）
  if (game.guild_application && game.guild.data?.id && (game.guild.data?.my_role === 'leader' || game.guild.data?.my_role === 'officer')) {
    game.guild_application.updateGuildApplications(game.guild.data.id)
  }
})

onUnmounted(() => {
  if (screenfull.isEnabled) {
    screenfull.off('change', handleFullscreenChange)
  }
})

// 全屏按钮显示的图标
const fullscreenIcon = computed(() => isFullscreen.value ? '🗗' : '⛶')

// 暴露方法供其他组件调用
defineExpose({
  openGiftDialog: (receiver) => {
    giftSendDialogRef.value?.open(receiver)
  }
})
</script>
