<template>
	<el-dialog
      v-model="vis"
      :show-close="false"
      :close-on-click-modal="true"
      header-class="p-0! m-0! h-0!"
      footer-class="p-0! m-0! h-0!"
      body-class=" p-0! m-0!"
      class=" m-0! p-0! w-[100vw]!"
  >
		<div v-if="members.length > 0" class="flex flex-col h-[100vh]! w-[100vw]! ">
			<!-- 会长和副会长区域 -->
			<div class="flex-clo p-5 border-b border-gray-200">
				<!-- 会长 -->
				<div v-if="president" class="flex flex-col items-center mb-4">
					<div class="avatar-wrapper">
						<PlayerAvatar
							:player-id="president.player?.id"
							:sex="president.player?.sex"
							:avatar-frame-id="president.player?.avatar_frame_id"
							:size="80"
						/>
					</div>
					<div class="font-bold mt-2">{{ president.player?.nickname }}</div>
					<el-tag :type="getPositionTagType(1)" size="small" class="mt-1">
						{{ getPositionName(1) }}
					</el-tag>
				</div>

				<!-- 副会长 -->
				<div v-if="vicePresidents.length > 0">
					<div class="section-title">副会长</div>
					<div class="vice-presidents-grid">
						<div v-for="member in vicePresidents" :key="member.id" class="vice-president-item">
							<div class="avatar-wrapper">
								<PlayerAvatar
									:player-id="member.player?.id"
									:sex="member.player?.sex"
									:avatar-frame-id="member.player?.avatar_frame_id"
									:size="60"
								/>
							</div>
							<div class="font-bold mt-2">{{ member.player?.nickname }}</div>
							<div v-if="canShowActions(member)" class="actions mt-2">
								<el-button v-if="canDemoteMember(game.guild.data, 2)" size="small" @click="handleDemote(member)">降职</el-button>
								<el-button v-if="canKickMember(game.guild.data, 2, member.player_id === game.player.data.id)" size="small" type="danger" @click="handleKick(member)">踢出</el-button>
							</div>
						</div>
					</div>
				</div>
			</div>
			<!-- 其他职位（可折叠，可滚动的中间区域） -->
			<div class="flex-1 px-2! overflow-y-auto">
				<el-collapse v-if="Object.keys(otherPositions).length > 0" v-model="activePositions">
					<el-collapse-item v-for="(posMembers, positionLv) in otherPositions" :key="positionLv" :name="positionLv" >
						<template #title>
							<span class="font-bold">{{ getPositionName(Number(positionLv)) }} ({{ posMembers.length }}人)</span>
						</template>
						<div class="grid grid-cols-2 gap-3">
							<div v-for="member in posMembers" :key="member.id" class="flex justify-between items-center px-2! border border-gray-200 rounded-lg ">
								<div class="flex flex-col items-center ">
									<div class="avatar-wrapper">
										<PlayerAvatar
											:player-id="member.player?.id"
											:sex="member.player?.sex"
											:avatar-frame-id="member.player?.avatar_frame_id"
											:size="50"
										/>
									</div>
									<div class="font-bold">{{ member.player?.nickname }}</div>
								</div>
								<div class="flex flex-col items-center gap-2">
									<span class="text-sm text-gray-600">贡献: {{ member.contribution }}</span>
									<el-popover v-if="canShowActions(member)" placement="bottom" :width="120" trigger="click">
										<div class="popover-actions">
											<el-button class="m-0!" v-if="canPromoteMember(game.guild.data, Number(positionLv))" size="small" @click="handlePromote(member)">升职</el-button>
											<el-button class="m-0!" v-if="canDemoteMember(game.guild.data, Number(positionLv))"  size="small" @click="handleDemote(member)">降职</el-button>
											<el-button class="m-0!" v-if="canKickMember(game.guild.data, Number(positionLv), member.player_id === game.player.data.id)"  size="small" type="danger" @click="handleKick(member)">踢出</el-button>
										</div>
										<template #reference>
											<el-button :icon="MoreFilled" circle />
										</template>
									</el-popover>
								</div>
							</div>
						</div>
					</el-collapse-item>
				</el-collapse>
			</div>

      <div class="flex justify-center p-2! border-gray-200">
        <el-button @click="vis = false" class="w-full">关闭</el-button>
      </div>

		</div>




		<div v-else class="text-center py-16 text-gray-400">
			<div class="text-6xl mb-4">👥</div>
			<div class="text-lg">暂无成员</div>
		</div>

		<template #footer></template>
	</el-dialog>
</template>

<script setup>
import { inject, ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MoreFilled } from '@element-plus/icons-vue'
import PlayerAvatar from '@/components/common/PlayerAvatar.vue'
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

// 按职位等级分组成员
const groupedMembers = computed(() => {
	const groups = {}
	members.value.forEach(member => {
		const lv = getMemberPositionLv(member)
		if (!groups[lv]) groups[lv] = []
		groups[lv].push(member)
	})
	return groups
})

// 会长（单个）
const president = computed(() => groupedMembers.value[1]?.[0] || null)

// 副会长（数组）
const vicePresidents = computed(() => groupedMembers.value[2] || [])

// 其他职位（对象，key=position_lv）
const otherPositions = computed(() => {
	const others = {}
	Object.keys(groupedMembers.value).forEach(lv => {
		if (Number(lv) > 2) {
			others[lv] = groupedMembers.value[lv]
		}
	})
	return others
})

// 折叠状态（默认展开所有）
const activePositions = ref([])

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



defineExpose({ show })
</script>

<style scoped>

/* 圆形头像容器 */
.avatar-wrapper {
	border-radius: 50%;
	overflow: hidden;
	display: inline-block;
}

.section-title {
	font-weight: bold;
	font-size: 16px;
	margin-bottom: 12px;
	text-align: center;
}

.vice-presidents-grid {
	display: flex;
	gap: 16px;
	flex-wrap: wrap;
	justify-content: center;
}

.vice-president-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 12px;
	border: 1px solid #eee;
	border-radius: 8px;
	min-width: 120px;
}

/* Popover 操作按钮 */
.popover-actions {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.popover-actions .el-button {
	width: 100%;
}

/* 操作按钮 */
.actions {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
	justify-content: center;
}
</style>
