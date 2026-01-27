<template>
	<el-dialog
		v-model="visible"
		title="好友申请"
		width="90%"
		:show-close="true"
	>
		<!-- 申请列表 -->
		<div v-if="requests.length > 0" class="max-h-[60vh] overflow-y-auto">
			<div class="grid grid-cols-1 gap-3">
				<el-card
					v-for="request in requests"
					:key="request.request_id"
					body-class="p-4!"
				>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<div>
								<div class="font-bold text-lg">{{ request.requester?.nickname || request.requester?.username }}</div>
								<div class="text-sm text-gray-500 mt-1">
									等级: Lv.{{ request.requester?.lv || 1 }}
								</div>
							</div>
						</div>
						<div class="flex gap-2">
							<el-button type="success" size="small" @click="handleAccept(request)" >
								同意
							</el-button>
							<el-button type="danger" size="small" @click="handleReject(request)" >
								拒绝
							</el-button>
						</div>
					</div>
				</el-card>
			</div>
		</div>

		<!-- 空状态 -->
		<div v-else class="text-center py-12 text-gray-400">
			<div class="text-6xl mb-4">📭</div>
			<div class="text-lg">暂无好友申请</div>
		</div>

		<template #footer>
			<el-button @click="visible = false">关闭</el-button>
		</template>
	</el-dialog>
</template>

<script setup>
import { ref, inject, computed } from 'vue'
import { ElButton, ElDialog, ElCard } from 'element-plus'
import { message } from '@/game/notification-center'

const game = inject('game')
const visible = ref(false)

const emit = defineEmits(['success'])

// 获取申请列表
const requests = computed(() => {
	return game.player_friend.pendingRequests || []
})

// 显示对话框
const show = async () => {
	// 加载待处理申请
	await game.player_friend.updatePending()
	visible.value = true
}

// 同意申请
const handleAccept = async (request) => {
	try {
		const res = await game.player_friend.api.accept(request.request_id)
		if (res.code === 200) {
			message.success(res.msg || '已同意好友申请')
			// 重新加载待处理申请和好友列表
			await Promise.all([
				game.player_friend.updatePending(),
				game.player_friend.update()
			])
			emit('success')
		} else {
			message.error(res.msg || '操作失败')
		}
	} catch (error) {
		message.error('操作失败: ' + error.message)
	}
}

// 拒绝申请
const handleReject = async (request) => {
	try {
		const res = await game.player_friend.api.reject(request.request_id)
		if (res.code === 200) {
			message.success(res.msg || '已拒绝好友申请')
			// 重新加载待处理申请
			await game.player_friend.updatePending()
			emit('success')
		} else {
			message.error(res.msg || '操作失败')
		}
	} catch (error) {
		message.error('操作失败: ' + error.message)
	}
}

defineExpose({
	show
})
</script>

<style scoped>
</style>
