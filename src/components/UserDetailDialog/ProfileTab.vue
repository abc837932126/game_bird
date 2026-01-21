<template>
	<el-card shadow="never" class="border border-gray-200">
		<template #header>
			<span class="font-bold">基本资料</span>
		</template>
		<div class="grid grid-cols-2 gap-4">
			<div class="flex items-center justify-between">
				<span class="text-gray-600">玩家ID</span>
				<span class="font-medium">{{ userInfo.player_id || userInfo.id }}</span>
			</div>
			<div class="flex items-center justify-between">
				<span class="text-gray-600">等级</span>
				<span class="font-medium">Lv.{{ userInfo.lv }}</span>
			</div>
			<div class="flex items-center justify-between">
				<span class="text-gray-600">性别</span>
				<span>{{ userInfo.sex === 0 ? '男' : '女' }}</span>
			</div>
			<div class="flex items-center justify-between">
				<span class="text-gray-600">经验</span>
				<span class="font-medium">{{ userInfo.exp || 0 }}</span>
			</div>
			<div class="flex items-center justify-between">
				<span class="text-gray-600">💖 魅力值</span>
				<span class="font-medium">{{ userInfo.charm || 0 }}</span>
			</div>
			<div
				v-for="balance in userInfo.player_balance || []"
				:key="balance.balance_id"
				class="flex items-center justify-between"
			>
				<span class="text-gray-600">{{ getBalanceEmoji(balance.balance_id) }} {{ balance.game_config_player_balance?.nickname || '未知' }}</span>
				<span class="font-medium">{{ balance.count || 0 }}</span>
			</div>
			<div v-if="userInfo.title" class="flex items-center justify-between col-span-2">
				<span class="text-gray-600">称号</span>
				<el-tag type="success">{{ userInfo.title }}</el-tag>
			</div>
			<div class="flex items-center justify-between col-span-2">
				<span class="text-gray-600">当前位置</span>
				<span class="font-medium">{{ mapName }}</span>
			</div>
		</div>
	</el-card>
</template>

<script setup>
import {inject, computed} from 'vue'

const props = defineProps({
	userInfo: {
		type: Object,
		required: true
	},
	isFriend: {
		type: Boolean,
		default: false
	}
})

const game = inject('game')

// 获取地图名称
const mapName = computed(() => {
	if (!props.userInfo?.map_id || !game.game_map.data) return '未知'
	const map = game.game_map.data.find(m => m.id === props.userInfo.map_id)
	return map?.nickname || '未知'
})

// 获取余额表情符号
const getBalanceEmoji = (balanceId) => {
	const emojiMap = {
		1: '💰',
		2: '💎',
		3: '🪙'
	}
	return emojiMap[balanceId] || '💰'
}
</script>
