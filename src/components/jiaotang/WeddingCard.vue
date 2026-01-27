<template>
	<el-card class="wedding-card" :body-style="{ padding: '12px' }">
		<div class="flex items-center gap-4">
			<!-- 左侧：新人头像和名字 -->
			<div class="flex items-center gap-3">
				<!-- 新郎 -->
				<div class="flex flex-col items-center gap-1">
					<PlayerAvatar
						:player-id="wedding.groom.id"
						:sex="wedding.groom.sex"
						:avatar-frame-id="wedding.groom.avatar_frame_id"
						:size="45"
					/>
					<div class="text-xs font-bold truncate max-w-[60px]">{{ wedding.groom.nickname }}</div>
				</div>

				<span class="text-xl">💕</span>

				<!-- 新娘 -->
				<div class="flex flex-col items-center gap-1">
					<PlayerAvatar
						:player-id="wedding.bride.id"
						:sex="wedding.bride.sex"
						:avatar-frame-id="wedding.bride.avatar_frame_id"
						:size="45"
					/>
					<div class="text-xs font-bold truncate max-w-[60px]">{{ wedding.bride.nickname }}</div>
				</div>
			</div>

			<!-- 中间：礼金和倒计时 -->
			<div class="flex-1 flex flex-col gap-1 items-center">
				<el-tag v-if="wedding.gift_money > 0" type="warning" size="small">
					礼金 {{ wedding.gift_money_left }}/{{ wedding.gift_money }} {{ wedding.currency_name || '金币' }}
				</el-tag>
				<div class="text-xs text-gray-500">
					<el-countdown :value="getDeadline(wedding.weddingTime)" format="HH:mm:ss" />
				</div>
			</div>

			<!-- 右侧：祝福相关 -->
			<div v-if="showBlessing" class="flex flex-col gap-1 items-center">
				<el-tag type="success" size="small">
					{{ wedding.blessCount }} 份祝福
				</el-tag>
				<el-button
					type="primary"
					size="small"
					@click="$emit('bless', wedding)"
				>
					送祝福
				</el-button>
			</div>
		</div>
	</el-card>
</template>

<script setup>
import PlayerAvatar from '../common/PlayerAvatar.vue'

defineProps({
	wedding: { type: Object, required: true },
	showBlessing: { type: Boolean, default: true }
})

defineEmits(['bless'])

const getDeadline = (weddingTime) => {
	const startTime = new Date(weddingTime)
	return startTime.getTime() + 24 * 60 * 60 * 1000
}

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
.wedding-card {
	transition: all 0.3s ease;
}

.wedding-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
