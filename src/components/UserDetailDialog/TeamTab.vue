<template>
	<el-card shadow="never" class="border border-gray-200">
		<template #header>
			<div class="flex items-center gap-2">
				<span class="text-lg">⚔️</span>
				<span class="font-bold">队伍信息</span>
			</div>
		</template>
		<div v-if="teamInfo" class="space-y-4">
			<!-- 队伍基本信息 -->
			<div class="p-3 bg-gray-50 rounded-lg">
				<div class="flex justify-between items-center mb-2">
					<div class="text-lg font-bold">{{ teamInfo.nickname }}</div>
					<el-tag v-if="teamInfo.status === 'preparing'" type="warning" size="small">准备中</el-tag>
					<el-tag v-else-if="teamInfo.status === 'ready'" type="success" size="small">就绪</el-tag>
				</div>
				<div class="flex justify-between text-sm text-gray-600">
					<span>队长: {{ teamInfo.leader?.nickname }}</span>
					<span>成员: {{ teamInfo.team_members?.length || 0 }}/{{ teamInfo.max_members }}</span>
				</div>
			</div>

			<!-- 队伍成员列表 -->
			<div>
				<div class="text-sm font-bold mb-2 text-gray-700">队伍成员</div>
				<div class="space-y-2">
					<div
						v-for="member in teamInfo.team_members"
						:key="member.id"
						class="flex items-center justify-between p-2 bg-white border border-gray-200 rounded"
					>
						<div class="flex items-center gap-2">
							<span class="font-medium">{{ member.player.nickname }}</span>
							<el-tag v-if="member.player.id === teamInfo.leader_id" type="warning" size="small">队长</el-tag>
						</div>
						<el-tag type="info" size="small">Lv.{{ member.player.lv }}</el-tag>
					</div>
				</div>
			</div>
		</div>
		<div v-else class="text-center py-8 text-gray-400">
			<div class="text-4xl mb-2">⚔️</div>
			<p>该玩家未加入队伍</p>
		</div>
	</el-card>
</template>

<script setup>
const props = defineProps({
	teamInfo: {
		type: Object,
		default: null
	}
})
</script>
