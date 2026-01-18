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
			<div class="flex items-center justify-between">
				<span class="text-gray-600">💰 {{ get_balance_label('balance_1') }}</span>
				<span class="font-medium">{{ userInfo.balance_1 || 0 }}</span>
			</div>
			<div class="flex items-center justify-between">
				<span class="text-gray-600">💎 {{ get_balance_label('balance_2') }}</span>
				<span class="font-medium">{{ userInfo.balance_2 || 0 }}</span>
			</div>
			<div class="flex items-center justify-between">
				<span class="text-gray-600">🪙 {{ get_balance_label('balance_3') }}</span>
				<span class="font-medium">{{ userInfo.balance_3 || 0 }}</span>
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

// 获取货币标签
const get_balance_label = (key) => {
	const num = key.replace('balance_', '')
	const config = game.game_config.get_value('game','balance_type')
	return config?.[num] || '未知'
}
</script>
