<template>
	<!-- 情侣信息 -->
	<el-card v-if="marriageInfo" shadow="never" class="border border-gray-200 mb-4" :body-style="{ padding: '0' }">
		<div>
			<!-- 情侣信息标题 -->
		<div class="flex justify-center mt-2 mb-4">
				<span class="font-bold text-sm text-gray-700">情侣信息</span>
			</div>

			<div class="px-4 pb-4 space-y-3">
				<!-- 情侣头像和信息 -->
				<div class="flex justify-center items-center gap-4">
					<!-- 用户头像 -->
					<div class="flex flex-col items-center">
						<PlayerAvatar
							:player-id="userInfo.player_id || userInfo.id"
							:sex="userInfo.sex"
							:avatar-frame-id="userInfo.avatar_frame_id"
							:size="60"
						/>
						<div class="text-xs mt-1">{{ userInfo.nickname }}</div>
					</div>

					<!-- 爱心图标 -->
					<div class="text-3xl">💖</div>

					<!-- 配偶头像 -->
					<div class="flex flex-col items-center">
						<PlayerAvatar
							:player-id="marriageInfo.spouse_id"
							:sex="marriageInfo.spouse_sex"
							:avatar-frame-id="marriageInfo.spouse_avatar_frame_id"
							:size="60"
						/>
						<div class="text-xs mt-1">{{ marriageInfo.spouse_nickname }}</div>
					</div>
				</div>

				<!-- 戒指信息 -->
				<div v-if="marriageInfo.ring_name" class="bg-purple-50 p-3 rounded text-center">
					<div class="text-xs font-bold text-purple-600 mb-1">💍 婚戒</div>
					<div class="text-sm text-purple-800">{{ marriageInfo.ring_name }}</div>
				</div>

				<!-- 结婚时间 -->
				<div v-if="marriageInfo.wedding_time" class="text-center text-xs text-gray-500">
					结婚时间: {{ formatDate(marriageInfo.wedding_time) }}
				</div>
			</div>
		</div>
	</el-card>

	<el-card v-if="friendNest && isFriend" shadow="never" class="border border-gray-200" :body-style="{ padding: '0' }">
		<div>
			<!-- 配对详情标题 -->
			<div class="flex justify-center mt-2 mb-4">
				<span class="font-bold text-sm text-gray-700">配对详情</span>
			</div>

			<div class="px-4 pb-4 space-y-4">
				<!-- 配对状态 -->
				<div v-if="friendNest.is_pairing" class="bg-pink-50 p-3 rounded flex justify-center">
					<el-countdown
						:value="getPairingDeadline(friendNest.time_remaining)"
						format="HH:mm:ss"
						:value-style="{ fontSize: '16px', color: '#ec4899', fontWeight: 'bold' }"
					/>
				</div>

				<!-- 鸟槽位 -->
				<div class="flex justify-center items-center gap-4 mb-3">
					<!-- 位置1 (好友的鸟) -->
					<div class="flex flex-col items-center">
						<el-avatar
								v-if="friendNest.player_bird_1"
								:size="70"
								:src="getImageUrl('bird', friendNest.player_bird_1.game_bird?.nickname)"
								class="border-2 border-blue-400"
						/>
						<el-avatar
								v-else
								:size="70"
								class="border-2 border-gray-300 bg-gray-50"
						>
							<span class="text-3xl text-gray-400">📭</span>
						</el-avatar>
						<div class="text-xs mt-1" v-if="friendNest.player_bird_1">
							{{ friendNest.player_bird_1.game_bird?.nickname }} {{ friendNest.player_bird_1.sex === 0 ? '♂' : '♀' }} {{ friendNest.player_bird_1.weight.toFixed(2) }}kg
						</div>
						<div class="text-xs mt-1" v-if="friendNest.player_bird_1">
							Lv.{{ friendNest.player_bird_1.lv }}
						</div>
						<div class="text-xs mt-1 text-gray-400" v-else>位置1</div>
					</div>

					<!-- 爱心图标 -->
					<div class="text-3xl" v-if="friendNest.is_pairing">💕</div>
					<div class="text-3xl text-gray-300" v-else>💙</div>

					<!-- 位置2   -->
					<div class="flex flex-col items-center cursor-pointer"
					     @click="!friendNest.is_pairing && handleSetMyBird()">
						<div class="relative" :class="{
							'opacity-50 cursor-not-allowed': friendNest.is_pairing
						}">
							<el-avatar
									v-if="friendNest.player_bird_2"
									:size="70"
									:src="getImageUrl('bird', friendNest.player_bird_2.game_bird?.nickname)"
									class="border-2 border-pink-400"
							/>
							<el-avatar
									v-else
									:size="70"
									class="border-2 border-gray-300 bg-gray-50"
							>
								<span class="text-3xl text-gray-400">➕</span>
							</el-avatar>
						</div>
						<div class="text-xs mt-1" v-if="friendNest.player_bird_2">
							{{ friendNest.player_bird_2.game_bird?.nickname }} {{ friendNest.player_bird_2.sex === 0 ? '♂' : '♀' }} {{ friendNest.player_bird_2.weight.toFixed(2) }}kg
						</div>
						<div class="text-xs mt-1" v-if="friendNest.player_bird_2">
							Lv.{{ friendNest.player_bird_2.lv }}
						</div>
						<!-- 如果是我的鸟，显示标记 -->
						<el-tag
								v-if="friendNest.player_bird_2 && friendNest.player_bird_2.player_id === game.player.data?.id"
								type="success" size="small" class="mt-1">
							我的鸟
						</el-tag>
						<div class="text-xs mt-1 text-gray-400" v-if="!friendNest.player_bird_2">位置2</div>
					</div>
				</div>

				<!-- 巢穴道具信息 -->
				<div v-if="friendNest.game_item_nest" class="bg-amber-50 p-3 rounded">
					<div class="text-xs font-bold text-amber-600 mb-1">使用的巢穴道具：</div>
					<div class="text-sm text-amber-800">{{ friendNest.game_item_nest.nickname }}</div>
				</div>
			</div>
		</div>
	</el-card>

	<!-- 训练场信息 -->
	<el-card v-if="friendTrains && friendTrains.length > 0" shadow="never" class="border border-gray-200 mt-4" :body-style="{ padding: '0' }">
		<div>
			<!-- 训练场标题 -->
			<div class="flex justify-center mt-2 mb-4">
				<span class="font-bold text-sm text-gray-700">训练场</span>
			</div>

			<div class="px-4 pb-4 space-y-3">
				<div v-for="train in friendTrains" :key="train.id" class=" p-3! rounded">
					<div class="mb-2">
						<span class="text-sm font-bold text-blue-600">{{ train.nickname }}</span>
					</div>

					<div v-if="train.player_bird" class="flex items-center gap-3">
						<!-- 左：鸟信息 -->
						<div class="flex items-center gap-2 flex-shrink-0">
							<el-avatar :size="50" :src="getImageUrl('bird', train.player_bird.game_bird?.nickname)" />
							<div class="text-xs">
								<div class="font-bold">{{ train.player_bird.game_bird?.nickname }}</div>
								<div class="text-gray-500">Lv.{{ train.player_bird.lv }}</div>
								<div class="text-gray-500">{{ train.player_bird.weight.toFixed(2) }}kg</div>
							</div>
						</div>

						<!-- 中：倒计时 -->
						<div class="flex-1 p-2 rounded text-center">
							<div class="text-xs text-gray-500 mb-1">训练时间</div>
							<el-countdown
								:value="getTrainingDeadline(train)"
								format="HH:mm:ss"
								:value-style="{ fontSize: '16px', color: '#2563eb', fontWeight: 'bold' }"
							/>
						</div>

						<!-- 右：可偷取标签和按钮 -->
						<div class="flex-shrink-0 flex flex-col items-center gap-2" style="width: 100px;">
							<el-tag v-if="canSteal(train)" type="danger" size="small">可偷取</el-tag>
							<el-button
								v-if="canSteal(train)"
								type="danger"
								size="small"
								:loading="stealLoading"
								@click="handleSteal(train)"
								class="w-full"
							>
								偷取
							</el-button>
							<div v-else class="text-xs text-center text-gray-400 px-1">
								{{ getStealTip(train) }}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</el-card>

  <!-- 选择鸟对话框 -->
  <BirdSelector
      v-model="showBirdSelector"
      :title="`选择配对的鸟（与 ${friendNest?.player_bird_1?.game_bird?.nickname} 配对）`"
      :filter="birdFilter"
      :filter-fields="['has_paired', 'status']"
      :show-filtered-count="true"
      @select="handleBirdSelect"
  />

</template>

<script setup>
import {ref, inject} from 'vue'
import { message } from '@/game/notification-center'
import {getImageUrl} from '@/config/oss'
import BirdSelector from '../common/BirdSelector.vue'
import PlayerAvatar from '../common/PlayerAvatar.vue'

const props = defineProps({
	friendNest: {
		type: Object,
		default: null
	},
	friendTrains: {
		type: Array,
		default: () => []
	},
	userInfo: {
		type: Object,
		required: true
	},
	marriageInfo: {
		type: Object,
		default: null
	},
	isFriend: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['refresh'])

const game = inject('game')
const showBirdSelector = ref(false)
const stealLoading = ref(false)

// 计算训练结束的目标时间戳（毫秒）
const getTrainingDeadline = (train) => {
	if (!train.start_time) return Date.now()
	const startTime = Number(train.start_time) * 1000
	const maxTrainTime = 4 * 60 * 60 * 1000 // 4小时
	return startTime + maxTrainTime
}

// 计算训练已经过去的分钟数
const getTrainingMinutes = (train) => {
	if (!train.start_time) return 0
	const startTime = Number(train.start_time)
	const currentTime = Math.floor(Date.now() / 1000)
	return Math.floor((currentTime - startTime) / 60)
}

// 判断是否可以偷取
const canSteal = (train) => {
	if (!train.player_bird || !train.start_time) return false
	const minutes = getTrainingMinutes(train)
	return minutes >= 240 // 训练时间满了（4小时）
}

// 获取偷取提示
const getStealTip = (train) => {
	if (!train.player_bird || !train.start_time) return '未开始训练'
	const minutes = getTrainingMinutes(train)
	if (minutes < 240) {
		const remaining = 240 - minutes
		return `还需 ${remaining} 分钟才能偷取`
	}
	return '今天已偷取过'
}

// 处理偷取
const handleSteal = async (train) => {
	try {
		stealLoading.value = true
		const targetId = props.userInfo.player_id || props.userInfo.id
		const response = await game.player_train.steal_reward(targetId, train.id)

		if (response.code === 200) {
			message.success(`偷取成功！获得 ${response.data.stolenCards} 张卡片`)
			emit('refresh')
		} else {
			message.error(response.msg || '偷取失败')
		}
	} catch (error) {
		console.error('偷取失败:', error)
		message.error('偷取失败')
	} finally {
		stealLoading.value = false
	}
}



// 格式化日期
const formatDate = (timestamp) => {
	if (!timestamp) return ''
	const date = new Date(Number(timestamp) * 1000)
	return date.toLocaleString('zh-CN', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	})
}

// 计算配对结束的目标时间戳（毫秒）
const getPairingDeadline = (remainingSeconds) => {
	if (!remainingSeconds || remainingSeconds <= 0) {
		return Date.now()
	}
	return Date.now() + remainingSeconds * 1000
}

// 过滤鸟：只显示与好友的鸟同物种且性别相反的鸟
const birdFilter = (bird) => {
	if (!props.friendNest || !props.friendNest.player_bird_1) return false
	// 必须是同物种
	if (bird.game_bird_id !== props.friendNest.player_bird_1.game_bird_id) return false
	// 必须是相反性别
	return bird.sex !== props.friendNest.player_bird_1.sex
}

// 打开鸟选择器
const handleSetMyBird = () => {
	if (!props.friendNest || !props.friendNest.player_bird_1) {
		message.warning('好友还没有放置鸟')
		return
	}
	showBirdSelector.value = true
}

// 处理鸟选择
const handleBirdSelect = async (bird) => {
	if (!bird) return

	try {
		// 获取好友ID
		const friendPlayerId = props.userInfo.player_id || props.userInfo.id
		// 在好友的鸟巢位置2设置自己的鸟
		const response = await game.player_nest.set_bird(2, bird.id, friendPlayerId)
		if (response.code === 200) {
			message.success('设置成功')
			// 通知父组件刷新
			emit('refresh')
		} else {
			message.error(response.msg || '设置失败')
		}
	} catch (error) {
		console.error('设置鸟失败:', error)
		message.error('设置失败')
	}
}
</script>

<style scoped>
</style>
