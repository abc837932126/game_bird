<template>
  <div class="flex flex-col h-full">

    <!-- 顶部横幅 -->
    <div class="mb-4 rounded-lg overflow-hidden ">
      <el-image :src="getImageUrl('bg', '世界聊天')" fit="cover" class="w-full h-38" loading="lazy">
        <template #error>
          <div class="h-38 bg-linear-to-r from-pink-400 via-purple-400 to-red-400
					            flex items-center justify-center">
            <span class="text-8xl">⛪</span>
          </div>
        </template>
      </el-image>

      <!-- 礼物特效播放器 -->

    </div>

    <!-- 聊天区域 -->
    <div class="flex-1 flex flex-col overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100">
      <!-- 消息列表 -->
      <div ref="messageContainer" class="flex-1 p-4! space-y-4 overflow-y-scroll"
           style="background: #f8fafc; min-height: 0;">
        <div v-if="game.player_chat.data.length === 0" class="text-center text-gray-400 py-8">
          <div class="text-6xl mb-4">📝</div>
          <p>暂无消息，发送第一条消息吧！</p>
        </div>

        <!-- 遍历消息（包含普通消息和礼物消息） -->
        <div v-for="(msg, index) in game.player_chat.data" :key="msg.id">

          <!-- 普通聊天消息 -->
          <div v-if="msg.type === 'chat' || !msg.type"
               class="message-item flex items-start gap-3 py-2!"
               :class="isMyMessage(msg) ? 'flex-row-reverse' : 'flex-row'">

            <!-- 头像（可点击） -->
            <div
                class="cursor-pointer hover:opacity-80 transition-opacity"
                @click="showUserInfo(msg)"
            >
              <PlayerAvatar
                  :player-id="msg.player_id"
                  :sex="msg.sex"
                  :avatar-frame-id="index >= game.player_chat.data.length - 10 ? msg.avatar_frame_id : null"
                  :size="60"
              />
            </div>

            <!-- 消息内容区 -->
            <div class="flex flex-col gap-1 max-w-[70%]"
                 :class="isMyMessage(msg) ? 'items-end' : 'items-start'">

              <!-- 用户信息（可点击） -->
              <div
                  class="flex items-center gap-2 px-2 cursor-pointer hover:opacity-70 transition-opacity"
                  :class="isMyMessage(msg) ? 'flex-row-reverse' : 'flex-row'"
                  @click="showUserInfo(msg)"
              >
                <span class="text-xs font-medium" :class="getNameColor(msg)">
                  <span v-if="msg.guild_name" class="text-blue-600">[{{ truncateGuildName(msg.guild_name) }}] </span>{{ msg.nickname }}
                </span>
                <span v-if="msg.title"
                      class="text-xs px-1.5 py-0.5 rounded bg-linear-to-r from-yellow-400 to-orange-400 text-white">
									{{ msg.title }}
								</span>
                <span class="text-xs text-gray-400">Lv.{{ msg.lv }}</span>
              </div>

              <!-- 消息气泡 -->
              <el-card
                  class="message-bubble"
                  :body-style="{ padding: '12px 16px' }"
                  shadow="never"
                  :class="isMyMessage(msg) ? 'my-message' : 'other-message'">
                <div class="text-sm wrap-break-word" :class="isMyMessage(msg) ? 'text-white' : 'text-gray-800'">
                  {{ msg.content }}
                </div>
              </el-card>

              <!-- 时间 -->
              <span class="text-xs text-gray-400 px-2">{{ formatTime(msg.ct_time) }}</span>
            </div>
          </div>

          <!-- 礼物消息 -->
          <div v-else-if="msg.type === 'gift'"
               class="gift-message-card bg-linear-to-r from-pink-50 to-purple-50
              rounded-2xl px-6 py-4 border border-pink-200 shadow-sm
              flex items-center gap-4 max-w-md justify-center">
            <!-- 礼物图标（缩小） -->
            <img :src="getGiftImageUrl(msg.gift_id)" class="gift-icon shrink-0 w-10 h-10" alt="礼物图标"/>

            <!-- 礼物信息 -->

            <div class="text-sm font-medium text-gray-800 mb-1">
              <span class="text-pink-600">{{ msg.sender_username }}</span>
              送给
              <span class="text-purple-600">{{ msg.receiver_username }}</span>
              <span class="font-bold text-orange-500">{{ msg.gift_name }}</span>
              <span>×{{ msg.count }}</span>
            </div>


          </div>

          <!-- 红包消息 -->
          <div v-else-if="msg.type === 'red_packet'"
               @click="openRedPacket(msg)"
               class="red-packet-card bg-linear-to-r from-red-500 to-red-600
                      rounded-2xl px-6 py-4 border-2 border-yellow-400
                      flex items-center gap-4 max-w-md cursor-pointer
                      hover:scale-105 transition-transform mx-auto">
            <!-- 红包图标 -->
            <div class="text-5xl">🧧</div>

            <!-- 红包信息 -->
            <div class="flex-1 text-white">
              <div class="font-bold text-lg mb-1">
                {{ msg.sender_username }} 的红包
              </div>
              <div class="text-sm opacity-90">
                {{ msg.message }}
              </div>
              <div class="text-xs opacity-75 mt-1">
                {{ msg.status === 'completed' ? '已被抢完' : `剩余 ${msg.remaining_count || msg.count} 个` }}
              </div>
            </div>

            <!-- 开字 -->
            <div class="bg-yellow-400 text-red-600 font-bold text-2xl w-12 h-12 rounded-full flex items-center justify-center">
              开
            </div>
          </div>

          <!-- NPC 消息 -->
          <div v-else-if="msg.type === 'npc'"
               class="npc-message-card bg-gradient-to-r from-yellow-50 to-amber-50
                      rounded-2xl px-6 py-4 border-2 border-yellow-400 shadow-md
                      flex items-center gap-4 max-w-2xl mx-auto my-2">
            <!-- NPC 图标 -->
            <div class="text-4xl flex-shrink-0">🤖</div>

            <!-- NPC 消息内容 -->
            <div class="flex-1 min-w-0">
              <div class="font-bold text-amber-600 mb-1 text-sm">
                {{ msg.npc_name }}
              </div>
              <div class="text-sm text-gray-700 break-words">
                {{ msg.content }}
              </div>
              <div class="text-xs text-gray-400 mt-1">
                {{ formatTime(msg.ct_time) }}
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- 输入区域 -->
      <div class="p-4 bg-white border-t border-gray-100 shrink-0">
        <div class="flex gap-2">
          <el-button
              type="danger"
              @click="openRedPacketSendDialog"
              size="large"
          >
            <span class="text-xl mr-1">🧧</span>
            红包
          </el-button>
          <el-input
              v-model="messageInput"
              placeholder="输入消息... (回车发送)"
              maxlength="200"
              show-word-limit
              @keyup.enter="sendMessage"
              class="flex-1"
              size="large"
          />
          <el-button
              type="primary"
              :icon="ChatDotRound"
              @click="sendMessage"
              :loading="sending"
              :disabled="!messageInput.trim()"
              size="large"
          >
            发送
          </el-button>
        </div>
      </div>
    </div>

    <!-- 用户信息对话框 -->
    <UserDetailDialog ref="userInfoDialogRef"/>

    <GiftEffectPlayer ref="giftEffectPlayerRef"/>

    <RedPacketDetailDialog ref="redPacketDetailRef"/>

    <RedPacketSendDialog ref="redPacketSendDialogRef"/>
  </div>
</template>

<script setup>
import {ref, inject, onMounted, onActivated, onUnmounted, nextTick, watch, markRaw} from 'vue'
import { ElCard} from 'element-plus'
import { message } from '@/game/notification-center'
import {ChatDotRound} from '@element-plus/icons-vue'
import PlayerAvatar from '../common/PlayerAvatar.vue'
import UserDetailDialog from '../UserDetailDialog/index.vue'
import GiftEffectPlayer from '@/components/gift/GiftEffectPlayer.vue'
import RedPacketDetailDialog from '../common/RedPacketDetailDialog.vue'
import RedPacketSendDialog from '../common/RedPacketSendDialog.vue'
import {getImageUrl} from '@/config/oss'

const game = inject('game')
const messageInput = ref('')
const sending = ref(false)
const messageContainer = ref(null)
const userInfoDialogRef = ref(null)
const giftEffectPlayerRef = ref(null)
const redPacketDetailRef = ref(null)
const redPacketSendDialogRef = ref(null)
const isLoadingHistory = ref(false)

// 判断是否是自己的消息
const isMyMessage = (msg) => {
  return msg.player_id === game.player.data?.id
}

// 截断工会名称为最多3个字符
const truncateGuildName = (guildName) => {
  return guildName.length > 3 ? guildName.substring(0, 3) : guildName
}

// 获取名称颜色
const getNameColor = (msg) => {
  // 检查是否有魅力榜第一名徽章
  if (msg.badges && msg.badges.includes('charm_top')) {
    return 'text-purple-600 font-bold'
  }
  return 'text-gray-600'
}

// 显示用户信息
const showUserInfo = (msg) => {
  // 不能查看自己的信息
  if (isMyMessage(msg)) {
    message.info('这是你自己的消息')
    return
  }
  userInfoDialogRef.value?.open(msg)
}

// 打开红包
const openRedPacket = async (msg) => {
  redPacketDetailRef.value?.open(msg.red_packet_id)
}

// 打开发送红包对话框
const openRedPacketSendDialog = () => {
  redPacketSendDialogRef.value?.open()
}

// 格式化时间（使用 v-memo 优化，避免不必要的重新计算）
const formatTime = (timeString) => {
	const date = new Date(timeString)
	const now = Date.now()
	const diff = now - date.getTime()

	// 一分钟内
	if (diff < 60000) {
		return '刚刚'
	}
	// 一小时内
	if (diff < 3600000) {
		return `${Math.floor(diff / 60000)}分钟前`
	}
	// 今天
	const nowDate = new Date(now)
	if (date.toDateString() === nowDate.toDateString()) {
		return date.toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'})
	}
	// 其他
	return date.toLocaleString('zh-CN', {
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	})
}

// 获取礼物图标URL
const getGiftImageUrl = (giftId) => {
  const gift = game.game_item_gift.get(giftId);
  if (!gift) {
    return ''; // 如果找不到礼物，返回空字符串
  }
  return getImageUrl("gift", gift.nickname)
}

// 滚动到底部（确保 DOM 完全渲染后执行）
const scrollToBottom = () => {
  // 使用 setTimeout 确保在浏览器完成布局后执行
  setTimeout(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  }, 0)
}

// 发送消息
const sendMessage = async () => {
  const content = messageInput.value.trim()
  if (!content) {
    return
  }

  if (sending.value) {
    return
  }

  sending.value = true

  try {
    const res = await game.player_chat.send(content)

    if (res.code === 200) {
      messageInput.value = ''

      // 滚动到底部
      await nextTick()
      scrollToBottom()
    } else {
      message.error(res.msg || '发送失败')
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    message.error('发送失败，请重试')
  } finally {
    sending.value = false
  }
}

// 加载聊天历史
const loadHistory = async () => {
  isLoadingHistory.value = true
  try {
    // 先获取服务器历史，但不立即替换本地数据
    const res = await game.player_chat.api.getHistory()
    if (res.code !== 200 || !res.data || res.data.length === 0) {
      return
    }

    const serverData = res.data
    const localData = game.player_chat.data

    // 比较最后一条消息的 ID
    const serverLastId = serverData[serverData.length - 1]?.id
    const localLastId = localData[localData.length - 1]?.id

    // 如果最后一条消息 ID 相同，说明数据已经是最新的
    if (serverLastId === localLastId && localData.length > 0) {
      // console.log('[聊天] 历史消息已是最新，跳过加载')
      return
    }

    // 否则更新数据
    console.log('[聊天] 加载历史消息')
    // 使用 markRaw 防止 Vue 将消息对象深度响应式化，减少内存占用
    game.player_chat.data = serverData.map(msg => markRaw(msg))

    // 同步ID集合
    game.player_chat.lastMessageIds.clear()
    serverData.forEach(msg => {
      if (msg.id) {
        game.player_chat.lastMessageIds.add(msg.id)
      }
    })

    // 更新 lastCheckedMessageId
    if (serverData.length > 0) {
      lastCheckedMessageId = serverData[serverData.length - 1].id
    }

    await nextTick()
    scrollToBottom()
  } finally {
    isLoadingHistory.value = false
  }
}

// 记录上次检查时的最后一条消息ID
let lastCheckedMessageId = null
let lastArrayLength = 0

// 监听消息列表变化，处理礼物动画并滚动（使用浅监听优化内存）
const stopWatcher = watch(() => [game.player_chat.data.length, game.player_chat.data[game.player_chat.data.length - 1]?.id], async ([newLength, lastId]) => {
  // 检查最后一条消息是否是新的
  if (newLength === 0) return

  const lastMessage = game.player_chat.data[newLength - 1]

  // 如果最后一条消息的ID和上次检查的不同，说明有新消息
  if (lastMessage && lastMessage.id !== lastCheckedMessageId) {
    const previousId = lastCheckedMessageId
    lastCheckedMessageId = lastMessage.id

    // 如果之前有消息（不是首次加载），才处理礼物特效和滚动
    if (previousId !== null) {
      // 只有在非加载历史状态下才触发礼物特效
      if (!isLoadingHistory.value && lastMessage && lastMessage.type === 'gift') {
        const gift = game.game_item_gift.data.find(g => g.id === lastMessage.gift_id)
        if (giftEffectPlayerRef.value && gift) {
          giftEffectPlayerRef.value.addToQueue({
            sender_id: lastMessage.sender_id,
            sender_username: lastMessage.sender_username,
            gift: gift,
            count: lastMessage.count,
            total_value: lastMessage.total_value
          })
        }
      }

      // 新消息统一滚动到底部
      await nextTick()
      scrollToBottom()
    }
  }

  lastArrayLength = newLength
})

onMounted(() => {
	// 只在第一次挂载时初始化 lastCheckedMessageId
	if (game.player_chat.data.length > 0) {
		lastCheckedMessageId = game.player_chat.data[game.player_chat.data.length - 1].id
	}
	// 第一次挂载时加载历史并滚动
	nextTick(async () => {
		await loadHistory()
		// 确保滚动到底部
		await nextTick()
		scrollToBottom()
	})
})

// 页面激活时滚动到底部
onActivated( () => {
	nextTick(async() => {
		await loadHistory()
		await nextTick()
		scrollToBottom()
	})
})

onUnmounted(() => {
	// 清理礼物特效队列
	if (giftEffectPlayerRef.value) {
		giftEffectPlayerRef.value.clearQueue()
	}
	// 停止watcher，防止内存泄漏
	if (stopWatcher) {
		stopWatcher()
	}
	console.log('[聊天] 页面已卸载，watcher已停止')
})
</script>

<style scoped>
.message-list {
  scroll-behavior: smooth;
}

.message-container::-webkit-scrollbar {
  width: 6px;
}

.message-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.message-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.message-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.message-item {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-bubble {
  max-width: 100%;
  border-radius: 12px;
}

.message-bubble.my-message {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.message-bubble.other-message {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.gift-message-card {
  animation: giftSlideIn 0.5s ease-out;
}

@keyframes giftSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.gift-icon {
  animation: giftRotate 0.6s ease-in-out;
}

@keyframes giftRotate {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
}

.npc-message-card {
  animation: npcSlideIn 0.5s ease-out;
}

@keyframes npcSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
