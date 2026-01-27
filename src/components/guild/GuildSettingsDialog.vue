<template>
	<el-dialog v-model="vis" title="工会设置" width="90%" :close-on-click-modal="true">
		<div class="space-y-4">
			<!-- 工会描述 -->
			<div>
				<label class="block text-sm font-medium mb-2">工会描述</label>
				<el-input
					v-model="formData.desc"
					type="textarea"
					placeholder="请输入工会描述"
					:rows="4"
					maxlength="500"
					show-word-limit
				/>
			</div>

			<!-- 工会公告 -->
			<div>
				<label class="block text-sm font-medium mb-2">工会公告</label>
				<el-input
					v-model="formData.announcement"
					type="textarea"
					placeholder="请输入工会公告"
					:rows="4"
					maxlength="500"
					show-word-limit
				/>
			</div>

			<!-- 危险操作区域 -->
			<div v-if="isLeaderRole" class="border-t pt-4 mt-4">
				<div class="text-sm font-medium mb-3 text-red-600">危险操作</div>
				<el-button type="danger" @click="handleDisband">
					解散工会
				</el-button>
			</div>
		</div>

		<template #footer>
			<el-button @click="vis = false">取消</el-button>
			<el-button type="primary" @click="handleSave" :loading="loading">
				保存设置
			</el-button>
		</template>
	</el-dialog>
</template>

<script setup>
import { inject, ref, computed } from 'vue'
import { ElMessageBox } from 'element-plus'
import { message } from '@/game/notification-center'
import { isLeader, getMyPositionLv } from '@/utils/guild-position'

const game = inject('game')
const vis = ref(false)
const loading = ref(false)

const formData = ref({
	desc: '',
	announcement: ''
})

const isLeaderRole = computed(() => {
	const positionLv = getMyPositionLv(game.guild.data)
	return isLeader(positionLv)
})

const show = () => {
	vis.value = true
	// 加载当前设置
	formData.value = {
		desc: game.guild.data?.desc || '',
		announcement: game.guild.data?.announcement || ''
	}
}

const handleSave = async () => {
	loading.value = true
	try {
		// 更新描述
		const descRes = await game.guild.api.update({
			desc: formData.value.desc.trim()
		})

		if (descRes.code !== 200) {
			message.error(descRes.msg || '更新描述失败')
			return
		}

		// 更新公告
		const announcementRes = await game.guild.api.update_announcement({
			announcement: formData.value.announcement.trim()
		})

		if (announcementRes.code !== 200) {
			message.error(announcementRes.msg || '更新公告失败')
			return
		}

		message.success('设置已保存')
		await game.guild.update()
		vis.value = false
	} catch (error) {
		console.error('保存设置失败:', error)
		message.error('保存设置失败')
	} finally {
		loading.value = false
	}
}

const handleDisband = async () => {
	try {
		await ElMessageBox.confirm(
			'解散工会后将无法恢复，确定要解散工会吗？',
			'警告',
			{
				confirmButtonText: '确定解散',
				cancelButtonText: '取消',
				type: 'error'
			}
		)

		const res = await game.guild.api.disband({ guild_id: game.guild.data.id })
		if (res.code === 200) {
			message.success('工会已解散')
			await game.guild.update()
			vis.value = false
		} else {
			message.error(res.msg || '解散工会失败')
		}
	} catch (error) {
		// 用户取消
	}
}

defineExpose({ show })
</script>
