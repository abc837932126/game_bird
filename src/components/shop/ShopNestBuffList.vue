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
					:src="getImageUrl('nest_buff', item.nickname || 'default')"
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

				<!-- 显示增益百分比 -->
				<div class="text-xs text-purple-500 mt-1">
					时间减免: {{ item?.time || 0 }}%
				</div>
			</div>
		</el-card>
	</div>

	<div v-if="items.length === 0" class="text-center text-gray-400 py-4">
		暂无商品
	</div>

	<!-- 内置弹窗 -->
	<el-dialog v-model="dialogVisible" class="p-0!" width="90%" :show-close="false" header-class="p-0!">
		<el-image :src="getImageUrl('nest_buff', currentItem?.nickname, '_big')" fit="cover" loading="lazy">
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

			<!-- 增益效果 -->
			<div class="mt-2">
				<div class="text-sm font-bold text-purple-600 mb-2">增益效果：</div>
				<div class="bg-purple-50 p-2 rounded text-sm">
					巢穴时间减免: <span class="text-purple-600 font-bold">{{ currentItem?.time || 0 }}%</span>
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
		const res = await game.game_item_nest_buff.buy(currentItem.value.id, buyCount.value)

		if (res.code === 200) {
			message.success(res.msg)
			dialogVisible.value = false
			await game.player.update()
			await game.player_item_nest_buff.update()
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
