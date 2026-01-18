<template>
	<div class="h-full flex flex-col p-4">
		<!-- 顶部教堂图片 -->
		<div class="mb-4 rounded-lg overflow-hidden">
			<el-image :src="getImageUrl('bg', '教堂')" fit="cover" class="w-full h-38" loading="lazy" >
				<template #error>
					<div class="h-38 bg-gradient-to-r from-pink-400 via-purple-400 to-red-400
					            flex items-center justify-center">
						<span class="text-8xl">⛪</span>
					</div>
				</template>
			</el-image>
		</div>

		<!-- 发起结婚按钮 -->
		<div v-if="!isMarried" class="mb-4 flex justify-center">
			<el-button
				type="primary"
				size="large"
				@click="handleProposal"
				class="w-full max-w-md"
			>
				<span class="text-lg">💍 发起结婚邀请</span>
			</el-button>
		</div>

		<!-- Tab 切换 -->
		<div class="flex-1 overflow-hidden">
			<el-tabs v-model="currentTab" type="border-card" class="h-full tab-container">
				<el-tab-pane label="广场" name="square">
					<SquareTab />
				</el-tab-pane>
				<el-tab-pane label="考验" name="challenge">
					<ChallengeTab />
				</el-tab-pane>

				<el-tab-pane label="婚榜" name="marriage">
					<MarriageTab />
				</el-tab-pane>
			</el-tabs>
		</div>

		<!-- 发起结婚弹窗 -->
		<ProposalDialog ref="proposalDialogRef" @success="handleProposalSuccess" />
	</div>
</template>

<script setup>
import { ref, inject, onMounted,onActivated, computed } from 'vue'
import SquareTab from './SquareTab.vue'
import ChallengeTab from './ChallengeTab.vue'

import MarriageTab from './MarriageTab.vue'
import ProposalDialog from './ProposalDialog.vue'
import {getImageUrl} from '@/config/oss'

const game = inject('game')
const currentTab = ref('square')
const proposalDialogRef = ref(null)

// 检查玩家是否已�?
const isMarried = computed(() => {
	const proposals = game.player_marriage.data || []
	return proposals.some(p => p.status === 'married')
})

onMounted(async () => {
	await game.game_marriage.update()
	// 加载好友列表（用于发起结婚功能）
	await game.player_friend.update()
	// 加载求婚列表（用于显示等待列表）
	await game.player_marriage.update()
	// 加载戒指列表（用于发起求婚）
	await game.player_item_ring.update()
})


onActivated(async () => {
  await game.game_marriage.update()
  // 加载好友列表（用于发起结婚功能）
  await game.player_friend.update()
  // 加载求婚列表（用于显示等待列表）
  await game.player_marriage.update()
  // 加载戒指列表（用于发起求婚）
  await game.player_item_ring.update()
})

// 打开发起结婚弹窗
const handleProposal = () => {
	proposalDialogRef.value?.show()
}

// 发起结婚成功后的回调
const handleProposalSuccess = async () => {
	// 刷新求婚列表和戒指列�?
	await game.player_marriage.update()
	await game.player_item_ring.update()
}
</script>

<style scoped>
.tab-container :deep(.el-tabs__content) {
	height: calc(100% - 40px);
	overflow-y: auto;
}
</style>
