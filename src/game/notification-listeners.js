import { ElNotification } from 'element-plus'
import { markRaw } from 'vue'
import { game } from './index.js'

/**
 * 全局通知监听器注册
 * 在应用启动时统一注册所有通知监听器
 */

// ============ 鸟巢通知 ============

// 鸟巢更新通知
const handleNestUpdate = async (message) => {
	// 当好友在我的巢穴设置鸟时，收到通知并刷新
	if (message.data?.nest_owner_id === game.player.data?.id) {
		await game.player_nest.update()
		// 显示通知提示
		ElNotification({
			title: '鸟巢更新',
			message: '好友在你的鸟巢放置了鸟',
			type: 'info',
			duration: 3000
		})
	}
}

// ============ 好友通知 ============

// 好友申请通知
const handleFriendRequest = async (message) => {
	// 刷新待处理申请数量
	await game.player_friend.updatePending()

	// 显示通知
	ElNotification({
		title: message.data.title || '新好友申请',
		message: message.data.message || '收到新的好友申请',
		type: 'info',
		duration: 5000,
		onClick: () => {
			// 点击通知可以跳转到好友页面
			if (game.page !== 'page_friend') {
				game.page = 'page_friend'
			}
		}
	})
}

// 好友接受通知
const handleFriendAccepted = async (message) => {
	// 刷新好友列表
	await game.player_friend.update()

	// 显示通知
	ElNotification({
		title: message.data.title || '好友申请已通过',
		message: message.data.message || '你的好友申请已被接受',
		type: 'success',
		duration: 5000
	})
}

// ============ 婚姻通知（预留） ============

// 婚姻提议通知
const handleMarriageProposal = async (message) => {
	// 刷新婚姻数据
	await game.player_marriage.update()

	ElNotification({
		title: message.data.title || '收到求婚',
		message: message.data.message || '收到新的求婚',
		type: 'warning',
		duration: 5000,
		onClick: () => {
			// 点击通知跳转到教堂页面
			if (game.page !== 'page_jiaotang') {
				game.page = 'page_jiaotang'
			}
		}
	})
}

// 婚姻接受通知
const handleMarriageAccepted = async (message) => {
	// 刷新婚姻数据
	await game.player_marriage.update()

	ElNotification({
		title: message.data.title || '求婚已被接受',
		message: message.data.message || '对方接受了你的求婚！',
		type: 'success',
		duration: 5000
	})
}

// 婚姻拒绝通知
const handleMarriageRejected = async (message) => {
	// 刷新婚姻数据
	await game.player_marriage.update()

	ElNotification({
		title: message.data.title || '求婚被拒绝',
		message: message.data.message || '对方拒绝了你的求婚',
		type: 'error',
		duration: 5000
	})
}

// 婚姻取消通知
const handleMarriageCancelled = async (message) => {
	// 刷新婚姻数据
	await game.player_marriage.update()

	ElNotification({
		title: message.data.title || '求婚已取消',
		message: message.data.message || '对方取消了求婚',
		type: 'info',
		duration: 5000
	})
}

// 婚礼开始通知
const handleWeddingStarted = async (message) => {
	// 刷新婚姻数据
	await game.player_marriage.update()
	await game.game_marriage.update()

	ElNotification({
		title: message.data.title || '婚礼开始',
		message: message.data.message || '你们的婚礼已经开始！',
		type: 'success',
		duration: 5000
	})
}

// 离婚通知
const handleDivorce = async (message) => {
	// 刷新婚姻数据
	await game.player_marriage.update()

	ElNotification({
		title: '离婚通知',
		message: `${message.data.proposer_nickname} 和 ${message.data.receiver_nickname} 已经离婚`,
		type: 'info',
		duration: 5000
	})
}

// 祝福收到通知
const handleBlessingReceived = async (message) => {
	// 刷新婚礼数据
	await game.game_marriage.update()

	// 显示通知
	const giftInfo = message.data.gift_received > 0
		? `（获得礼金 ${message.data.gift_received} 金币）`
		: ''

	ElNotification({
		title: '收到祝福',
		message: `${message.data.player_nickname} 送出了祝福${giftInfo}`,
		type: 'success',
		duration: 3000
	})
}

// ============ 训练通知（预留） ============

// 训练完成通知
const handleTrainingComplete = async (message) => {
	// TODO: 实现训练完成通知逻辑
	await game.player_train.update()
	ElNotification({
		title: message.data.title || '训练完成',
		message: message.data.message || '你的鸟训练完成了',
		type: 'success',
		duration: 5000
	})
}

// ============ 捕获通知（预留） ============

// 陷阱就绪通知
const handleTrapReady = async (message) => {
	// TODO: 实现陷阱就绪通知逻辑
	await game.player_trap.update()
	ElNotification({
		title: message.data.title || '陷阱就绪',
		message: message.data.message || '你的陷阱已就绪',
		type: 'info',
		duration: 5000
	})
}

// 捕获成功通知
const handleTrapCaught = async (message) => {
	// TODO: 实现捕获成功通知逻辑
	await game.player_trap.update()
	ElNotification({
		title: message.data.title || '捕获成功',
		message: message.data.message || '你的陷阱捕获到了鸟',
		type: 'success',
		duration: 5000
	})
}

// 配对开始通知
const handleNestPairingStarted = async (message) => {
	// 刷新鸟巢信息
	await game.player_nest.update()
	ElNotification({
		title: message.data.title || '配对开始',
		message: message.data.message || '好友开始与你的鸟配对',
		type: 'info',
		duration: 5000
	})
}

// 配对完成通知
const handleNestPairingComplete = async (message) => {
	// TODO: 实现配对完成通知逻辑
	await game.player_nest.update()
	ElNotification({
		title: message.data.title || '配对完成',
		message: message.data.message || '你的鸟配对完成了',
		type: 'success',
		duration: 5000
	})
}

// ============ 系统通知（预留） ============

// 系统公告通知
const handleSystemAnnouncement = async (message) => {
	ElNotification({
		title: message.data.title || '系统公告',
		message: message.data.message || '有新的系统公告',
		type: 'info',
		duration: 10000,
		showClose: true
	})
}

// 系统维护通知
const handleSystemMaintenance = async (message) => {
	ElNotification({
		title: message.data.title || '系统维护',
		message: message.data.message || '系统将进行维护',
		type: 'warning',
		duration: 0, // 不自动关闭
		showClose: true
	})
}

// ============ 礼物和红包通知 ============

// 礼物和红包广播消息处理器（监听世界聊天广播）
const handleGiftBroadcast = async (message) => {
	const data = message.data

	// 如果是礼物消息且礼物数据未加载，先加载礼物数据
	if (data.type === 'gift' && !game.game_item_gift.data) {
		await game.game_item_gift.update()
	}

	// 1. 添加所有类型的消息到聊天列表
	const messageId = data.id
	if (!game.player_chat.lastMessageIds.has(messageId)) {
		game.player_chat.lastMessageIds.add(messageId)
		// 使用 markRaw 防止 Vue 将消息对象深度响应式化，减少内存占用
		game.player_chat.data.push(markRaw(data))

		// 限制消息数量（最多保留 50 条，减少内存占用）
		if (game.player_chat.data.length > 50) {
			const removed = game.player_chat.data.shift()
			// console.log('[聊天] 移除最旧的消息，ID:', removed?.id, 'player_id:', removed?.player_id)
			if (removed && removed.id) {
				game.player_chat.lastMessageIds.delete(removed.id)
				// 冻结删除的消息对象，帮助垃圾回收
				Object.freeze(removed)
			}
		}
	}

	// 2. 只为礼物和红包显示桌面通知
	if (data.type === 'gift') {
		ElNotification({
			title: '', // 不显示标题
			message: data.message, // 直接使用服务端返回的message，单行显示
			type: 'success',
			duration: 5000,
			position: 'top-right',
			onClick: () => {
				// 点击通知跳转到聊天页面
				game.page = 'page_chat'
			}
		})
	} else if (data.type === 'red_packet') {
		ElNotification({
			title: '新红包',
			message: `${data.sender_username} 发了一个红包`,
			type: 'warning',
			duration: 5000,
			position: 'top-right',
			onClick: () => {
				game.page = 'page_chat'
			}
		})
	}
	// 注意：在聊天页面时，除了通知外，消息还会由 chat/index.vue 的 watch 处理
}

// ============ 红包状态更新 ============

// 红包状态更新处理器
const handleRedPacketStatusUpdate = async (message) => {
	const data = message.data


	// 查找聊天列表中对应的红包消息并更新
	const redPacketMsg = game.player_chat.data.find(
		msg => msg.type === 'red_packet' && msg.red_packet_id === data.red_packet_id
	)

	if (redPacketMsg) {
		// 更新红包状态
		redPacketMsg.remaining_amount = data.remaining_amount
		redPacketMsg.remaining_count = data.remaining_count
		redPacketMsg.status = data.status
		// console.log('[通知] 红包状态已更新:', redPacketMsg)
	}
}

// ============ 工会通知 ============

// 工会解散通知
const handleGuildDisbanded = async (message) => {
	// 清除工会数据
	if (game.guild) {
		game.guild.data = null
	}
	if (game.guild_member) {
		game.guild_member.data = []
	}

	ElNotification({
		title: '工会已解散',
		message: '您所在的工会已被解散',
		type: 'warning',
		duration: 5000
	})

	// 如果当前在工会页面，跳转到主页
	if (game.page === 'page_guild') {
		game.page = 'page_home'
	}
}

// 工会成员加入通知
const handleGuildMemberJoined = async (message) => {
	// 刷新工会成员列表
	if (game.guild_member) {
		await game.guild_member.update()
	}
	if (game.guild) {
		await game.guild.update()
	}
}

// 工会成员离开通知
const handleGuildMemberLeft = async (message) => {
	// 刷新工会成员列表
	if (game.guild_member) {
		await game.guild_member.update()
	}
	if (game.guild) {
		await game.guild.update()
	}
}

// 工会成员被踢出通知
const handleGuildMemberKicked = async (message) => {
	// 清除工会数据
	if (game.guild) {
		game.guild.data = null
	}
	if (game.guild_member) {
		game.guild_member.data = []
	}

	ElNotification({
		title: '您已被踢出工会',
		message: '您已被工会管理员踢出',
		type: 'warning',
		duration: 5000
	})

	// 如果当前在工会页面，跳转到主页
	if (game.page === 'page_guild') {
		game.page = 'page_home'
	}
}

// 工会公告更新通知
const handleGuildAnnouncementUpdated = async (message) => {
	// 刷新工会信息
	if (game.guild) {
		await game.guild.update()
	}

	ElNotification({
		title: '工会公告已更新',
		message: '工会发布了新公告',
		type: 'info',
		duration: 3000
	})
}

// 工会申请通知
const handleGuildApplicationReceived = async (message) => {
	// 刷新工会申请列表
	if (game.guild_application && game.guild.data?.id) {
		await game.guild_application.updateGuildApplications(game.guild.data.id)
	}

	ElNotification({
		title: '新的入会申请',
		message: '收到新的入会申请',
		type: 'info',
		duration: 5000
	})
}

// 工会申请被接受通知
const handleGuildApplicationAccepted = async (message) => {
	// 刷新工会数据
	await game.guild.update()

	ElNotification({
		title: '申请已通过',
		message: `您已加入工会：${message.data.guild_name}`,
		type: 'success',
		duration: 5000
	})
}

/**
 * 注册所有通知监听器
 * 在应用启动时调用一次
 */
export function registerAllNotifications() {
	const nc = game.notificationCenter

	console.log('[Notifications] 注册所有通知监听器...')

	// 鸟巢通知
	nc.on('player_nest', 'nest_updated', handleNestUpdate)
	nc.on('player_nest', 'nest_pairing_started', handleNestPairingStarted)
	nc.on('player_nest', 'nest_pairing_complete', handleNestPairingComplete)

	// 好友通知
	nc.on('player_friend', 'friend_request', handleFriendRequest)
	nc.on('player_friend', 'friend_accepted', handleFriendAccepted)

	// 婚姻通知（预留）
	nc.on('player_marriage', 'marriage_proposal', handleMarriageProposal)
	nc.on('player_marriage', 'marriage_accepted', handleMarriageAccepted)
	nc.on('player_marriage', 'marriage_rejected', handleMarriageRejected)
	nc.on('player_marriage', 'marriage_cancelled', handleMarriageCancelled)
	nc.on('player_marriage', 'wedding_started', handleWeddingStarted)
	nc.on('player_marriage', 'divorce_announced', handleDivorce)
	nc.on('player_marriage', 'blessing_received', handleBlessingReceived)

	// 训练通知（预留）
	nc.on('player_train', 'training_complete', handleTrainingComplete)

	// 捕获通知（预留）
	nc.on('player_trap', 'trap_ready', handleTrapReady)
	nc.on('player_trap', 'trap_caught', handleTrapCaught)

	// 系统通知（预留）
	nc.on('system', 'system_announcement', handleSystemAnnouncement)
	nc.on('system', 'system_maintenance', handleSystemMaintenance)

	// 礼物通知（监听世界聊天广播）
	nc.on('chat', 'world_message', handleGiftBroadcast)

	// 红包状态更新通知
	nc.on('player_red_packet', 'status_updated', handleRedPacketStatusUpdate)

	// 工会通知
	nc.on('notification', 'guild_disbanded', handleGuildDisbanded)
	nc.on('notification', 'guild_member_joined', handleGuildMemberJoined)
	nc.on('notification', 'guild_member_left', handleGuildMemberLeft)
	nc.on('notification', 'guild_member_kicked', handleGuildMemberKicked)
	nc.on('notification', 'guild_announcement_updated', handleGuildAnnouncementUpdated)
	nc.on('notification', 'guild_application_received', handleGuildApplicationReceived)
	nc.on('notification', 'guild_application_accepted', handleGuildApplicationAccepted)

	console.log('[Notifications] 所有通知监听器注册完成')
}

/**
 * 取消注册所有通知监听器
 * 在应用关闭时调用（可选）
 */
export function unregisterAllNotifications() {
	const nc = game.notificationCenter

	console.log('[Notifications] 取消注册所有通知监听器...')

	// 鸟巢通知
	nc.off('player_nest', 'nest_updated', handleNestUpdate)
	nc.off('player_nest', 'nest_pairing_started', handleNestPairingStarted)
	nc.off('player_nest', 'nest_pairing_complete', handleNestPairingComplete)

	// 好友通知
	nc.off('player_friend', 'friend_request', handleFriendRequest)
	nc.off('player_friend', 'friend_accepted', handleFriendAccepted)

	// 婚姻通知
	nc.off('player_marriage', 'marriage_proposal', handleMarriageProposal)
	nc.off('player_marriage', 'marriage_accepted', handleMarriageAccepted)
	nc.off('player_marriage', 'marriage_rejected', handleMarriageRejected)
	nc.off('player_marriage', 'marriage_cancelled', handleMarriageCancelled)
	nc.off('player_marriage', 'wedding_started', handleWeddingStarted)
	nc.off('player_marriage', 'divorce_announced', handleDivorce)

	// 训练通知
	nc.off('player_train', 'training_complete', handleTrainingComplete)

	// 捕获通知
	nc.off('player_trap', 'trap_ready', handleTrapReady)
	nc.off('player_trap', 'trap_caught', handleTrapCaught)

	// 系统通知
	nc.off('system', 'system_announcement', handleSystemAnnouncement)
	nc.off('system', 'system_maintenance', handleSystemMaintenance)

	// 礼物通知
	nc.off('chat', 'world_message', handleGiftBroadcast)

	// 红包状态更新通知
	nc.off('player_red_packet', 'status_updated', handleRedPacketStatusUpdate)

	// 工会通知
	nc.off('notification', 'guild_disbanded', handleGuildDisbanded)
	nc.off('notification', 'guild_member_joined', handleGuildMemberJoined)
	nc.off('notification', 'guild_member_left', handleGuildMemberLeft)
	nc.off('notification', 'guild_member_kicked', handleGuildMemberKicked)
	nc.off('notification', 'guild_announcement_updated', handleGuildAnnouncementUpdated)
	nc.off('notification', 'guild_application_received', handleGuildApplicationReceived)
	nc.off('notification', 'guild_application_accepted', handleGuildApplicationAccepted)

	console.log('[Notifications] 所有通知监听器已取消注册')
}
