<template>
	<el-dialog v-model="vis" title="成员列表" width="90%" :close-on-click-modal="true">
		<div v-if="members.length > 0" class="space-y-2 max-h-96 overflow-y-auto">
			<el-card v-for="member in members" :key="member.id" class="hover:shadow-md transition-shadow">
				<div class="flex justify-between items-center">
					<div class="flex-1">
						<div class="flex items-center gap-2 mb-1">
							<span class="font-bold">{{ member.player?.nickname }}</span>
							<el-tag :type="getPositionTagType(getMemberPositionLv(member))" size="small">
								{{ getPositionName(getMemberPositionLv(member)) }}
							</el-tag>
						</div>
						<div class="text-xs text-gray-500">
							<span>贡献: {{ member.contribution }}</span>
							<span class="ml-3">加入时间: {{ formatDate(member.join_time) }}</span>
						</div>
					</div>
					<div v-if="canShowActions(member)" class="flex gap-2">
						<el-button v-if="canPromoteMember(game.guild.data, getMemberPositionLv(member))" size="small" @click="handlePromote(member)">
							升职
						</el-button>
						<el-button v-if="canDemoteMember(game.guild.data, getMemberPositionLv(member))" size="small" @click="handleDemote(member)">
							降职
						</el-button>
						<el-button v-if="canKickMember(game.guild.data, getMemberPositionLv(member), member.player_id === game.player.data.id)" size="small" type="danger" @click="handleKick(member)">
							踢出
						</el-button>
					</div>
				</div>
			</el-card>
		</div>

		<div v-else class="text-center py-16 text-gray-400">
			<div class="text-6xl mb-4">👥</div>
			<div class="text-lg">暂无成员</div>
		</div>

		<template #footer>
			<el-button @click="vis = false">关闭</el-button>
		</template>
	</el-dialog>
</template>

<script setup>
import { inject, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
	getPositionName,
	getPositionTagType,
	getMemberPositionLv,
	getMyPositionLv,
	canPromoteMember,
	canDemoteMember,
	canKickMember,
	canManageGuild
} from '@/utils/guild-position'

const game = inject('game')
const vis = ref(false)
const members = ref([])

const canShowActions = (member) => {
	const myPositionLv = getMyPositionLv(game.guild.data)
	const memberPositionLv = getMemberPositionLv(member)
	// 只能操作职位比自己低的成员，且不能操作自己
	return canManageGuild(game.guild.data) &&
		memberPositionLv > myPositionLv &&
		member.player_id !== game.player.data.id
}

const show = async () => {
	vis.value = true
	await loadMembers()
}

const loadMembers = async () => {
	const guildId = game.guild.data?.id
	if (!guildId) return

	const res = await game.guild_member.api.get_members({ guild_id: guildId })
	if (res.code === 200) {
		members.value = res.data
	} else {
		ElMessage.error(res.msg || '加载成员列表失败')
	}
}

const handlePromote = async (member) => {
	try {
		await ElMessageBox.confirm(`确定要将 ${member.player?.nickname} 提升为官员吗？`, '提示', {
			confirmButtonText: '确定',
			cancelButtonText: '取消'
		})

		const res = await game.guild_member.api.promote({
			guild_id: game.guild.data.id,
			player_id: member.player_id
		})

		if (res.code === 200) {
			ElMessage.success('提升成功')
			await loadMembers()
		} else {
			ElMessage.error(res.msg || '提升失败')
		}
	} catch (error) {
		// 用户取消
	}
}

const handleDemote = async (member) => {
	try {
		await ElMessageBox.confirm(`确定要将 ${member.player?.nickname} 降为普通成员吗？`, '提示', {
			confirmButtonText: '确定',
			cancelButtonText: '取消'
		})

		const res = await game.guild_member.api.demote({
			guild_id: game.guild.data.id,
			player_id: member.player_id
		})

		if (res.code === 200) {
			ElMessage.success('降职成功')
			await loadMembers()
		} else {
			ElMessage.error(res.msg || '降职失败')
		}
	} catch (error) {
		// 用户取消
	}
}

const handleKick = async (member) => {
	try {
		await ElMessageBox.confirm(`确定要将 ${member.player?.nickname} 踢出工会吗？`, '提示', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning'
		})

		const res = await game.guild_member.api.kick({
			guild_id: game.guild.data.id,
			player_id: member.player_id
		})

		if (res.code === 200) {
			ElMessage.success('已踢出')
			await loadMembers()
			await game.guild.update()
		} else {
			ElMessage.error(res.msg || '踢出失败')
		}
	} catch (error) {
		// 用户取消
	}
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
