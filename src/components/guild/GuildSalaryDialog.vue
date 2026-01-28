<template>
	<el-dialog v-model="vis" title="领取工资" width="90%" :close-on-click-modal="true">
		<div class="space-y-4">
			<div class="bg-blue-50 p-4 rounded-lg">
				<div class="text-sm font-medium mb-3">您的职位工资</div>
				<div v-if="salaryConfig && salaryConfig.length > 0" class="space-y-2">
					<div v-for="(item, index) in salaryConfig" :key="index" class="flex items-center gap-2">
						<span class="text-lg">{{ getCurrencyIcon(item.type) }}</span>
						<span class="font-bold text-lg">{{ item.amount }}</span>
						<span class="text-sm text-gray-600">{{ getCurrencyName(item.type) }}</span>
					</div>
				</div>
				<div v-else class="text-gray-500">该职位暂无工资配置</div>
			</div>

			<div v-if="lastClaimTime" class="text-sm text-gray-600">
				<div>上次领取: {{ formatTime(lastClaimTime) }}</div>
				<div v-if="!canClaim" class="text-orange-600 mt-1">
					冷却中，{{ remainingTime }}后可再次领取
				</div>
				<div v-else class="text-green-600 mt-1">✓ 可以领取工资了</div>
			</div>
			<div v-else class="text-sm text-gray-600">您还未领取过工资</div>
		</div>

		<template #footer>
			<el-button @click="vis = false">关闭</el-button>
			<el-button
				type="primary"
				@click="handleClaim"
				:loading="loading"
				:disabled="!canClaim || !salaryConfig || salaryConfig.length === 0">
				领取工资
			</el-button>
		</template>
	</el-dialog>
</template>

<script setup>
import { inject, ref, computed } from 'vue'
import { message } from '@/game/notification-center'

const game = inject('game')
const vis = ref(false)
const loading = ref(false)

const salaryConfig = computed(() => {
	return game.guild.data?.my_position_config?.salary || []
})

const lastClaimTime = computed(() => {
	return game.guild.data?.last_salary_claim_time
})

const canClaim = computed(() => {
	if (!lastClaimTime.value) return true

	const lastTime = new Date(lastClaimTime.value)
	const now = new Date()
	const hoursSince = (now.getTime() - lastTime.getTime()) / (1000 * 60 * 60)

	return hoursSince >= 24
})

const remainingTime = computed(() => {
	if (!lastClaimTime.value || canClaim.value) return ''

	const lastTime = new Date(lastClaimTime.value)
	const now = new Date()
	const hoursSince = (now.getTime() - lastTime.getTime()) / (1000 * 60 * 60)
	const hoursRemaining = Math.ceil(24 - hoursSince)

	return `${hoursRemaining}小时`
})

const show = () => {
	vis.value = true
}

const handleClaim = async () => {
	loading.value = true
	try {
		const res = await game.guild.api.claim_salary()

		if (res.code === 200) {
			message.success('工资领取成功')
			await game.guild.update()
			await game.player.update()
			vis.value = false
		} else {
			message.error(res.msg || '领取失败')
		}
	} catch (error) {
		console.error('领取工资失败:', error)
		message.error('领取工资失败')
	} finally {
		loading.value = false
	}
}

const getCurrencyIcon = (type) => {
	const icons = {
		1: '💰',
		2: '💎',
		3: '⭐'
	}
	return icons[type] || '💰'
}

const getCurrencyName = (type) => {
	const names = {
		1: '金币',
		2: '元宝',
		3: '星币'
	}
	return names[type] || '货币'
}

const formatTime = (timestamp) => {
	if (!timestamp) return '未知'
	const date = new Date(timestamp)
	return date.toLocaleString('zh-CN')
}

defineExpose({ show })
</script>
