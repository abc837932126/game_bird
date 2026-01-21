<template>
	<div class="p-4">
		<!-- 顶部图片 -->
		<div class="mb-4 rounded-lg overflow-hidden">
			<el-image
				:src="getImageUrl('bg', '我的')"
				fit="cover"
				class="w-full h-38"
				loading="lazy"
			>
				<template #error>
					<div class="h-38 bg-linear-to-r from-pink-400 via-purple-400 to-red-400 flex items-center justify-center">
						<span class="text-8xl">⛪</span>
					</div>
				</template>
			</el-image>
		</div>

		<!-- 主信息卡片 -->
		<el-card class="mb-4">
			<!-- 头部：头像和基本信息 -->
			<div class="flex items-center gap-4 mb-4 pb-4 border-b">
				<PlayerAvatar
					:player-id="game.player.data?.id || 0"
					:sex="game.player.data?.sex || 0"
					:avatar-frame-id="game.player.data?.avatar_frame_id"
					:size="70"
				/>
				<div class="flex-1">
					<div class="text-xl font-bold mb-1">
						<span v-if="playerGuild" class="text-blue-600">[{{ playerGuild.guild_name }}] </span>
						{{ game.player.data?.nickname }}
					</div>
					<div class="flex items-center gap-2">
						<el-tag type="warning" size="small">Lv.{{ game.player.data?.lv || 1 }}</el-tag>
						<el-tag type="info" size="small">{{ game.player.data?.sex === 0 ? '♂ 男' : '♀ 女' }}</el-tag>
						<el-tag type="success" size="small">{{ game.player.data?.game_title?.nickname || '无称号' }}</el-tag>
					</div>
				</div>
				<el-button size="small" @click="openAvatarFrameSelector">更换头像框</el-button>
			</div>

			<!-- 属性进度条 -->
			<div class="mb-4 space-y-3">
				<div>
					<div class="text-sm text-gray-500 mb-1 flex justify-between">
						<span>⚔️ 经验值</span>
						<span class="font-bold text-orange-600">
							{{ game.player.data?.exp.toFixed(2) || 0 }} / {{ game.player.data?.exp_max === Infinity ? 'MAX' : (game.player.data?.exp_max.toFixed(2) || 0) }}
						</span>
					</div>
					<el-progress
						:percentage="game.player.data?.exp_max === Infinity ? 100 : Math.min(100, Number(((game.player.data?.exp || 0) / (game.player.data?.exp_max || 1) * 100).toFixed(2)))"
						:stroke-width="16"
						color="#e6a23c"
					/>
				</div>
				<div>
					<div class="text-sm text-gray-500 mb-1 flex justify-between">
						<span>💪 体力值</span>
						<span class="font-bold text-green-600">{{ game.player.data?.stamina || 0 }} / {{ game.player.data?.max_stamina || 10 }}</span>
					</div>
					<el-progress
						:percentage="(game.player.data?.stamina || 0) / (game.player.data?.max_stamina || 10) * 100"
						:stroke-width="16"
						color="#67c23a"
					/>
				</div>
			</div>

			<!-- 财富资产 -->
			<div class="mb-4 pb-4 border-b">
				<div class="text-sm font-bold text-gray-700 mb-3">💰 财富资产</div>
				<div class="grid grid-cols-3 gap-3">
					<div
						v-for="balance in game.player.data?.player_balance || []"
						:key="balance.id"
						class="text-center rounded p-2"
						:class="getBalanceBgClass(balance.balance_id)"
					>
						<div class="text-2xl mb-1">{{ getBalanceEmoji(balance.balance_id) }}</div>
						<div class="text-lg font-bold" :class="getBalanceTextClass(balance.balance_id)">
							{{ balance.count || 0 }}
						</div>
						<div class="text-xs text-gray-500">{{ balance.game_config_player_balance?.nickname || '未知' }}</div>
					</div>
				</div>
			</div>

			<!-- 礼物价值兑换 -->
			<div v-if="game.player.data?.gift_value_unconverted > 0">
				<div class="text-sm font-bold text-gray-700 mb-3">🎁 礼物价值</div>
				<div class="bg-pink-50 rounded p-3">
					<div class="flex items-center justify-between mb-2">
						<div>
							<div class="text-sm text-gray-600">未兑换礼物价值</div>
							<div class="text-2xl font-bold text-pink-600">{{ game.player.data?.gift_value_unconverted || 0 }}</div>
						</div>
						<div class="text-right">
							<div class="text-sm text-gray-600">可兑换为</div>
							<div class="text-xl font-bold text-purple-600">{{ convertibleAmount }} 星币</div>
							<div class="text-xs text-gray-500">(60%兑换率)</div>
						</div>
					</div>
					<el-button
						type="primary"
						size="small"
						class="w-full"
						:loading="converting"
						@click="handleConvertGiftValue"
					>
						兑换为星币
					</el-button>
				</div>
			</div>
		</el-card>

		<!-- 头像框选择器 -->
		<AvatarFrameSelector ref="avatarFrameSelectorRef" />
	</div>
</template>

<script setup>
import { inject, computed, onMounted, ref ,onActivated} from 'vue'
import { getImageUrl } from '@/config/oss'
import { ElMessage } from 'element-plus'
import PlayerAvatar from '@/components/common/PlayerAvatar.vue'
import AvatarFrameSelector from '@/components/common/AvatarFrameSelector.vue'

const game = inject('game')
const avatarFrameSelectorRef = ref(null)
const playerGuild = ref(null)
const converting = ref(false)

// 计算可兑换金额（60%）
const convertibleAmount = computed(() => {
	return Math.floor((game.player.data?.gift_value_unconverted || 0) * 0.6)
})

onMounted(async () => {
	await game.player.update()
	await loadPlayerGuild()
})

onActivated(async () => {
  await game.player.update()
  await loadPlayerGuild()
})

// 加载玩家工会信息
const loadPlayerGuild = async () => {
	try {
		const res = await game.guild.api.get_player_guild(game.player.data?.id)
		if (res.code === 200 && res.data) {
			playerGuild.value = res.data
		}
	} catch (error) {
		console.error('加载工会信息失败:', error)
	}
}

// 打开头像框选择器
const openAvatarFrameSelector = () => {
	avatarFrameSelectorRef.value?.open(game.player.data?.avatar_frame_id)
}

// 获取余额表情符号
const getBalanceEmoji = (balanceId) => {
	const emojiMap = {
		1: '💰',
		2: '💎',
		3: '🪙'
	}
	return emojiMap[balanceId] || '💰'
}

// 获取余额背景样式
const getBalanceBgClass = (balanceId) => {
	const bgMap = {
		1: 'bg-yellow-50',
		2: 'bg-blue-50',
		3: 'bg-purple-50'
	}
	return bgMap[balanceId] || 'bg-gray-50'
}

// 获取余额文字颜色
const getBalanceTextClass = (balanceId) => {
	const colorMap = {
		1: 'text-yellow-600',
		2: 'text-blue-600',
		3: 'text-purple-600'
	}
	return colorMap[balanceId] || 'text-gray-600'
}

// 兑换礼物价值
const handleConvertGiftValue = async () => {
	if (converting.value) return

	try {
		converting.value = true
		const res = await game.player.api.convert_gift_value()
		if (res.code === 200) {
			ElMessage.success(`成功兑换 ${convertibleAmount.value} 星币`)
			await game.player.update()
		} else {
			ElMessage.error(res.msg || '兑换失败')
		}
	} catch (error) {
		console.error('兑换失败:', error)
		ElMessage.error('兑换失败')
	} finally {
		converting.value = false
	}
}
</script>

<style scoped>
</style>
