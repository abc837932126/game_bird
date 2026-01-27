<template>
	<el-dialog
			v-model="visible"
			:title="userInfo?.nickname || '用户信息'"
			width="90%"
			:close-on-click-modal="true"
			append-to-body
			top="5vh"
	>
		<div v-if="loading" class="text-center py-8">
			<el-icon class="is-loading" :size="40">
				<Loading/>
			</el-icon>
			<p class="mt-4 text-gray-500">加载中...</p>
		</div>

		<div v-else-if="userInfo" class="max-h-[70vh] overflow-y-auto">
			<!-- 头部信息 -->
			<div class="flex items-center gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
				<PlayerAvatar
						:player-id="userInfo.player_id || userInfo.id"
						:sex="userInfo.sex"
						:avatar-frame-id="userInfo.avatar_frame_id"
						:size="70"
				/>
				<div class="flex-1">
					<div class="text-lg font-bold">
						<span v-if="playerGuild" class="text-blue-600">[{{ playerGuild.guild_name }}] </span>{{ userInfo.nickname || userInfo.username }}
					</div>
					<div class="flex items-center gap-2 mt-1">
						<el-tag type="warning" size="small">Lv.{{ userInfo.lv }}</el-tag>
						<el-tag v-if="isFriend" type="success" size="small">好友</el-tag>
						<el-tag v-if="isFriend && userInfo.isOnline" type="success" size="small">在线</el-tag>
						<el-tag v-else-if="isFriend" type="info" size="small">离线</el-tag>
					</div>
				</div>
				<!-- 好友专属：亲密度和删除好友按钮 -->
				<div v-if="isFriend" class="flex flex-col items-end gap-2">
					<div class="flex items-center gap-2">
						<span class="text-gray-600 text-sm">亲密度</span>
						<span class="font-bold text-pink-600 text-xl">{{ userInfo.heart || 0 }}</span>
					</div>
					<el-button type="danger" size="small" @click="handleDelete">
						删除好友
					</el-button>
				</div>
			</div>

			<!-- Tab 导航 -->
			<el-tabs v-model="activeTab" class="user-detail-tabs">
				<!-- 挚友 Tab -->
				<el-tab-pane label="挚友" name="pairing">
					<PairingTab
							:friend-nest="friendNest"
							:friend-trains="friendTrains"
							:user-info="userInfo"
							:marriage-info="marriageInfo"
							:is-friend="isFriend"
							@refresh="refreshFriendNest"
					/>
				</el-tab-pane>

				<!-- 展馆 Tab -->
				<el-tab-pane label="展馆" name="exhibition">
					<ExhibitionTab :user-info="userInfo"/>
				</el-tab-pane>

				<!-- 资料 Tab -->
				<el-tab-pane label="资料" name="profile">
					<ProfileTab :user-info="userInfo" :is-friend="isFriend"/>
				</el-tab-pane>

				<!-- 天梯 Tab -->
				<el-tab-pane label="天梯" name="ladder">
					<LadderTab :lineup="lineup"/>
				</el-tab-pane>

				<!-- 队伍 Tab -->
				<el-tab-pane label="队伍" name="team">
					<TeamTab :team-info="teamInfo"/>
				</el-tab-pane>
			</el-tabs>
		</div>

		<template #footer>
			<div class="flex flex-col gap-2">
				<div class="flex gap-2">
					<el-button type="success" class="flex-1" @click="handleGiveGift">
						🎁 赠送礼物
					</el-button>
					<!-- 好友：发送消息 -->
					<el-button v-if="isFriend" type="primary" class="flex-1" @click="handleSendMessage">
						💬 发送消息
					</el-button>
					<!-- 非好友：添加好友 -->
					<el-button
							v-else
							type="primary"
							class="flex-1"
							@click="handleAddFriend"
							:loading="addingFriend"
					>
						➕ 添加好友
					</el-button>
				</div>
			<!-- 查看工会按钮 -->
			<el-button v-if="playerGuild" type="info" @click="handleViewGuild">
				🏰 查看工会
			</el-button>
		</div>
	</template>
	</el-dialog>

	<!-- 礼物赠送对话框 -->
	<GiftSendDialog ref="giftSendDialogRef"/>
	<GuildInfoDialog ref="guildInfoDialogRef"/>
</template>

<script setup>
import {ref, inject, computed} from 'vue'
import { message } from '@/game/notification-center'
import {Loading} from '@element-plus/icons-vue'
import PlayerAvatar from '../common/PlayerAvatar.vue'
import GiftSendDialog from '../common/GiftSendDialog.vue'
import GuildInfoDialog from '../guild/GuildInfoDialog.vue'
import PairingTab from './PairingTab.vue'
import ExhibitionTab from './ExhibitionTab.vue'
import ProfileTab from './ProfileTab.vue'
import LadderTab from './LadderTab.vue'
import TeamTab from './TeamTab.vue'

const game = inject('game')
const emit = defineEmits(['delete'])

const visible = ref(false)
const loading = ref(false)
const addingFriend = ref(false)
const userInfo = ref(null)
const lineup = ref([])
const friendNest = ref(null)
const friendTrains = ref([])
const marriageInfo = ref(null)
const playerGuild = ref(null)
const teamInfo = ref(null)
const giftSendDialogRef = ref(null)
const guildInfoDialogRef = ref(null)
const activeTab = ref('pairing') // 默认显示配对 tab

// 判断是否是好友
const isFriend = computed(() => {
	if (!userInfo.value || !game.player_friend.data) return false
	const targetId = userInfo.value.player_id || userInfo.value.id
	return game.player_friend.data.some(friend => friend.id === targetId)
})

// 刷新好友鸟巢信息
const refreshFriendNest = async () => {
	if (!userInfo.value) return
	try {
		const playerId = userInfo.value.player_id || userInfo.value.id
		const nestResponse = await game.player_nest.api.get_friend_nest({friend_id: playerId})
		if (nestResponse.code === 200 && nestResponse.data) {
			friendNest.value = nestResponse.data
		}

		// 获取训练场信息
		const trainResponse = await game.player_train.api.get_friend_trains({friend_id: playerId})
		if (trainResponse.code === 200 && trainResponse.data) {
			friendTrains.value = trainResponse.data
		}
	} catch (error) {
		console.error('刷新好友信息失败:', error)
	}
}

// 打开对话框
const open = async (userData) => {
	visible.value = true
	loading.value = true
	userInfo.value = userData
	lineup.value = []
	friendNest.value = null
	friendTrains.value = []
	marriageInfo.value = null
	playerGuild.value = null
	teamInfo.value = null

	try {
		const playerId = userData.player_id || userData.id

		// 获取完整的玩家信息（包括魅力值）
		const playerInfoResponse = await game.player.api.get_player_info(playerId)
		if (playerInfoResponse.code === 200 && playerInfoResponse.data) {
			// 合并完整的玩家信息
			userInfo.value = { ...userData, ...playerInfoResponse.data }
		}

		// 获取该玩家的天梯阵容
		const lineupResponse = await game.player_ladder_lineup.api.getPlayerLineup(playerId)
		if (lineupResponse.code === 200 && lineupResponse.data) {
			lineup.value = lineupResponse.data
		}

		// 获取婚姻信息（所有人可见）
		try {
			const marriageResponse = await game.player_marriage.api.getPlayerMarriage(playerId)
			if (marriageResponse.code === 200 && marriageResponse.data) {
				marriageInfo.value = marriageResponse.data
			}
		} catch (error) {
			console.error('获取婚姻信息失败:', error)
		}

		// 获取工会信息（所有人可见）
		try {
			const guildResponse = await game.guild.api.get_player_guild(playerId)
			if (guildResponse.code === 200 && guildResponse.data) {
				playerGuild.value = guildResponse.data
			}
		} catch (error) {
			console.error('获取工会信息失败:', error)
		}

		// 获取队伍信息（所有人可见）
		try {
			const teamResponse = await game.team.api.get_player_team(playerId)
			if (teamResponse.code === 200 && teamResponse.data) {
				teamInfo.value = teamResponse.data
			}
		} catch (error) {
			console.error('获取队伍信息失败:', error)
		}

		// 如果是好友，获取鸟巢信息和完整好友数据
		if (isFriend.value) {
			// 从好友列表中获取完整的好友信息（包含 heart 等字段）
			const friendData = game.player_friend.data.find(friend => friend.id === playerId)
			if (friendData) {
				// 合并好友数据到 userInfo，确保包含 heart 字段
				userInfo.value = {...userInfo.value, ...friendData}
			}

			try {
				const nestResponse = await game.player_nest.api.get_friend_nest({friend_id: playerId})
				if (nestResponse.code === 200 && nestResponse.data) {
					friendNest.value = nestResponse.data
				}
			} catch (error) {
				console.error('获取好友鸟巢失败:', error)
			}

			// 获取训练场信息
			try {
				const trainResponse = await game.player_train.api.get_friend_trains({friend_id: playerId})
				if (trainResponse.code === 200 && trainResponse.data) {
					friendTrains.value = trainResponse.data
				}
			} catch (error) {
				console.error('获取训练场信息失败:', error)
			}
		}
	} catch (error) {
		console.error('获取天梯阵容失败:', error)
	} finally {
		loading.value = false
	}
}

// 添加好友
const handleAddFriend = async () => {
	if (!userInfo.value) return

	addingFriend.value = true
	try {
		const playerId = userInfo.value.player_id || userInfo.value.id
		const response = await game.player_friend.api.add(playerId)
		if (response.code === 200) {
			message.success('好友申请已发送')
			// 刷新好友列表
			await game.player_friend.update()
		} else {
			message.error(response.msg || '添加好友失败')
		}
	} catch (error) {
		console.error('添加好友失败:', error)
		message.error('添加好友失败')
	} finally {
		addingFriend.value = false
	}
}

// 发送消息（功能待定）
const handleSendMessage = () => {
	message.info('私聊功能开发中...')
}

// 赠送礼物
const handleGiveGift = () => {
	if (!userInfo.value) return
	// 先关闭用户详情对话框
	visible.value = false
	// 延迟打开礼物对话框，确保用户详情对话框完全关闭
	setTimeout(() => {
		giftSendDialogRef.value?.open(userInfo.value)
	}, 100)
}

// 删除好友
const handleDelete = () => {
	visible.value = false
	emit('delete', userInfo.value)
}

// 查看工会
const handleViewGuild = () => {
	if (!playerGuild.value) return
	// 先关闭用户详情对话框
	visible.value = false
	// 延迟打开工会信息对话框，确保用户详情对话框完全关闭
	setTimeout(() => {
		guildInfoDialogRef.value?.show(playerGuild.value.guild_id)
	}, 100)
}

defineExpose({
	open
})
</script>

<style scoped>
.is-loading {
	animation: rotating 2s linear infinite;
}

@keyframes rotating {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}
</style>
