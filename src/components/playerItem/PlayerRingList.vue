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
			<div class="bg-pink-300 w-full aspect-square mb-2 flex items-center justify-center overflow-hidden">
				<img
					:src="getImageUrl('ring', item.game_item_ring?.nickname || 'default')"
					:alt="item.game_item_ring?.nickname"
					class="w-full h-full object-cover"
					@error="handleImageError"
				>
			</div>

			<div class="grow text-sm p-2 min-w-0">
				<p class="text-orange-500 font-bold truncate">
					{{ item.game_item_ring?.nickname || '未知物品' }}
				</p>

				<div class="text-xs text-gray-400 mt-1">
					数量: {{ item.count }}
				</div>

				<!-- 显示效果 -->
				<div class="text-xs text-gray-600 mt-1 space-y-0.5">
					<div v-if="item.game_item_ring?.bird_time">
						配对时间: -{{ item.game_item_ring.bird_time }}分钟
					</div>
					<div v-if="item.game_item_ring?.bird_weight_min || item.game_item_ring?.bird_weight_max">
						体重增幅: {{ item.game_item_ring.bird_weight_min }}~{{ item.game_item_ring.bird_weight_max }}g
					</div>
					<div v-if="item.game_item_ring?.need_heart" class="text-red-500">
						需要亲密度: {{ item.game_item_ring.need_heart }}
					</div>
				</div>
			</div>
		</el-card>
	</div>

	<div v-if="items.length === 0" class="text-center text-gray-400 py-4">
		暂无物品
	</div>

	<!-- 内置弹窗 -->
	<el-dialog v-model="dialogVisible" class="p-0!" width="90%" :show-close="false" header-class="p-0!">
		<el-image :src="getImageUrl('ring', currentItem?.game_item_ring?.nickname, '_big')" fit="cover" loading="lazy">
			<template #placeholder>
				<div class="flex-cc w-full h-full bg-[#f5f7fa]">
					<ElIcon>
						<Picture/>
					</ElIcon>
				</div>
			</template>
		</el-image>

		<div class="flex flex-col p-4! gap-2!">
			<div class="mb-3 text-base">{{ currentItem?.game_item_ring?.nickname }}</div>
			<div class="text-gray-500 text-sm">{{ currentItem?.game_item_ring?.desc }}</div>

			<div class="text-lg font-bold text-pink-600">
				拥有数量: {{ currentItem?.count || 0 }}
			</div>

			<!-- 戒指特有：显示配对效果 -->
			<div class="mt-2 bg-pink-50 p-3 rounded">
				<div class="text-sm font-bold text-pink-600 mb-2">配对效果：</div>
				<div class="space-y-1.5">
					<div v-if="currentItem?.game_item_ring?.bird_time" class="text-sm text-pink-800">
						⏰ 配对时间缩短: {{ currentItem.game_item_ring.bird_time }} 分钟
					</div>
					<div v-if="currentItem?.game_item_ring?.bird_weight_min || currentItem?.game_item_ring?.bird_weight_max" class="text-sm text-pink-800">
						📊 幼鸟体重增幅: {{ currentItem.game_item_ring.bird_weight_min }}~{{ currentItem.game_item_ring.bird_weight_max }}g
					</div>
					<div v-if="currentItem?.game_item_ring?.need_heart" class="text-sm text-red-600 font-bold">
						❤️ 需要亲密度: {{ currentItem.game_item_ring.need_heart }}
					</div>
				</div>
			</div>

			<div class="flex justify-between mt-4">
				<el-button type="primary" @click="dialogVisible = false">关闭</el-button>
				<div class="flex gap-4">
					<el-input-number v-model="useCount" :min="1" :max="currentItem?.count || 1"/>
					<el-button type="success" @click="useItem">使用</el-button>
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
const useCount = ref(1)

const showDialog = (item) => {
	currentItem.value = item
	useCount.value = 1
	dialogVisible.value = true
}

const useItem = async () => {
	// TODO: 实现使用戒指逻辑
	message.info('使用戒指功能待实现')
	// const res = await game.player_item_ring.use(currentItem.value.id, useCount.value)
	// if (res.code === 200) {
	// 	message.success(res.msg)
	// 	dialogVisible.value = false
	// 	await game.player_item_ring.update()
	// } else {
	// 	message.error(res.msg)
	// }
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
