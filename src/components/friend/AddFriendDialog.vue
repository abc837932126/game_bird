<template>
	<el-dialog
		v-model="vis"
		title="添加好友"
		width="90%"
		:show-close="true"
	>
		<div class="flex flex-col gap-4">
			<!-- 搜索框 -->
			<div>
				<div class="mb-2 text-sm text-gray-600">输入好友ID或昵称：</div>
				<div class="flex gap-2">
					<el-input v-model="searchKeyword" placeholder="请输入玩家ID或昵称" clearable @keyup.enter="handleSearch" />
					<el-button type="primary" @click="handleSearch">
						搜索
					</el-button>
				</div>
			</div>

			<!-- 搜索结果 -->
			<div v-if="searchResults.length > 0" class="mt-4">
				<div class="mb-2 font-bold">搜索结果：</div>

				<div class="space-y-2">
					<el-card v-for="player in searchResults" :key="player.id" class="search-result-card">
						<div class="flex items-center gap-4">
							<!-- 头像 -->
							<PlayerAvatar
								:player-id="player.id"
								:sex="player.sex"
								:avatar-frame-id="player.avatar_frame_id"
								:size="64"
							/>

							<!-- 玩家信息 -->
							<div class="flex-1">
								<div class="font-bold text-lg mb-1">
									{{ player.nickname }}
								</div>
								<div class="text-sm text-gray-600">
									ID: {{ player.id }} | 等级: Lv.{{ player.lv }}
								</div>
								<div v-if="player.game_title" class="text-xs text-blue-500 mt-1">
									{{ player.game_title.nickname }}
								</div>
							</div>

							<!-- 添加按钮 -->
							<el-button
								type="primary"
								@click="handleAddFriend(player)"
								:disabled="isAlreadyFriend(player.id)"
							>
								{{ isAlreadyFriend(player.id) ? '已是好友' : '申请好友' }}
							</el-button>
						</div>
					</el-card>
				</div>

				<!-- 分页 -->
				<div v-if="pagination.total_pages > 1" class="mt-4 flex justify-center">
					<el-pagination
						small
						background
						layout="prev, pager, next"
						:current-page="pagination.current_page"
						:page-size="pagination.page_size"
						:total="pagination.total_count"
						@current-change="handlePageChange"
					/>
				</div>
			</div>

			<!-- 未找到提示 -->
			<div v-else-if="searched && searchResults.length === 0" class="text-center py-8 text-gray-400">
				<div class="text-4xl mb-2">🔍</div>
				<div>未找到该玩家</div>
			</div>

			<!-- 提示信息 -->
			<div class="bg-blue-50 p-3 rounded-lg text-sm text-gray-600">
				<div class="font-bold mb-1 text-blue-600">💡 提示</div>
				<div>1. 可以通过玩家ID或昵称搜索</div>
				<div>2. 添加好友后可以一起冒险、聊天互动</div>
				<div>3. 提升亲密度可以解锁更多互动功能</div>
			</div>
		</div>

		<!-- 底部按钮 -->
		<template #footer>
			<el-button @click="vis = false">关闭</el-button>
		</template>
	</el-dialog>
</template>

<script setup>
import { ref, inject } from 'vue'
import { message } from '@/game/notification-center'
import { getImageUrl } from '@/config/oss'
import PlayerAvatar from '../common/PlayerAvatar.vue'

const game = inject('game')


const vis = ref(false)
const searchKeyword = ref('')
const searchResults = ref([])

const searched = ref(false)
const pagination = ref({
	current_page: 1,
	page_size: 5,
	total_count: 0,
	total_pages: 0
})

// 判断是否已经是好友
const isAlreadyFriend = (playerId) => {
	const friends = game.player_friend.data || []
	return friends.some(f => f.id === playerId)
}

// 显示弹窗
const show = () => {
	searchKeyword.value = ''
	searchResults.value = []
	searched.value = false
	pagination.value = {
		current_page: 1,
		page_size: 5,
		total_count: 0,
		total_pages: 0
	}
	vis.value = true
}

// 搜索玩家
const handleSearch = async (page = 1) => {
	if (!searchKeyword.value.trim()) {
		message.warning('请输入玩家ID或昵称')
		return
	}


	searched.value = true

	try {
		const res = await game.player.api.search(searchKeyword.value, page)
		if (res.code === 200) {
			searchResults.value = res.data.players || []
			pagination.value = res.data.pagination || {
				current_page: 1,
				page_size: 5,
				total_count: 0,
				total_pages: 0
			}
		} else {
			message.error(res.msg || '搜索失败')
			searchResults.value = []
		}
	} catch (error) {
		message.error('搜索失败')
		searchResults.value = []
	}


}

// 分页切换
const handlePageChange = (page) => {
	handleSearch(page)
}

// 添加好友
const handleAddFriend = async (player) => {
	if (!player) return

	try {
		const res = await game.player_friend.api.add(player.id)
		if (res.code === 200) {
			message.success('好友申请成功！')
			// 更新好友列表
			await game.player_friend.update()
			vis.value = false

		} else {
			message.error(res.msg || '申请友失败')
		}
	} catch (error) {
		message.error('申请好友失败')
	}
}

defineExpose({
	show
})
</script>

<style scoped>
.search-result-card {
	transition: all 0.3s ease;
}

.search-result-card:hover {
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
