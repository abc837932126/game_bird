<template>
	<el-dialog v-model="vis" title="天梯阵容" width="90%" :show-close="true">
		<!-- 阵容展示区域（战斗样式） -->
		<div class="birds-info-container my-birds">
			<div
				class="bird-info-card"
				v-for="(slotKey, index) in ['slot1', 'slot2', 'slot3']"
				:key="slotKey"
				@click="openBirdSelector(index + 1)"
			>
				<!-- 已选择的鸟 -->
				<template v-if="lineup[slotKey]">
					<el-avatar
						:size="45"
						:src="getImageUrl('bird', lineup[slotKey].nickname)"
						class="bird-avatar mb-1"
					>
						<div class="text-4xl">🐦</div>
					</el-avatar>
					<div class="bird-name">
						{{ lineup[slotKey].nickname }}
						<span class="bird-level">Lv.{{ lineup[slotKey].lv }}</span>
					</div>
					<div class="bird-stats">
						<span class="stat-item weight">
							⚖️ {{ lineup[slotKey].weight.toFixed(2) }}kg
						</span>
					</div>
					<div class="text-xs text-purple-600 mt-2">点击更换</div>
				</template>

				<!-- 空位置 -->
				<template v-else>
					<div class="empty-slot-content">
						<div class="empty-slot-icon">📍</div>
						<div class="empty-slot-label">位置 {{ index + 1 }}</div>
						<div class="empty-slot-hint">点击选择鸟</div>
					</div>
				</template>
			</div>
		</div>

		<template #footer>
			<el-button @click="vis = false">关闭</el-button>
		</template>
	</el-dialog>

	<!-- 选择鸟对话框 -->
	<BirdSelector
		v-model="showBirdSelector"
		:title="`为位置 ${selectedSlot} 选择一只鸟`"
		:exclude-ids="lineupBirdIds"
		@select="confirmSetBird"
	/>
</template>

<script setup>
import { ref, inject, computed } from 'vue'
import { message } from '@/game/notification-center'
import {getImageUrl} from '@/config/oss'
import BirdSelector from '../common/BirdSelector.vue'

const game = inject('game')
const vis = ref(false)
const loading = ref(false)
const showBirdSelector = ref(false)
const selectedSlot = ref(null)

// 阵容数据
const lineup = computed(() => game.player_ladder_lineup.data.lineup)

// 获取已在阵容中的鸟ID列表
const lineupBirdIds = computed(() => {
	const ids = []
	if (lineup.value.slot1) ids.push(lineup.value.slot1.player_bird_id)
	if (lineup.value.slot2) ids.push(lineup.value.slot2.player_bird_id)
	if (lineup.value.slot3) ids.push(lineup.value.slot3.player_bird_id)
	return ids
})

// 打开对话框
const show = async () => {
	vis.value = true
	loading.value = true

	try {
		// 加载阵容数据
		await game.player_ladder_lineup.getLineup()
		// 加载鸟列表

	} catch (error) {
		console.error('加载数据失败:', error)
		message.error('加载数据失败')
	} finally {
		loading.value = false
	}
}

// 打开鸟选择器
const openBirdSelector = async (slot) => {
	await game.player_bird.update()
	selectedSlot.value = slot
	showBirdSelector.value = true
}

// 确认设置鸟到指定位置
const confirmSetBird = async (bird) => {
	if (!selectedSlot.value) return

	showBirdSelector.value = false

	try {
		const res = await game.player_ladder_lineup.setLineup(selectedSlot.value, bird.id)

		if (res.code === 200) {
			message.success('设置成功')
		} else {
			message.error(res.msg || '设置失败')
		}
	} catch (error) {
		console.error('设置阵容失败:', error)
		message.error('设置失败')
	} finally {
		selectedSlot.value = null
	}
}

defineExpose({
	show
})
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

.my-birds {
	border: 2px solid #3b82f6;
}

.bird-info-card {
	background: white;
	border-radius: 8px;
	padding: 8px;
	text-align: center;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	transition: all 0.3s;
	display: flex;
	flex-direction: column;
	align-items: center;
	cursor: pointer;
	flex: 1;
	min-width: 0;
}

.bird-info-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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

.empty-slot-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 20px 0;
}

.empty-slot-icon {
	font-size: 48px;
	margin-bottom: 8px;
	opacity: 0.3;
}

.empty-slot-label {
	color: #9ca3af;
	font-size: 14px;
	margin-bottom: 4px;
}

.empty-slot-hint {
	color: #3b82f6;
	font-size: 12px;
}
</style>
