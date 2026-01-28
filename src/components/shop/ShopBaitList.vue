<template>
	<div class="grid grid-cols-4 gap-2">
		<el-card
			v-for="item in items"
			:key="item.id"
			bodyClass="p-0!"
			@click="showDialog(item)"
			class="cursor-pointer hover:shadow-lg transition-shadow"
		>
			<!-- 图片占位区域 -->
			<div class="bg-blue-300 w-full aspect-square mb-2 flex items-center justify-center overflow-hidden">
				<img
					:src="getImageUrl('bait', item.nickname || 'default')"
					:alt="item.nickname"
					class="w-full h-full object-cover"
					@error="handleImageError"
				>
			</div>

			<div class="grow text-sm p-2">
				<p class="text-orange-500 font-bold">
					{{ item?.nickname || '未知物品' }}
				</p>

				<!-- 显示价格 -->
				<p class="text-orange-500">
					{{ item?.price || 0 }} {{ item?.game_config_player_balance?.nickname || '未知货币' }}
				</p>

				<div class="text-xs text-gray-400">
					等级要求: {{ item?.lv || 0 }}
				</div>

				<!-- 显示地图限制 -->
				<div v-if="item?.game_map" class="text-xs text-blue-500">
					地图: {{ item.game_map.nickname }}
				</div>

				<!-- 显示可吸引的鸟类 -->
				<div v-if="item.game_item_bait_bird?.length" class="text-xs text-green-500 mt-1">
					可吸引: {{ item.game_item_bait_bird.map(b => b.game_bird?.nickname).join(', ') }}
				</div>
			</div>
		</el-card>
	</div>

	<div v-if="items.length === 0" class="text-center text-gray-400 py-4">
		暂无商品
	</div>

	<!-- 内置弹窗 -->
	<el-dialog v-model="dialogVisible" class="p-0!" width="90%" :show-close="false" header-class="p-0!">
		<el-image :src="getImageUrl('bait', currentItem?.nickname, '_big')" fit="cover" loading="lazy">
			<template #placeholder>
				<div class="flex-cc w-full h-full bg-[#f5f7fa]">
					<ElIcon>
						<Picture/>
					</ElIcon>
				</div>
			</template>
		</el-image>

		<div class="flex flex-col p-4! gap-2!">
			<div class="mb-3 text-base">{{ currentItem?.nickname }}</div>
			<div class="text-gray-500 text-sm">{{ currentItem?.desc }}</div>

			<div class="text-lg">
				价格: {{ currentItem?.price || 0 }} {{ currentItem?.game_config_player_balance?.nickname || '未知货币' }}
			</div>

			<div v-if="currentItem?.lv" class="text-sm text-gray-400">
				等级要求: {{ currentItem.lv }}
			</div>

			<div v-if="currentItem?.game_map" class="text-sm text-blue-500">
				地图限制: {{ currentItem.game_map.nickname }}
			</div>

			<!-- 饵料特有：显示可吸引的鸟类详细列表 -->
			<div v-if="currentItem?.game_item_bait_bird?.length" class="mt-2">
				<div class="text-sm font-bold text-green-600 mb-2">可吸引的鸟类：</div>
				<div class="grid grid-cols-2 gap-2">
					<div
						v-for="baitBird in currentItem.game_item_bait_bird"
						:key="baitBird.id"
						class="bg-green-50 p-2 rounded text-sm"
					>
						{{ baitBird.game_bird?.nickname || '未知鸟类' }}
					</div>
				</div>
			</div>

			<div class="flex justify-between mt-4">
				<el-button type="primary" @click="dialogVisible = false">关闭</el-button>
				<div class="flex gap-4">
					<el-input-number v-model="buyCount" :min="1"/>
					<el-button type="primary" @click="buyItem" :loading="loading" :disabled="loading">购买</el-button>
				</div>
			</div>
		</div>
	</el-dialog>
</template>

<script setup>
import { inject, ref } from "vue"
import { ElButton, ElDialog, ElIcon, ElInputNumber } from 'element-plus'
import { message } from '@/game/notification-center'
import { Picture } from "@element-plus/icons-vue"
import {getImageUrl} from '@/config/oss'

const game = inject('game')

const props = defineProps({
	items: {
		type: Array,
		default: () => []
	}
})

const dialogVisible = ref(false)
const currentItem = ref(null)
const buyCount = ref(1)
const loading = ref(false)

const showDialog = (item) => {
	currentItem.value = item
	buyCount.value = 1
	dialogVisible.value = true
}

const buyItem = async () => {
	if (loading.value) return

	loading.value = true
	try {
		const res = await game.game_item_bait.buy(currentItem.value.id, buyCount.value)

		if (res.code === 200) {
			message.success(res.msg)
			dialogVisible.value = false
			await game.player.update()
			await game.player_item_bait.update()
		} else {
			message.error(res.msg)
		}
	} finally {
		loading.value = false
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
