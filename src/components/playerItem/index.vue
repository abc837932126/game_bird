<template>
	<div class="player-item-container">
		<!-- 顶部图片 -->
		<div class="player-item-header mb-4 rounded-lg overflow-hidden">
			<el-image :src="getImageUrl('bg', '背包')" fit="cover" class="w-full h-38" loading="lazy">
				<template #error>
					<div class="h-38 bg-linear-to-r from-pink-400 via-purple-400 to-red-400
						flex items-center justify-center">
						<span class="text-8xl">🎒</span>
					</div>
				</template>
			</el-image>
		</div>

		<!-- 自定义 Tab -->
		<div class="custom-tabs">
			<!-- Tab 按钮 Grid 布局 -->
			<div class="tabs-header">
				<button
					v-for="tab in tabs"
					:key="tab.name"
					:class="['tab-button', { active: activeTab === tab.name }]"
					@click="activeTab = tab.name"
				>
					{{ tab.label }}
				</button>
			</div>

			<!-- Tab 内容 -->
			<div class="tabs-content">
				<BaitList v-if="activeTab === 'bait'" :items="baitList" />
				<CommonList v-else-if="activeTab === 'common'" :items="commonList" />
				<BuffList v-else-if="activeTab === 'buff'" :items="buffList" />
				<TrapList v-else-if="activeTab === 'trap'" :items="trapList" />
				<BirdExpList v-else-if="activeTab === 'bird_exp'" :items="birdExpList" />
				<TrainList v-else-if="activeTab === 'train'" :items="trainList" />
				<RingList v-else-if="activeTab === 'ring'" :items="ringList" />
				<NestList v-else-if="activeTab === 'nest'" :items="nestList" />
			</div>
		</div>
	</div>
</template>

<script setup>
import { inject, ref, computed, onMounted } from 'vue'
import BaitList from './PlayerBaitList.vue'
import CommonList from './PlayerCommonList.vue'
import BuffList from './PlayerBuffList.vue'
import TrapList from './PlayerTrapList.vue'
import BirdExpList from './PlayerBirdExpList.vue'
import TrainList from './PlayerTrainList.vue'
import RingList from './PlayerRingList.vue'
import NestList from './PlayerNestList.vue'
import {getImageUrl} from '@/config/oss'

const game = inject('game')
const activeTab = ref('bait')

// Tab 配置
const tabs = [
	{ name: 'bait', label: '饵料' },
	{ name: 'common', label: '通用道具' },
	{ name: 'buff', label: '加成道具' },
	{ name: 'trap', label: '陷阱' },
	{ name: 'bird_exp', label: '经验卡片' },
	{ name: 'train', label: '训练场' },
	{ name: 'ring', label: '戒指' },
	{ name: 'nest', label: '鸟窝' }
]

// 饵料列表
const baitList = computed(() => {
	if (!game.player_item_bait?.data) return []
	return game.player_item_bait.data.filter(item => item.count > 0)
})

// 通用道具列表
const commonList = computed(() => {
	if (!game.player_item_common?.data) return []
	return game.player_item_common.data.filter(item => item.count > 0)
})

// 加成道具列表（合并三种加成道具）
const buffList = computed(() => {
	const trapBuffs = (game.player_item_trap_buff?.data || [])
		.filter(item => item.count > 0)
		.map(item => ({ ...item, _type: 'trap' }))

	const nestBuffs = (game.player_item_nest_buff?.data || [])
		.filter(item => item.count > 0)
		.map(item => ({ ...item, _type: 'nest' }))

	const trainBuffs = (game.player_item_train_buff?.data || [])
		.filter(item => item.count > 0)
		.map(item => ({ ...item, _type: 'train' }))

	return [...trapBuffs, ...nestBuffs, ...trainBuffs]
})

// 陷阱列表
const trapList = computed(() => {
	if (!game.player_item_trap?.data) return []
	return game.player_item_trap.data.filter(item => item.count > 0)
})

// 经验卡片列表
const birdExpList = computed(() => {
	if (!game.player_item_bird_exp?.data) return []
	return game.player_item_bird_exp.data.filter(item => item.count > 0)
})

// 训练场列表
const trainList = computed(() => {
	if (!game.player_item_train?.data) return []
	return game.player_item_train.data.filter(item => item.count > 0)
})

// 戒指列表
const ringList = computed(() => {
	if (!game.player_item_ring?.data) return []
	return game.player_item_ring.data.filter(item => item.count > 0)
})

// 鸟窝列表
const nestList = computed(() => {
	if (!game.player_item_nest?.data) return []
	return game.player_item_nest.data.filter(item => item.count > 0)
})

// 加载玩家物品数据
onMounted(async () => {
	await game.player_item_bait.update()
	await game.player_item_common.update()
	await game.player_item_trap_buff.update()
	await game.player_item_nest_buff.update()
	await game.player_item_train_buff.update()
	await game.player_item_trap.update()
	await game.player_item_bird_exp.update()
	await game.player_item_train.update()
	await game.player_item_ring.update()
	await game.player_item_nest.update()
	await game.player_bird.update()
})
</script>

<style scoped>
.player-item-container {
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: hidden;
}

.player-item-header {
	flex-shrink: 0;
}

.custom-tabs {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	border: 1px solid #dcdfe6;
	border-radius: 4px;
	background: white;
}

.tabs-header {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 0;
	border-bottom: 1px solid #dcdfe6;
	background: #f5f7fa;
	padding: 4px;
}

.tab-button {
	padding: 10px 16px;
	border: none;
	background: transparent;
	cursor: pointer;
	color: #606266;
	font-size: 14px;
	transition: all 0.3s;
	border-radius: 4px;
	white-space: nowrap;
	text-align: center;
}

.tab-button:hover {
	color: #409eff;
	background: rgba(64, 158, 255, 0.1);
}

.tab-button.active {
	color: #409eff;
	background: white;
	font-weight: bold;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tabs-content {
	flex: 1;
	overflow-y: auto;
	padding: 16px;
}
</style>
