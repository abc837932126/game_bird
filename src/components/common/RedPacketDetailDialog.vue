<template>
  <!-- 红包详情对话框 -->
  <el-dialog v-model="visible" :width="400" :close-on-click-modal="true" :show-close="true">
    <template #header>
      <div class="text-center">
        <div class="text-xl font-bold">红包详情</div>
      </div>
    </template>

    <div v-if="redPacketData" class="flex flex-col">
      <!-- 顶部：发送者信息 + 祝福语 -->
      <div class="text-center mb-6 p-4 bg-red-50 rounded-lg">
        <div class="text-lg font-bold text-red-600 mb-2">
          {{ redPacketData.sender?.nickname || '玩家' }} 的红包
        </div>
        <div class="text-sm text-gray-600">
          {{ redPacketData.message || '恭喜发财，大吉大利！' }}
        </div>
      </div>

      <!-- 中部：金额显示 + 进度 -->
      <div class="text-center mb-4">
        <div class="text-3xl font-bold text-red-600 mb-2">
          {{ redPacketData.total_amount }} {{ balanceType }}
        </div>
        <div class="text-sm text-gray-500">
          已领取 {{ redPacketData.claim_records?.length || 0 }} / {{ redPacketData.count }} 个
        </div>
        <el-progress
            :percentage="claimPercentage"
            :color="progressColor"
            :stroke-width="8"
            class="mt-2"
        />
      </div>

      <!-- 领取按钮 -->
      <div v-if="!hasClaimed && redPacketData.status === 'active'" class="text-center mb-6">
        <el-button
            type="danger"
            size="large"
            @click="claimRedPacket"
            :loading="claiming"
            class="w-24 h-24 rounded-full text-4xl font-bold"
        >
          开
        </el-button>
      </div>

      <!-- 已领取提示 -->
      <div v-else-if="hasClaimed" class="text-center mb-4">
        <div class="text-green-600 font-bold">你已领取过这个红包</div>
      </div>

      <!-- 已抢完提示 -->
      <div v-else-if="redPacketData.status === 'completed'" class="text-center mb-4">
        <div class="text-gray-500 font-bold">红包已被抢完</div>
      </div>

      <!-- 领取记录列表 -->
      <div v-if="redPacketData.claim_records && redPacketData.claim_records.length > 0"
           class="border-t pt-4">
        <div class="text-sm text-gray-600 mb-2">领取记录</div>
        <div class="max-h-60 overflow-y-auto space-y-2">
          <div
              v-for="record in redPacketData.claim_records"
              :key="record.id"
              class="flex items-center justify-between p-2 bg-gray-50 rounded"
          >
            <!-- 左侧：头像 + 昵称 -->
            <div class="flex items-center gap-2">
              <PlayerAvatar
                  :player-id="record.player?.id"
                  :sex="record.player?.sex"
                  :avatar-frame-id="record.player?.avatar_frame_id"
                  :size="32"
              />
              <div>
                <div class="text-sm font-medium">{{ record.player?.nickname }}</div>
                <div class="text-xs text-gray-500">{{ formatTime(record.claim_time) }}</div>
              </div>
            </div>

            <!-- 右侧：金额 + 手气最佳 -->
            <div class="text-right">
              <div class="text-sm font-bold text-red-600">
                {{ record.amount }} {{ balanceType }}
              </div>
              <div v-if="isBestPlayer(record.player_id)" class="text-xs text-yellow-600">
                🏆 手气最佳
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 没有领取记录 -->
      <div v-else class="text-center text-gray-400 py-4">
        还没有人领取
      </div>
    </div>

    <!-- 加载中 -->
    <div v-else class="text-center py-8">
      <el-icon class="is-loading" :size="40">
        <Loading/>
      </el-icon>
    </div>
  </el-dialog>

  <!-- 领取结果对话框 -->
  <el-dialog v-model="resultVisible" :width="300" :show-close="false" :close-on-click-modal="false">
    <div class="text-center py-6">
      <div class="text-6xl mb-4">🎉</div>
      <div class="text-2xl font-bold text-red-600 mb-2">
        {{ claimResult.amount }} {{ balanceType }}
      </div>
      <div v-if="claimResult.is_best" class="text-yellow-600 font-bold mb-4">
        🏆 手气最佳
      </div>
      <el-button type="primary" @click="closeResultDialog">知道了</el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import {ref, inject, computed} from 'vue'
import {message} from '@/game/notification-center'
import {Loading} from '@element-plus/icons-vue'
import {getImageUrl} from '@/config/oss'
import PlayerAvatar from './PlayerAvatar.vue'

const game = inject('game')

const visible = ref(false)
const claiming = ref(false)
const redPacketData = ref(null)
const hasClaimed = ref(false)
const bestPlayerId = ref(null)

const resultVisible = ref(false)
const claimResult = ref({amount: 0, is_best: false})

// 获取红包货币类型名称
const balanceType = computed(() => {
  const redPacketBalanceId = 3 // 红包货币类型ID
  const balance = game.player.data?.player_balance?.find(b => b.balance_id === redPacketBalanceId)
  return balance?.game_config_player_balance?.nickname || ''
})

// 计算领取进度百分比
const claimPercentage = computed(() => {
  if (!redPacketData.value) return 0
  const claimed = redPacketData.value.claim_records?.length || 0
  const total = redPacketData.value.count || 1
  return Math.round((claimed / total) * 100)
})

// 进度条颜色
const progressColor = computed(() => {
  const percentage = claimPercentage.value
  if (percentage < 30) return '#f56c6c'
  if (percentage < 70) return '#e6a23c'
  return '#67c23a'
})

// 判断是否是手气最佳
const isBestPlayer = (playerId) => {
  return playerId === bestPlayerId.value
}

// 格式化时间
const formatTime = (timeString) => {
  const date = new Date(timeString)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 加载红包详情
const loadDetail = async (redPacketId) => {
  try {
    const response = await game.player_red_packet.getDetail(redPacketId)
    if (response.code === 200) {
      redPacketData.value = response.data.red_packet
      hasClaimed.value = response.data.has_claimed
      bestPlayerId.value = response.data.best_player_id
    } else {
      message.error(response.msg || '加载失败')
    }
  } catch (error) {
    console.error('加载红包详情失败:', error)
    message.error('加载失败，请重试')
  }
}

// 领取红包
const claimRedPacket = async () => {
  if (!redPacketData.value || claiming.value) return

  claiming.value = true
  try {
    const response = await game.player_red_packet.claim(redPacketData.value.id)

    if (response.code === 200) {
      // 显示领取结果
      claimResult.value = {
        amount: response.data.amount,
        is_best: response.data.is_best
      }
      resultVisible.value = true

      // 刷新余额
      await game.player.update()

      // 重新加载详情
      await loadDetail(redPacketData.value.id)
    } else {
      message.error(response.msg || '领取失败')
    }
  } catch (error) {
    console.error('领取红包失败:', error)
    message.error('领取失败，请重试')
  } finally {
    claiming.value = false
  }
}

// 关闭领取结果对话框
const closeResultDialog = () => {
  resultVisible.value = false
}

// 打开对话框
const open = async (redPacketId) => {
  visible.value = true
  redPacketData.value = null
  await loadDetail(redPacketId)
}

defineExpose({
  open
})
</script>

<style scoped>
/* 自定义样式 */
</style>
