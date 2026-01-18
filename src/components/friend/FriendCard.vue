<template>
	<el-card body-class="p-1! cursor-pointer" class="friend-card " @click="$emit('view-detail', friend)">
		<div class="flex items-center gap-2">
			<!-- 头像 -->
			<PlayerAvatar
				:player-id="friend.id"
				:sex="friend.sex"
				:avatar-frame-id="friend.avatar_frame_id"
				:size="70"
			/>

			<!-- 好友信息 -->
			<div class="flex-1">
				<!-- 昵称和在线状态 -->
				<div class="flex items-center gap-2 mb-2">
					<span class="font-bold text-lg">{{ friend.nickname || friend.username }}</span>
					<el-tag v-if="friend.isOnline" type="success" size="small">在线</el-tag>
					<el-tag v-else type="info" size="small">离线</el-tag>
				</div>

				<!-- 基本信息 -->
				<div class="grid grid-cols-2 gap-2 text-sm text-gray-600">
					<div>
						<span class="text-gray-500">等级：</span>
						<span class="font-semibold">Lv.{{ friend.lv }}</span>
					</div>
					<div>
						<span class="text-gray-500">亲密度：</span>
						<span class="font-semibold text-pink-500">{{ friend.heart || 0 }}</span>
					</div>
				</div>
			</div>

			<!-- 操作按钮 -->
			<div class="flex flex-col gap-2 shrink-0 w-20 items-stretch">
				<el-button type="primary" size="small" @click.stop="$emit('view-detail', friend)" >
					详情
				</el-button>
				<el-button type="danger" size="small" @click.stop="$emit('delete', friend)" >
					删除
				</el-button>
			</div>
		</div>
	</el-card>
</template>

<script setup>

import PlayerAvatar from '../common/PlayerAvatar.vue'

const props = defineProps({
	friend: { type: Object, required: true }
})

defineEmits(['view-detail', 'delete'])


</script>

<style scoped>


/* 强制按钮对齐，移除所有可能的偏移 */
.friend-card :deep(.el-button) {
	display: block;
	width: 100%;
	margin: 0 !important;
	padding-left: 0 !important;
	padding-right: 0 !important;
	text-align: center;
	box-sizing: border-box;
}

.friend-card :deep(.el-button span) {
	display: block;
	width: 100%;
	text-align: center;
}
</style>
