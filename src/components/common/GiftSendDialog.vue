<template>
  <!-- 礼物赠送抽屉 -->
  <el-drawer v-model="visible" direction="btt" size="auto" :close-on-click-modal="true" :with-header="false"
             class="gift-drawer-auto">
    <div class="flex flex-col h-full">
      <!-- Tab 区域 -->
      <el-tabs v-model="activeTab" class="gift-tabs flex-1">
        <!-- 礼物 Tab -->
        <el-tab-pane label="礼物" name="gift">
          <div v-if="game.game_item_gift.data && game.game_item_gift.data.length > 0" class="gift-scroll-container">
            <div class="gift-scroll-wrapper">
              <div
                  v-for="gift in game.game_item_gift.data"
                  :key="gift.id"
                  @click="selectGift(gift)"
                  class="gift-item cursor-pointer"
                  :class="selectedGift?.id === gift.id ? 'gift-item-selected' : ''"
              >
                <el-image
                    style="width: 50px"
                    :src="getImageUrl('gift' , gift.nickname)"
                    class="gift-avatar"
                >
                  🎁
                </el-image>
                <div class="gift-name">{{ gift.nickname }}</div>
                <div class="gift-price">
                  {{ gift.price }} {{ getCurrencyName(gift.balance_id) }}
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-400">
            <div class="text-2xl mb-1">🎁</div>
            <p class="text-xs">暂无礼物</p>
          </div>
        </el-tab-pane>

        <!-- 背包 Tab -->
        <el-tab-pane label="背包" name="backpack">
          <div v-if="backpackGifts.length > 0" class="gift-scroll-container">
            <div class="gift-scroll-wrapper">
              <div
                  v-for="item in backpackGifts"
                  :key="item.game_item_gift.id"
                  @click="selectGift(item.game_item_gift)"
                  class="gift-item cursor-pointer"
                  :class="selectedGift?.id === item.game_item_gift.id ? 'gift-item-selected' : ''"
              >
                <el-avatar :size="50" :src="getImageUrl('gift' , item.game_item_gift.nickname)" class="gift-avatar">
                  🎁
                </el-avatar>
                <div class="gift-name">{{ item.game_item_gift.nickname }}</div>
                <div class="gift-badge">{{ item.count }}</div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-400">
            <div class="text-2xl mb-1">🎒</div>
            <p class="text-xs">背包中暂无礼物</p>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 底部固定操作栏 -->
      <div class="bottom-action-bar">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">余额:</span>
          <span class="text-base font-bold text-orange-600">
            {{ playerBalance }} {{ playerBalanceType }}
          </span>
        </div>
        <div class="flex items-center gap-3">
          <el-input-number
              v-model="giftCount" :min="1" :max="999" :controls="false" size="default" class="count-input"/>
          <el-button
              type="primary" @click="sendGift" :loading="sending" :disabled="!selectedGift" size="default"
          >
            赠送
          </el-button>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import {ref, inject, computed} from 'vue'
import {message} from '@/game/notification-center'
import {getImageUrl} from "@/config/oss.js";


const game = inject('game')

const visible = ref(false)
const activeTab = ref('gift')
const receiverInfo = ref(null)
const selectedGift = ref(null)
const giftCount = ref(1)
const sending = ref(false)

// 获取背包中的礼物列表
const backpackGifts = computed(() => {
  return game.player_item_gift.data?.filter(item => item.count > 0) || []
})

// 获取玩家余额（根据选中礼物的货币类型）
const playerBalance = computed(() => {
  if (!selectedGift.value) return 0
  const balance = game.player.data?.player_balance?.find(b => b.balance_id === selectedGift.value.balance_id)
  return balance?.count || 0
})

// 获取玩家余额类型标签（根据选中礼物的货币类型）
const playerBalanceType = computed(() => {
  if (!selectedGift.value) return ''
  const balance = game.player.data?.player_balance?.find(b => b.balance_id === selectedGift.value.balance_id)
  return balance?.game_config_player_balance?.nickname || ''
})

// 获取背包中的礼物数量
const getBackpackCount = (giftId) => {
  return game.player_item_gift.getCount(giftId)
}

// 获取货币名称
const getCurrencyName = (balanceId) => {
  const balance = game.player.data?.player_balance?.find(b => b.balance_id === balanceId)
  return balance?.game_config_player_balance?.nickname || '未知'
}

// 选择礼物
const selectGift = (gift) => {
  selectedGift.value = gift
  giftCount.value = 1
}

// 统一的赠送方法
const sendGift = async () => {
  if (!selectedGift.value || !receiverInfo.value) return

  // 如果在背包tab且有库存，从背包赠送；否则购买并赠送
  const backpackCount = getBackpackCount(selectedGift.value.id)
  if (activeTab.value === 'backpack' && backpackCount >= giftCount.value) {
    await sendFromBackpack()
  } else {
    await sendByPurchase()
  }
}

// 购买并赠送
const sendByPurchase = async () => {
  if (!selectedGift.value || !receiverInfo.value) return

  sending.value = true
  try {
    const receiverId = receiverInfo.value.player_id || receiverInfo.value.id
    const response = await game.player_gift.sendByPurchase(
        receiverId,
        selectedGift.value.id,
        giftCount.value
    )

    if (response.code === 200) {
      message.success('赠送成功！')
      // 刷新余额和背包
      await game.player.update()
      await game.player_item_gift.update()
      // 关闭对话框
      visible.value = false
    } else {
      message.error(response.msg || '赠送失败')
    }
  } catch (error) {
    console.error('赠送失败:', error)
    message.error('赠送失败，请重试')
  } finally {
    sending.value = false
  }
}

// 从背包赠送
const sendFromBackpack = async () => {
  if (!selectedGift.value || !receiverInfo.value) return

  // 检查背包数量
  const backpackCount = getBackpackCount(selectedGift.value.id)
  if (backpackCount < giftCount.value) {
    message.warning('背包礼物数量不足')
    return
  }

  sending.value = true
  try {
    const receiverId = receiverInfo.value.player_id || receiverInfo.value.id
    const response = await game.player_gift.sendFromBackpack(
        receiverId,
        selectedGift.value.id,
        giftCount.value
    )

    if (response.code === 200) {
      message.success('赠送成功！')
      // 刷新背包
      await game.player_item_gift.update()
      // 关闭对话框
      visible.value = false
    } else {
      message.error(response.msg || '赠送失败')
    }
  } catch (error) {
    console.error('赠送失败:', error)
    message.error('赠送失败，请重试')
  } finally {
    sending.value = false
  }
}

// 打开面板
const open = async (receiver) => {
  receiverInfo.value = receiver
  selectedGift.value = null
  giftCount.value = 1
  activeTab.value = 'gift'
  visible.value = true
  // 从服务器获取最新的礼物列表
  await game.game_item_gift.update()
}

defineExpose({
  open
})
</script>

<style scoped>
/* Drawer 真正的自适应高度 */
.gift-drawer-auto :deep(.el-drawer) {
  height: auto !important;
  max-height: 90vh;
}

.gift-drawer-auto :deep(.el-drawer__body) {
  display: flex;
  flex-direction: column;
  padding: 0;
  height: 100%;
}

/* Tab 样式 */
.gift-tabs {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}



.gift-tabs :deep(.el-tabs__content) {
  flex: 1;
}

/* 底部固定操作栏 */
.bottom-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  background: white;
  flex-shrink: 0;
}

.bottom-action-bar .count-input {
  width: 70px;
}

/* 网格滚动容器 - 上下滚动 */
.gift-scroll-container {
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  max-height: 400px;
  padding: 4px;
}

/* 网格包裹器 - 一行4个 */
.gift-scroll-wrapper {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

/* 单个礼物项 */
.gift-item {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  border: 2px solid transparent;
  transition: all 0.2s;
  position: relative;
}

.gift-item:hover {
  border-color: #fecaca;
}

/* 选中状态 */
.gift-item-selected {
  border-color: #ec4899 !important;
  box-shadow: 0 2px 12px rgba(236, 72, 153, 0.3);
}

/* 礼物图标 */
.gift-avatar {
  margin-bottom: 4px;
}

/* 礼物名称 */
.gift-name {
  font-size: 12px;
  color: #374151;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  line-height: 1.2;
}

/* 礼物价格 */
.gift-price {
  font-size: 10px;
  color: #f59e0b;
  font-weight: 600;
  margin-top: 2px;
}

/* 背包数量角标 */
.gift-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
</style>
