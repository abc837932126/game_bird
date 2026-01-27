<template>
	<div class="h-full flex flex-col p-4">
		<!-- 顶部图片 -->
		<div class="mb-4 rounded-lg overflow-hidden">
			<el-image
				:src="getImageUrl('bg', '好友')"
				fit="cover"
				class="w-full h-38"
				loading="lazy"
			>
				<template #error>
					<div class="h-38 bg-linear-to-r from-pink-400 via-purple-400 to-red-400
					            flex items-center justify-center">
						<span class="text-8xl">⛪</span>
					</div>
				</template>
			</el-image>
		</div>

		<!-- 顶部操作栏 -->
		<div class="mb-4 flex justify-between items-center">

			共 {{ friends.length }} 位好友

			<div class="flex gap-2">
				<!-- 好友申请按钮 -->
				<el-badge :value="pendingCount" :hidden="pendingCount === 0" type="danger">
					<el-button @click="handleViewRequests">
						<span>📬 好友申请</span>
					</el-button>
				</el-badge>

				<el-button type="primary" @click="handleAddFriend">
					<span>➕ 添加好友</span>
				</el-button>
			</div>
		</div>

		<!-- 好友列表 -->
		<div v-if="friends.length > 0" class="flex-1 overflow-y-auto">
			<div class="grid grid-cols-1 gap-2">
				<FriendCard v-for="friend in friends"
					:key="friend.id"
					:friend="friend"
					@view-detail="handleViewDetail"
					@delete="handleDeleteFriend"
				/>
			</div>
		</div>

		<!-- 空状态 -->
		<div v-else class="text-center py-16 text-gray-400">
			<div class="text-6xl mb-4">👥</div>
			<div class="text-lg mb-2">还没有好友</div>
			<div class="text-sm mb-4">赶快添加好友一起冒险吧！</div>
			<el-button type="primary" @click="handleAddFriend">
				添加好友
			</el-button>
		</div>

		<!-- 添加好友弹窗 -->
		<AddFriendDialog ref="addFriendDialogRef" />

		<!-- 好友申请弹窗 -->
		<FriendRequestDialog ref="friendRequestDialogRef"/>

		<!-- 好友详情弹窗 -->
		<UserDetailDialog ref="friendDetailDialogRef" @delete="handleDeleteFriend"/>
	</div>
</template>

<script setup>
import {inject, computed, ref, onMounted} from 'vue'
import { ElMessageBox, ElBadge} from 'element-plus'
import { message } from '@/game/notification-center'

import FriendCard from './FriendCard.vue'
import AddFriendDialog from './AddFriendDialog.vue'
import FriendRequestDialog from './FriendRequestDialog.vue'
import UserDetailDialog from '../UserDetailDialog/index.vue'
import {getImageUrl} from '@/config/oss'

const game = inject('game')
const addFriendDialogRef = ref(null)
const friendRequestDialogRef = ref(null)
const friendDetailDialogRef = ref(null)

// 获取好友列表
const friends = computed(() => {
	return game.player_friend.data || []
})

// 获取待处理申请数量
const pendingCount = computed(() => {
	return game.player_friend.pendingCount || 0
})

// 页面加载时刷新好友列表和待处理申请
onMounted(async () => {
	await Promise.all([
		game.player_friend.update(),
		game.player_friend.updatePending()
	])
})

// 打开添加好友弹窗
const handleAddFriend = () => {
	addFriendDialogRef.value?.show()
}

// 打开好友申请列表
const handleViewRequests = () => {
	friendRequestDialogRef.value?.show()
}

// 查看好友详情
const handleViewDetail = (friend) => {
	friendDetailDialogRef.value?.open(friend)
}

// 删除好友
const handleDeleteFriend = async (friend) => {
	try {
		await ElMessageBox.confirm(
			`确定要删除好友 "${friend.nickname || friend.username}" 吗？`,
			'删除好友',
			{
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}
		)

		// 调用删除好友API
		const res = await game.player_friend.api.delete(friend.friendship_id)
		if (res.code === 200) {
			message.success('删除成功')
			await game.player_friend.update()
		} else {
			message.error(res.msg || '删除失败')
		}
	} catch (error) {
		if (error !== 'cancel') {
			message.error('删除失败')
		}
	}
}



</script>

<style scoped>
</style>
