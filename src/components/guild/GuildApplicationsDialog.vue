<template>
	<el-dialog v-model="vis" :title="title" width="90%" :close-on-click-modal="true">
		<div v-if="applications.length > 0" class="space-y-3 max-h-96 overflow-y-auto">
			<el-card v-for="app in applications" :key="app.id" class="hover:shadow-md transition-shadow">
				<div class="flex justify-between items-center">
					<div class="flex-1">
						<!-- 管理员视角：显示申请人信息 -->
						<template v-if="isManageMode">
							<div class="font-bold text-lg mb-1">{{ app.player?.nickname }}</div>
							<div class="text-sm text-gray-600 mb-2" v-if="app.message">
								留言: {{ app.message }}
							</div>
							<div class="text-xs text-gray-500">
								申请时间: {{ formatDate(app.ct_time) }}
							</div>
						</template>
						<!-- 玩家视角：显示工会信息 -->
						<template v-else>
							<div class="font-bold text-lg mb-1">{{ app.guild?.nickname }}</div>
							<div class="text-sm text-gray-600 mb-2">{{ app.guild?.desc || '暂无描述' }}</div>
							<div class="flex gap-4 text-xs text-gray-500">
								<span>等级: {{ app.guild?.level }}</span>
								<span>成员: {{ app.guild?.member_count }}/{{ app.guild?.max_members }}</span>
								<span>状态: {{ getStatusText(app.status) }}</span>
							</div>
						</template>
					</div>
					<div class="flex gap-2">
						<!-- 管理员操作 -->
						<template v-if="isManageMode && app.status === 'pending'">
							<el-button
								type="primary"
								size="small"
								@click="handleAccept(app)"
								:loading="processingId === app.id"
							>
								同意
							</el-button>
							<el-button
								size="small"
								@click="handleReject(app)"
								:loading="processingId === app.id"
							>
								拒绝
							</el-button>
						</template>
						<!-- 玩家操作 -->
						<template v-else-if="!isManageMode && app.status === 'pending'">
							<el-button
								size="small"
								@click="handleCancel(app)"
								:loading="processingId === app.id"
							>
								取消申请
							</el-button>
						</template>
						<el-tag v-else :type="getStatusType(app.status)" size="small">
							{{ getStatusText(app.status) }}
						</el-tag>
					</div>
				</div>
			</el-card>
		</div>

		<div v-else class="text-center py-16 text-gray-400">
			<div class="text-6xl mb-4">📝</div>
			<div class="text-lg">{{ isManageMode ? '暂无申请' : '暂无申请记录' }}</div>
		</div>

		<template #footer>
			<el-button @click="vis = false">关闭</el-button>
		</template>
	</el-dialog>
</template>

<script setup>
import { inject, ref, computed } from 'vue'
import { message } from '@/game/notification-center'

const game = inject('game')
const vis = ref(false)
const applications = ref([])
const processingId = ref(null)
const isManageMode = ref(false)

const title = computed(() => {
	return isManageMode.value ? '入会申请' : '我的申请'
})

const show = async (manageMode = false) => {
	vis.value = true
	isManageMode.value = manageMode
	await loadApplications()
}

const loadApplications = async () => {
	let res
	if (isManageMode.value) {
		// 管理员查看工会的申请
		res = await game.guild_application.api.get_guild_applications({
			guild_id: game.guild.data.id
		})
	} else {
		// 玩家查看自己的申请
		res = await game.guild_application.api.get_my_applications()
	}

	if (res.code === 200) {
		applications.value = res.data
	} else {
		message.error(res.msg || '加载申请列表失败')
	}
}

const handleAccept = async (app) => {
	processingId.value = app.id
	try {
		const res = await game.guild_application.api.accept({ application_id: app.id })
		if (res.code === 200) {
			message.success('已同意申请')
			await game.guild.update()
			await loadApplications()
			// 刷新待处理申请数量
			if (game.guild.data?.id) {
				await game.guild_application.updateGuildApplications(game.guild.data.id)
			}
		} else {
			message.error(res.msg || '同意申请失败')
		}
	} catch (error) {
		console.error('同意申请失败:', error)
		message.error('同意申请失败')
	} finally {
		processingId.value = null
	}
}

const handleReject = async (app) => {
	processingId.value = app.id
	try {
		const res = await game.guild_application.api.reject({ application_id: app.id })
		if (res.code === 200) {
			message.success('已拒绝申请')
			await loadApplications()
			// 刷新待处理申请数量
			if (game.guild.data?.id) {
				await game.guild_application.updateGuildApplications(game.guild.data.id)
			}
		} else {
			message.error(res.msg || '拒绝申请失败')
		}
	} catch (error) {
		console.error('拒绝申请失败:', error)
		message.error('拒绝申请失败')
	} finally {
		processingId.value = null
	}
}

const handleCancel = async (app) => {
	processingId.value = app.id
	try {
		const res = await game.guild_application.api.cancel({ application_id: app.id })
		if (res.code === 200) {
			message.success('已取消申请')
			await loadApplications()
		} else {
			message.error(res.msg || '取消申请失败')
		}
	} catch (error) {
		console.error('取消申请失败:', error)
		message.error('取消申请失败')
	} finally {
		processingId.value = null
	}
}

const getStatusText = (status) => {
	const statusMap = {
		pending: '待处理',
		accepted: '已同意',
		rejected: '已拒绝',
		cancelled: '已取消'
	}
	return statusMap[status] || status
}

const getStatusType = (status) => {
	const typeMap = {
		pending: 'warning',
		accepted: 'success',
		rejected: 'danger',
		cancelled: 'info'
	}
	return typeMap[status] || 'info'
}

const formatDate = (timestamp) => {
	if (!timestamp) return '未知'

	// Try to parse the timestamp
	let date
	if (typeof timestamp === 'string') {
		date = new Date(timestamp)
	} else if (timestamp < 10000000000) {
		// Likely in seconds, convert to milliseconds
		date = new Date(timestamp * 1000)
	} else {
		// Already in milliseconds
		date = new Date(timestamp)
	}

	// Check if date is valid
	if (isNaN(date.getTime())) {
		return '未知'
	}

	return date.toLocaleDateString('zh-CN')
}

defineExpose({ show })
</script>
