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
			<div class="bg-blue-300 w-full aspect-square mb-2 flex items-center justify-center overflow-hidden">
				<img
					:src="getImageUrl('train_buff', item.game_item_train_buff?.nickname || 'default')"
					:alt="item.game_item_train_buff?.nickname"
					class="w-full h-full object-cover"
					@error="handleImageError"
				>
			</div>

			<div class="grow text-sm p-2 min-w-0">
				<p class="text-orange-500 font-bold truncate">
					{{ item.game_item_train_buff?.nickname || '未知物品' }}
				</p>

				<div class="text-xs text-gray-400 mt-1">
					数量: {{ item.count }}
				</div>

				<!-- 显示增益百分比 -->
				<div class="text-xs text-purple-500 mt-1">
					时间加成: +{{ item.game_item_train_buff?.time || 0 }}%
				</div>
			</div>
		</el-card>
	</div>

	<div v-if="items.length === 0" class="text-center text-gray-400 py-4">
		暂无物品
	</div>

	<!-- 内置弹窗 -->
	<el-dialog v-model="dialogVisible" class="p-0!" width="90%" :show-close="false" header-class="p-0!">
		<el-image :src="getImageUrl('train_buff', currentItem?.game_item_train_buff?.nickname, '_big')" fit="cover" loading="lazy">
			<template #placeholder>
				<div class="flex-cc w-full h-full bg-[#f5f7fa]">
					<ElIcon>
						<Picture/>
					</ElIcon>
				</div>
			</template>
		</el-image>

		<div class="flex flex-col p-4! gap-2!">
			<div class="mb-3 text-base">{{ currentItem?.game_item_train_buff?.nickname }}</div>
			<div class="text-gray-500 text-sm">{{ currentItem?.game_item_train_buff?.desc }}</div>

			<div class="text-lg font-bold text-blue-600">
				拥有数量: {{ currentItem?.count || 0 }}
			</div>

			<!-- 增益效果 -->
			<div class="mt-2">
				<div class="text-sm font-bold text-purple-600 mb-2">增益效果：</div>
				<div class="bg-purple-50 p-2 rounded text-sm">
					训练时间加成: <span class="text-purple-600 font-bold">+{{ currentItem?.game_item_train_buff?.time || 0 }}%</span>
				</div>
			</div>

			<div class="flex justify-between mt-4">
				<el-button type="primary" @click="dialogVisible = false">关闭</el-button>
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

const showDialog = (item) => {
	currentItem.value = item
	dialogVisible.value = true
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
