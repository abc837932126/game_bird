<template>
	<div class="grid grid-cols-5 gap-4">
		<el-card
			v-for="item in items"
			:key="item.id"
			@click="showDialog(item)"
			class="cursor-pointer hover:shadow-lg transition-shadow relative"
			:body-style="{ padding: 0 }"
		>
			<!-- 图片占位区域 -->
			<div class="bg-green-300 w-full aspect-square mb-2 flex items-center justify-center overflow-hidden">
				<img
					:src="getImageUrl('bird_exp', item.game_item_bird_exp?.nickname || 'default')"
					:alt="item.game_item_bird_exp?.nickname"
					class="w-full h-full object-cover"
					@error="handleImageError"
				>
			</div>

			<div class="grow text-sm p-2 min-w-0">
				<p class="text-orange-500 font-bold truncate">
					{{ item.game_item_bird_exp?.nickname || '未知物品' }}
				</p>

				<div class="text-xs text-gray-400 mt-1">
					数量: {{ item.count }}
				</div>

				<!-- 显示经验值 -->
				<div class="text-xs text-blue-500 mt-1 truncate">
					经验值: {{ item.game_item_bird_exp?.exp || 0 }}
				</div>
			</div>
		</el-card>
	</div>

	<div v-if="items.length === 0" class="text-center text-gray-400 py-4">
		暂无物品
	</div>

	<!-- 内置弹窗 -->
	<el-dialog v-model="dialogVisible" class="p-0!" width="90%" :show-close="false" header-class="p-0!">
		<el-image :src="getImageUrl('bird_exp', currentItem?.game_item_bird_exp?.nickname, '_big')" fit="cover" loading="lazy">
			<template #placeholder>
				<div class="flex-cc w-full h-full bg-[#f5f7fa]">
					<ElIcon>
						<Picture/>
					</ElIcon>
				</div>
			</template>
		</el-image>

		<div class="flex flex-col p-4! gap-2!">
			<div class="mb-3 text-base">{{ currentItem?.game_item_bird_exp?.nickname }}</div>
			<div class="text-gray-500 text-sm">{{ currentItem?.game_item_bird_exp?.desc }}</div>

			<div class="text-lg font-bold text-green-600">
				拥有数量: {{ currentItem?.count || 0 }}
			</div>

			<!-- 经验卡片特有：显示经验值 -->
			<div v-if="currentItem?.game_item_bird_exp?.exp" class="mt-2 bg-blue-50 p-3 rounded">
				<div class="text-sm font-bold text-blue-600 mb-1">经验值：</div>
				<div class="text-2xl font-bold text-blue-800">
					+{{ currentItem.game_item_bird_exp.exp }} EXP
				</div>
			</div>

			<div class="flex justify-between mt-4">
				<el-button type="primary" @click="dialogVisible = false">关闭</el-button>
				<el-button type="success" @click="showBirdSelection">选择鸟使用</el-button>
			</div>
		</div>
	</el-dialog>

	<!-- 选择鸟的对话框 -->
	<el-dialog v-model="birdSelectionVisible" title="选择要使用经验卡的鸟" width="90%">
		<!-- 数量选择器 -->
		<div class="mb-4 bg-blue-50 p-4 rounded">
			<div class="flex items-center justify-between gap-4">
				<div class="flex-1">
					<div class="text-sm font-bold text-blue-600 mb-2">使用数量：</div>
					<div class="text-xs text-gray-500">拥有: {{ currentItem?.count || 0 }} 个</div>
				</div>
				<div class="flex items-center gap-2">
					<el-input-number
						v-model="useCount"
						:min="1"
						:max="currentItem?.count || 1"
						size="large"
						style="width: 150px"
					/>
					<el-button size="large" @click="useCount = currentItem?.count || 1">全部</el-button>
				</div>
			</div>
			<div class="mt-3 text-sm text-blue-600">
				总经验值: <span class="font-bold text-lg">+{{ (currentItem?.game_item_bird_exp?.exp || 0) * useCount }} EXP</span>
			</div>
		</div>

		<!-- 使用 BirdSelector 组件 -->
		<BirdSelector
			v-model="showBirdSelector"
			title=""
			:auto-load="false"
			@select="useExpCard"
		/>
	</el-dialog>
</template>

<script setup>
import { inject, ref, computed, watch, onUnmounted } from "vue"
import { ElButton, ElDialog, ElIcon, ElCard, ElTag, ElInputNumber } from 'element-plus'
import { message } from '@/game/notification-center'
import { Picture } from "@element-plus/icons-vue"
import {getImageUrl} from '@/config/oss'
import BirdSelector from '../common/BirdSelector.vue'

const game = inject('game')

const props = defineProps({
	items: {
		type: Array,
		default: () => []
	}
})

const dialogVisible = ref(false)
const currentItem = ref(null)
const birdSelectionVisible = ref(false)
const showBirdSelector = ref(false)
const useCount = ref(1)

// 监听 birdSelectionVisible，同步到 showBirdSelector
const stopWatcher1 = watch(birdSelectionVisible, (newVal) => {
	showBirdSelector.value = newVal
	if (newVal) {
		// 打开时加载鸟列表
		game.player_bird.update()
	}
})

// 监听 showBirdSelector 关闭，同步关闭外层对话框
const stopWatcher2 = watch(showBirdSelector, (newVal) => {
	if (!newVal) {
		birdSelectionVisible.value = false
	}
})

onUnmounted(() => {
	if (stopWatcher1) {
		stopWatcher1()
	}
	if (stopWatcher2) {
		stopWatcher2()
	}
})

const showDialog = (item) => {
	currentItem.value = item
	dialogVisible.value = true
}

const showBirdSelection = () => {
	// 初始化使用数量为1
	useCount.value = 1
	dialogVisible.value = false
	birdSelectionVisible.value = true
}

// 使用经验卡
const useExpCard = async (bird) => {
	if (!currentItem.value) return

	// 验证数量
	if (useCount.value < 1 || useCount.value > (currentItem.value.count || 0)) {
		message.error('使用数量无效')
		return
	}

	try {
		const response = await game.player_bird.useExpCard(
			bird.id,
			currentItem.value.game_item_bird_exp_id,
			useCount.value
		)

		if (response.code === 200) {
			message.success(response.data.message || '使用成功')
			// 更新经验卡数据
			await game.player_item_bird_exp.update()
			// 关闭对话框
			birdSelectionVisible.value = false
			// 如果还有剩余数量，更新 currentItem
			if (currentItem.value.count > useCount.value) {
				currentItem.value.count -= useCount.value
			} else {
				// 用完了，清空 currentItem
				currentItem.value = null
			}
		} else {
			message.error(response.message || '使用失败')
		}
	} catch (error) {
		message.error('使用失败: ' + error.message)
	}
}

// 处理图片加载失败的情况
const handleImageError = (event) => {
	event.target.style.display = 'none'
	const parent = event.target.parentNode
	if (parent) {
		parent.innerHTML = '<span class="text-gray-500">物品图片</span>'
	}
}
</script>

<style scoped>
</style>
