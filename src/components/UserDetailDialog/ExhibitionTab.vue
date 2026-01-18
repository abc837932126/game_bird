<template>
	<div class="p-4">
		<div v-if="loading" class="text-center py-8 text-gray-400">
			加载中...
		</div>
		<div v-else-if="gifts.length === 0" class="text-center py-8 text-gray-400">
			<div class="text-4xl mb-2">🎁</div>
			<div class="text-sm">暂无收到的礼物</div>
		</div>
		<div v-else class="grid grid-cols-4 gap-4">
			<div
				v-for="gift in gifts"
				:key="gift.game_item_gift.id"
				class="flex flex-col items-center p-3 bg-gray-50 rounded-lg"
			>
				<el-image
					:src="getImageUrl('gift' , gift.game_item_gift.nickname)"
					style="width: 60px; height: 60px"
					fit="contain"
				>
					<template #error>
						<div class="text-3xl">🎁</div>
					</template>
				</el-image>
				<div class="text-sm mt-2 text-center">{{ gift.game_item_gift.nickname }}</div>
				<div class="text-xs text-gray-500 mt-1">x{{ gift.count }}</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import {ref, inject, onMounted} from 'vue'
import {getImageUrl} from "@/config/oss.js";

const game = inject('game')

const props = defineProps({
	userInfo: {
		type: Object,
		required: true
	}
})

const gifts = ref([])
const loading = ref(false)

const fetchGifts = async () => {
	loading.value = true
	try {
		// 先加载礼物配置数据
		await game.game_item_gift.update()

		const playerId = props.userInfo.player_id || props.userInfo.id
		const response = await game.player_gift.getPlayerReceivedLog(playerId)
		if (response.code === 200 && response.data) {
			gifts.value = response.data
		}
	} catch (error) {
		console.error('获取礼物记录失败:', error)
	} finally {
		loading.value = false
	}
}

onMounted(() => {
	fetchGifts()
})
</script>

<style scoped>
</style>
