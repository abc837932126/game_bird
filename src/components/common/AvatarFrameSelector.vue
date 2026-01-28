<template>
	<el-dialog v-model="visible" title="选择头像框" width="90%" :style="{ maxWidth: '500px' }">
		<div class="frame-grid">
			<!-- 无头像框选项 -->
			<div
				class="frame-item"
				:class="{ selected: currentFrameId === null }"
				@click="selectFrame(null)"
			>
				<div class="frame-preview no-frame">
					<span>无头像框</span>
				</div>
			</div>

			<!-- 头像框列表 -->
			<div
				v-for="frame in game.game_avatar_frame.data"
				:key="frame.id"
				class="frame-item"
				:class="{ selected: currentFrameId === frame.id }"
				@click="selectFrame(frame.id)"
			>
				<div class="frame-preview">
					<img
						:src="game.game_avatar_frame.getFrameImageUrl(frame.nickname)"
						:alt="frame.nickname"
					/>
				</div>
				<div class="frame-name">{{ frame.nickname }}</div>
			</div>
		</div>

		<template #footer>
			<el-button @click="visible = false">取消</el-button>
			<el-button type="primary" @click="confirmSelect" :loading="loading">
				确定
			</el-button>
		</template>
	</el-dialog>
</template>

<script setup>
import { ref, inject } from 'vue'
import { message } from '@/game/notification-center'

const game = inject('game')
const visible = ref(false)
const currentFrameId = ref(null)
const loading = ref(false)

const open = async (frameId) => {
	currentFrameId.value = frameId
	visible.value = true
	// 从服务器获取最新的头像框列表
	await game.game_avatar_frame.update()
}

const selectFrame = (frameId) => {
	currentFrameId.value = frameId
}

const confirmSelect = async () => {
	loading.value = true
	try {
		const response = await game.player_avatar_frame.setFrame(currentFrameId.value)
		if (response.code === 200) {
			// 更新玩家数据
			game.player.data.avatar_frame_id = currentFrameId.value
			message.success('更换成功')
			visible.value = false
		} else {
			message.error(response.msg || '更换失败')
		}
	} catch (error) {
		message.error('更换失败')
	} finally {
		loading.value = false
	}
}

defineExpose({ open })
</script>

<style scoped>
.frame-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 8px;
	max-height: 400px;
	overflow-y: auto;
}

.frame-item {
	cursor: pointer;
	border: 2px solid transparent;
	border-radius: 6px;
	padding: 4px;
	transition: all 0.2s;
}

.frame-item:hover {
	border-color: #409eff;
	background: #f0f9ff;
}

.frame-item.selected {
	border-color: #409eff;
	background: #e6f7ff;
}

.frame-preview {
	width: 100%;
	aspect-ratio: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	border-radius: 4px;
	background: #f5f5f5;
}

.frame-preview img {
	width: 100%;
	height: 100%;
	object-fit: contain;
}

.frame-preview.no-frame {
	border: 2px dashed #ccc;
}

.frame-name {
	text-align: center;
	margin-top: 4px;
	font-size: 11px;
}
</style>
