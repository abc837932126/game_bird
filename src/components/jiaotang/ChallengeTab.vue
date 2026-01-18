<template>
	<div>
		<!-- 任务列表 -->
		<div v-if="challenges.length > 0" class="flex flex-col gap-3">
			<el-card
				v-for="challenge in challenges"
				:key="challenge.id"
				class="challenge-card"
				:class="{ 'completed': challenge.completed }"
			>
				<div class="flex items-start gap-4">
					<!-- 任务图标 -->
					<div class="text-4xl flex-shrink-0">{{ challenge.icon }}</div>

					<!-- 任务内容 -->
					<div class="flex-1">
						<!-- 标题和完成状态 -->
						<div class="flex items-center justify-between mb-2">
							<div class="font-bold text-lg flex items-center gap-2">
								{{ challenge.title }}
								<el-tag
									v-if="challenge.completed"
									type="success"
									size="small"
								>
									已完成
								</el-tag>
							</div>
						</div>

						<!-- 描述 -->
						<div class="text-gray-600 text-sm mb-3">
							{{ challenge.desc }}
						</div>

						<!-- 进度条 -->
						<div class="mb-3">
							<el-progress
								:percentage="(challenge.progress / challenge.target) * 100"
								:status="challenge.completed ? 'success' : undefined"
							>
								<span class="text-xs">{{ challenge.progress }} / {{ challenge.target }}</span>
							</el-progress>
						</div>

						<!-- 奖励 -->
						<div class="text-sm text-gray-500">
							<span class="mr-4">🏆 奖励：</span>
							<el-tag size="small" type="warning">{{ challenge.reward.gold }} 金币</el-tag>
							<el-tag size="small" type="info" class="ml-2">{{ challenge.reward.item }}</el-tag>
						</div>
					</div>
				</div>
			</el-card>
		</div>

		<!-- 空状态 -->
		<div v-else class="text-center py-12 text-gray-400">
			<div class="text-6xl mb-4">📋</div>
			<div class="text-lg">暂无考验任务</div>
		</div>
	</div>
</template>

<script setup>
import { inject, computed } from 'vue'

const game = inject('game')

// 获取任务列表
const challenges = computed(() => {
	return game.game_marriage.data.challenges || []
})
</script>

<style scoped>
.challenge-card {
	transition: all 0.3s ease;
}

.challenge-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.challenge-card.completed {
	background-color: #f0f9ff;
	border-color: #67c23a;
}
</style>
