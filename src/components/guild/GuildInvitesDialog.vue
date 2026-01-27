<template>
	<el-dialog v-model="vis" title="我的邀请" width="90%" :close-on-click-modal="true">
		<div v-if="invites.length > 0" class="space-y-3 max-h-96 overflow-y-auto">
			<el-card v-for="invite in invites" :key="invite.id" class="hover:shadow-md transition-shadow">
				<div class="flex justify-between items-center">
					<div class="flex-1">
						<div class="font-bold text-lg mb-1">{{ invite.guild?.nickname }}</div>
						<div class="text-sm text-gray-600 mb-2">{{ invite.guild?.desc || '暂无描述' }}</div>
						<div class="flex gap-4 text-xs text-gray-500">
							<span>邀请人: {{ invite.inviter?.nickname }}</span>
							<span>等级: {{ invite.guild?.level }}</span>
							<span>成员: {{ invite.guild?.member_count }}/{{ invite.guild?.max_members }}</span>
						</div>
					</div>
					<div class="flex gap-2">
						<el-button
							type="primary"
							size="small"
							@click="handleAccept(invite)"
							:loading="processingId === invite.id"
						>
							接受
						</el-button>
						<el-button
							size="small"
							@click="handleReject(invite)"
							:loading="processingId === invite.id"
						>
							拒绝
						</el-button>
					</div>
				</div>
			</el-card>
		</div>

		<div v-else class="text-center py-16 text-gray-400">
			<div class="text-6xl mb-4">📨</div>
			<div class="text-lg">暂无邀请</div>
		</div>

		<template #footer>
			<el-button @click="vis = false">关闭</el-button>
		</template>
	</el-dialog>
</template>

<script setup>
import { inject, ref } from 'vue'
import { message } from '@/game/notification-center'

const game = inject('game')
const vis = ref(false)
const invites = ref([])
const processingId = ref(null)

const show = async () => {
	vis.value = true
	await loadInvites()
}

const loadInvites = async () => {
	const res = await game.guild_invite.api.get_pending()
	if (res.code === 200) {
		invites.value = res.data
	} else {
		message.error(res.msg || '加载邀请列表失败')
	}
}

const handleAccept = async (invite) => {
	processingId.value = invite.id
	try {
		const res = await game.guild_invite.api.accept({ invite_id: invite.id })
		if (res.code === 200) {
			message.success('已加入工会')
			await game.guild.update()
			await loadInvites()
		} else {
			message.error(res.msg || '接受邀请失败')
		}
	} catch (error) {
		console.error('接受邀请失败:', error)
		message.error('接受邀请失败')
	} finally {
		processingId.value = null
	}
}

const handleReject = async (invite) => {
	processingId.value = invite.id
	try {
		const res = await game.guild_invite.api.reject({ invite_id: invite.id })
		if (res.code === 200) {
			message.success('已拒绝邀请')
			await loadInvites()
		} else {
			message.error(res.msg || '拒绝邀请失败')
		}
	} catch (error) {
		console.error('拒绝邀请失败:', error)
		message.error('拒绝邀请失败')
	} finally {
		processingId.value = null
	}
}

defineExpose({ show })
</script>
