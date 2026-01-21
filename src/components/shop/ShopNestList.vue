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
			<div class="bg-amber-300 w-full aspect-square mb-2 flex items-center justify-center overflow-hidden">
				<img
					:src="getImageUrl('nest', item.nickname || 'default')"
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

				<!-- 显示效果 -->
				<div class="text-xs text-gray-600 mt-1 space-y-0.5">
					<div v-if="item.exp">
						经验加成: +{{ item.exp }}%
					</div>
					<div v-if="item.time">
						配对时间: -{{ item.time }}%
					</div>
					<div v-if="item.weight_min">
						最小体重: +{{ item.weight_min }}%
					</div>
					<div v-if="item.weight_max">
						最大体重: +{{ item.weight_max }}%
					</div>
				</div>
			</div>
		</el-card>
	</div>

	<div v-if="items.length === 0" class="text-center text-gray-400 py-4">
		暂无商品
	</div>

	<!-- 内置弹窗 -->
	<el-dialog v-model="dialogVisible" class="p-0!" width="90%" :show-close="false" header-class="p-0!">
		<el-image :src="getImageUrl('nest', currentItem?.nickname, '_big')" fit="cover" loading="lazy">
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

			<!-- 鸟窝特有：显示属性加成 -->
			<div class="mt-2 bg-amber-50 p-3 rounded">
				<div class="text-sm font-bold text-amber-600 mb-2">鸟窝效果：</div>
				<div class="space-y-1.5">
					<div v-if="currentItem?.exp" class="text-sm text-amber-800">
						✨ 经验加成: +{{ currentItem.exp }}%
					</div>
					<div v-if="currentItem?.time" class="text-sm text-amber-800">
						⏰ 配对时间缩短: {{ currentItem.time }}%
					</div>
					<div v-if="currentItem?.weight_min" class="text-sm text-amber-800">
						📉 幼鸟最小体重加成: +{{ currentItem.weight_min }}%
					</div>
					<div v-if="currentItem?.weight_max" class="text-sm text-amber-800">
						📈 幼鸟最大体重加成: +{{ currentItem.weight_max }}%
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
import { ElButton, ElDialog, ElMessage, ElIcon, ElInputNumber } from "element-plus"
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
		const res = await game.game_item_nest.buy(currentItem.value.id, buyCount.value)

		if (res.code === 200) {
			ElMessage.success(res.msg)
			dialogVisible.value = false
			await game.player.update()
			await game.player_item_nest.update()
		} else {
			ElMessage.error(res.msg)
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
