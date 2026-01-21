<template>
  <!-- 发送红包抽屉 -->
  <el-drawer v-model="visible" direction="btt" size="auto" :close-on-click-modal="true" :with-header="false"
             class="red-packet-drawer-auto">
    <div class="flex flex-col h-full p-6">
      <!-- 标题 -->
      <div class="text-center mb-6">
        <div class="text-4xl mb-2">🧧</div>
        <div class="text-2xl font-bold text-red-600">发红包</div>
      </div>

      <!-- 表单 -->
      <el-form :model="form" label-width="100px" class="mb-4">
        <el-form-item label="总金额">
          <el-input-number
              v-model="form.total_amount"
              :min="1"
              :max="999999"
              :controls="false"
              placeholder="请输入总金额"
              class="w-full"
          />
        </el-form-item>

        <el-form-item label="红包个数">
          <el-input-number
              v-model="form.count"
              :min="1"
              :max="100"
              :controls="false"
              placeholder="请输入红包个数"
              class="w-full"
          />
        </el-form-item>

        <el-form-item label="祝福语">
          <el-input
              v-model="form.message"
              placeholder="恭喜发财，大吉大利！"
              maxlength="50"
              show-word-limit
          />
        </el-form-item>

        <el-form-item label="口令红包">
          <el-switch v-model="form.is_password" />
          <div v-if="form.is_password" class="text-xs text-gray-500 mt-1">
            领取后自动发送祝福语到世界聊天
          </div>
        </el-form-item>

        <el-form-item label="余额">
          <div class="text-lg font-bold text-orange-600">
            {{ playerBalance }} {{ playerBalanceType }}
          </div>
        </el-form-item>
      </el-form>

      <!-- 提示 -->
      <div class="text-sm text-gray-500 mb-4">
        <div>• 总金额必须大于或等于红包个数</div>
        <div>• 每人只能领取一次，随机金额</div>
        <div>• 最后一个人获得剩余全部</div>
      </div>

      <!-- 按钮 -->
      <div class="flex gap-3">
        <el-button @click="visible = false" class="flex-1">取消</el-button>
        <el-button
            type="danger"
            @click="sendRedPacket"
            :loading="sending"
            :disabled="!canSend"
            class="flex-1"
        >
          发送红包
        </el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import {ref, inject, computed} from 'vue'
import {ElMessage} from 'element-plus'

const game = inject('game')

const visible = ref(false)
const sending = ref(false)

const form = ref({
  total_amount: 10,
  count: 3,
  message: '',
  is_password: false
})

// 获取玩家余额（红包使用的货币类型，默认为3-星币）
const playerBalance = computed(() => {
  const redPacketBalanceId = game.game_config.get_value('game', 'red_packet_balance_id') || 3
  const balance = game.player.data?.player_balance?.find(b => b.balance_id === redPacketBalanceId)
  return balance?.count || 0
})

// 获取玩家余额类型标签
const playerBalanceType = computed(() => {
  const redPacketBalanceId = game.game_config.get_value('game', 'red_packet_balance_id') || 3
  const balance = game.player.data?.player_balance?.find(b => b.balance_id === redPacketBalanceId)
  return balance?.game_config_player_balance?.nickname || ''
})

// 是否可以发送
const canSend = computed(() => {
  return form.value.total_amount >= form.value.count &&
      form.value.total_amount > 0 &&
      form.value.count > 0 &&
      playerBalance.value >= form.value.total_amount
})

// 发送红包
const sendRedPacket = async () => {
  if (!canSend.value) {
    ElMessage.warning('请检查输入参数')
    return
  }

  if (sending.value) return

  sending.value = true
  try {
    const response = await game.player_red_packet.send(
        form.value.total_amount,
        form.value.count,
        form.value.message,
        form.value.is_password ? 'password' : 'normal'
    )

    if (response.code === 200) {
      ElMessage.success('红包发送成功！')
      // 刷新余额
      await game.player.update()
      // 关闭对话框
      visible.value = false
      // 重置表单
      form.value = {
        total_amount: 10,
        count: 3,
        message: '',
        is_password: false
      }
    } else {
      ElMessage.error(response.msg || '发送失败')
    }
  } catch (error) {
    console.error('发送红包失败:', error)
    ElMessage.error('发送失败，请重试')
  } finally {
    sending.value = false
  }
}

// 打开对话框
const open = () => {
  visible.value = true
}

defineExpose({
  open
})
</script>

<style scoped>
/* Drawer 自适应高度 */
.red-packet-drawer-auto :deep(.el-drawer) {
  height: auto !important;
  max-height: 90vh;
}

.red-packet-drawer-auto :deep(.el-drawer__body) {
  display: flex;
  flex-direction: column;
  padding: 0;
  height: 100%;
}
</style>
