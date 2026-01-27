<template>
	<div class="h-full flex flex-col p-4">
		<!-- 顶部图片 -->
		<div class="mb-4 rounded-lg overflow-hidden">
			<el-image :src="getImageUrl('bg', '仓库')" fit="cover" class="w-full h-38" loading="lazy" >
				<template #error>
					<div class="h-38 bg-linear-to-r from-pink-400 via-purple-400 to-red-400
						flex items-center justify-center">
						<span class="text-8xl">🦜</span>
					</div>
				</template>
			</el-image>
		</div>

		<!-- 操作栏 -->
		<div class="mb-4 flex justify-between items-center gap-2">
			<div class="flex gap-2">
				<el-button size="small" @click="sortBy('weight')">
					按重量排序 {{ sortField === 'weight' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
				</el-button>
				<el-button size="small" @click="sortBy('grow')">
					按成长排序 {{ sortField === 'grow' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
				</el-button>
			</div>
			<div class="flex gap-2">
				<el-button size="small" type="danger" @click="handleSellAll">
					💰 全部出售
				</el-button>
			</div>
		</div>

		<!-- 滚动容器 -->
		<div class="flex-1 overflow-y-auto">
			<div class="grid grid-cols-4 gap-2 pb-4">
				<div
					v-for="bird in sortedBirds"
					:key="bird.id"
					class="card p-4 cursor-pointer hover:shadow-lg transition-shadow relative"
				>
					<div class="relative" @click="PlayerBirdInfoRef?.show(bird)">
						<img
							:src="getImageUrl('bird', bird.game_bird.nickname)"
							:alt="bird.game_bird.nickname"
							class="w-full h-24 object-cover rounded"
						/>
						<div
							v-if="bird.status"
							:class="[
								'absolute top-0 left-0 right-0 px-2 py-1 text-white text-xs font-bold text-center',
								bird.status === 'ladder' ? 'bg-red-500/90' : 'bg-orange-500/90'
							]"
						>
							{{ bird.statusDetail }}
						</div>
						<!-- 鸟名称覆盖在左下角 -->
						<div class="absolute bottom-0 left-0 px-2 py-1 text-white text-lg font-bold bg-black/30 backdrop-blur-sm rounded-br">
							{{ bird.game_bird.nickname }}
						</div>
					</div>
					<!-- 锁定按钮 -->
					<div class="absolute top-2 right-2 z-10" @click.stop="handleToggleLock(bird)">
						<el-button :type="bird.locked ? 'warning' : 'info'" size="small" circle>
							{{ bird.locked ? '🔒' : '🔓' }}
						</el-button>
					</div>
					<div class="text-sm text-gray-500" @click="PlayerBirdInfoRef?.show(bird)">性别: {{ bird.sex === 0 ? '♂ 雄性' : '♀ 雌性' }}</div>
					<div class="text-sm text-blue-500" @click="PlayerBirdInfoRef?.show(bird)">类型: {{ bird.game_bird?.game_config_bird_type?.nickname || '未知' }}</div>
					<div class="text-sm" :class="bird.is_paired ? 'text-pink-500' : 'text-gray-400'" @click="PlayerBirdInfoRef?.show(bird)">
						{{ bird.is_paired ? '💕 已配对' : '💔 未配对' }}
					</div>
					<div class="text-sm text-gray-500" @click="PlayerBirdInfoRef?.show(bird)">重量: {{ bird.weight.toFixed(2) }}kg</div>
					<div class="text-sm text-gray-500" @click="PlayerBirdInfoRef?.show(bird)">等级: Lv.{{ bird.lv }}</div>
					<div class="text-sm text-gray-500" @click="PlayerBirdInfoRef?.show(bird)">成长: {{ bird.grow.toFixed(2) }}</div>
					<div class="text-sm text-orange-500" @click="PlayerBirdInfoRef?.show(bird)">克制值: {{ bird.restraint }}</div>
				</div>
			</div>

			<div v-if="!game.player_bird.data || game.player_bird.data.length === 0" class="text-center text-gray-400 py-8">
				暂无鸟类
			</div>
		</div>

		<PlayerBirdInfo ref="PlayerBirdInfoRef" />
	</div>
</template>

<script setup>
import { inject, ref, onMounted, computed } from 'vue'
import { ElMessageBox } from 'element-plus'
import { message } from '@/game/notification-center'
import PlayerBirdInfo from './PlayerBirdInfo.vue'
import {getImageUrl} from '@/config/oss'

const game = inject('game')
const PlayerBirdInfoRef = ref(null)
const sortField = ref(null)
const sortOrder = ref('desc')

// 排序后的鸟列表
const sortedBirds = computed(() => {
	if (!game.player_bird.data) return []

	const birds = [...game.player_bird.data]

	if (!sortField.value) return birds

	return birds.sort((a, b) => {
		const aValue = a[sortField.value]
		const bValue = b[sortField.value]

		if (sortOrder.value === 'asc') {
			return aValue - bValue
		} else {
			return bValue - aValue
		}
	})
})

// 排序方法
const sortBy = (field) => {
	if (sortField.value === field) {
		// 切换排序顺序
		sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
	} else {
		// 新字段，默认降序
		sortField.value = field
		sortOrder.value = 'desc'
	}
}

// 切换锁定状态
const handleToggleLock = async (bird) => {
	try {
		const res = await game.player_bird.api.toggleLock(bird.id)
		if (res.code === 200) {
			message.success(res.msg)
			await game.player_bird.update()
		} else {
			message.error(res.msg || '操作失败')
		}
	} catch (error) {
		message.error('操作失败')
	}
}

// 全部出售
const handleSellAll = async () => {
	try {
		await ElMessageBox.confirm(
			'确定要出售所有未占用且未锁定的鸟吗？',
			'全部出售',
			{
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}
		)

		const res = await game.player_bird.sell({ sell_all: true })
		if (res.code === 200) {
			message.success(res.data.message)
		} else {
			message.error(res.msg || '出售失败')
		}
	} catch (error) {
		if (error !== 'cancel') {
			message.error('出售失败')
		}
	}
}

onMounted(() => {
	game.player_bird.update()
})
</script>

<style scoped>

</style>
