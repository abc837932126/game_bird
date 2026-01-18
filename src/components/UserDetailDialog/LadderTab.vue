<template>
	<el-card shadow="never" class="border border-gray-200">
		<template #header>
			<div class="flex items-center gap-2">
				<span class="text-lg">🏆</span>
				<span class="font-bold">天梯阵容</span>
			</div>
		</template>
		<div v-if="lineup && lineup.length > 0" class="birds-info-container">
			<div
					v-for="(bird, index) in lineup"
					:key="index"
					class="bird-info-card"
			>
				<el-avatar
						:size="45"
						:src="getImageUrl('bird', bird.game_bird?.nickname)"
						class="bird-avatar mb-1"
				>
					<div class="text-4xl">🐦</div>
				</el-avatar>
				<div class="bird-name">
					{{ bird.game_bird?.nickname || '未知' }}
					<span class="bird-level">Lv.{{ bird.lv }}</span>
				</div>
				<div class="bird-stats">
					<span class="stat-item weight">
						⚖️ {{ bird.weight?.toFixed(2) }}kg
					</span>
				</div>
				<el-tag :type="getQualityType(bird)" size="small" class="mt-2">{{ getQuality(bird) }}</el-tag>
			</div>
		</div>
		<div v-else class="text-center py-4 text-gray-400">
			<div class="text-4xl mb-2">📭</div>
			<p>暂未设置天梯阵容</p>
		</div>
	</el-card>
</template>

<script setup>
import {getImageUrl} from '@/config/oss'

const props = defineProps({
	lineup: {
		type: Array,
		default: () => []
	}
})

// 根据体重判断品质
const getQuality = (bird) => {
	if (!bird?.weight || !bird?.game_bird) return '普通'

	const weight = bird.weight
	const {weight_min, weight_max, weight_super} = bird.game_bird

	if (weight_super && weight >= weight_super) return '超级'
	if (weight >= weight_max) return '极品'
	if (weight >= weight_min) return '优质'
	return '普通'
}

const getQualityType = (bird) => {
	const quality = getQuality(bird)
	const typeMap = {
		'超级': 'danger',
		'极品': 'warning',
		'优质': 'success',
		'普通': 'info'
	}
	return typeMap[quality] || 'info'
}
</script>

<style scoped>
/* 战斗样式的阵容展示区域 */
.birds-info-container {
	display: flex;
	flex-direction: row;
	gap: 8px;
	padding: 10px;
	background: #f8fafc;
	border-radius: 8px;
}

.bird-info-card {
	background: white;
	border-radius: 8px;
	padding: 6px;
	text-align: center;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	transition: all 0.3s;
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;
	min-width: 0;
}

.bird-avatar {
	border: 2px solid #e5e7eb;
	transition: all 0.3s;
}

.bird-name {
	font-size: 11px;
	font-weight: bold;
	color: #1e293b;
	margin-bottom: 4px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	width: 100%;
}

.bird-level {
	font-size: 10px;
	font-weight: normal;
	color: #64748b;
	margin-left: 4px;
}

.bird-stats {
	display: flex;
	flex-direction: column;
	gap: 2px;
	font-size: 10px;
	color: #64748b;
}

.stat-item {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 4px;
}

.stat-item.weight {
	font-weight: bold;
	color: #f59e0b;
}
</style>
