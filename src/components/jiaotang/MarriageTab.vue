<template>

	<!-- 婚榜列表 -->
	<div v-if="marriageHistory.length > 0" class="flex flex-col gap-3">
		<el-card
			v-for="record in marriageHistory"
			:key="record.id"
			class="marriage-card"
			:body-style="{ padding: '12px' }"
		>
			<div class="flex items-center gap-4">
				<!-- 左侧：新人头像和名字 -->
				<div class="flex items-center gap-3">
					<!-- 新郎 -->
					<div class="flex flex-col items-center gap-1">
						<PlayerAvatar
							:player-id="record.groom.id"
							:sex="record.groom.sex"
							:avatar-frame-id="record.groom.avatar_frame_id"
							:size="45"
						/>
						<div class="text-xs font-bold truncate max-w-[60px]">{{ record.groom.nickname }}</div>
					</div>

					<span class="text-xl">💕</span>

					<!-- 新娘 -->
					<div class="flex flex-col items-center gap-1">
						<PlayerAvatar
							:player-id="record.bride.id"
							:sex="record.bride.sex"
							:avatar-frame-id="record.bride.avatar_frame_id"
							:size="45"
						/>
						<div class="text-xs font-bold truncate max-w-[60px]">{{ record.bride.nickname }}</div>
					</div>
				</div>

				<!-- 中间：结婚时间 -->
				<div class="flex-1 text-center text-gray-500 text-sm">
					{{ formatTime(record.marriageDate) }}
				</div>

				<!-- 右侧：祝福数量 -->
				<div>
					<el-tag type="success" size="small">
						{{ record.blessCount }} 份祝福
					</el-tag>
				</div>
			</div>
		</el-card>
	</div>

	<!-- 空状态 -->
	<div v-else class="text-center py-12 text-gray-400">
		<div class="text-6xl mb-4">💒</div>
		<div class="text-lg">暂无结婚记录</div>
		<div class="text-sm mt-2">期待更多玩家喜结连理！</div>
	</div>

</template>

<script setup>
import { inject, computed } from 'vue'
import PlayerAvatar from '../common/PlayerAvatar.vue'

const game = inject('game')

// 获取结婚历史记录
const marriageHistory = computed(() => {
	const history = game.game_marriage.data.history || []
	// 调试：打印第一条记录查看数据结构
	if (history.length > 0) {
		console.log('[婚榜] 第一条记录:', history[0])
	}
	return history
})

// 时间格式化
const formatTime = (time) => {
	const date = new Date(time)
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	const hour = String(date.getHours()).padStart(2, '0')
	const minute = String(date.getMinutes()).padStart(2, '0')
	return `${year}-${month}-${day} ${hour}:${minute}`
}
</script>

<style scoped>
.marriage-card {
	transition: all 0.3s ease;
}

.marriage-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
