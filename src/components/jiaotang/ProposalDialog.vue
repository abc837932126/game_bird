<template>
	<el-dialog
		v-model="vis"
		title="发起结婚邀请"
		width="90%"
		:show-close="true"
	>
		<div class="flex flex-col gap-6">
			<!-- 步骤1：选择结婚对象 -->
			<div>
				<div class="mb-3 font-bold flex items-center gap-2">
					<span class="text-pink-500 text-xl">💑</span>
					<span>选择结婚对象</span>
				</div>

				<!-- 好友列表 -->
				<div v-if="friends.length > 0" class="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
					<div
						v-for="friend in friends"
						:key="friend.id"
						@click="selectedFriend = friend"
						:class="[
							'card p-3 cursor-pointer transition-all',
							selectedFriend?.id === friend.id ? 'border-2 border-pink-500 bg-pink-50' : 'hover:bg-gray-50'
						]"
					>
						<div class="flex items-center gap-3">
							<!-- 头像 -->
							<PlayerAvatar
								:player-id="friend.id"
								:sex="friend.sex"
								:avatar-frame-id="friend.avatar_frame_id"
								:size="50"
							/>

							<!-- 信息 -->
							<div class="flex-1">
								<div class="font-bold flex items-center gap-2">
									{{ friend.nickname }}
									<el-tag v-if="friend.online" type="success" size="small">在线</el-tag>
									<el-tag v-else type="info" size="small">离线</el-tag>
								</div>
								<div class="text-xs text-gray-500">Lv.{{ friend.level }}</div>
								<div class="text-xs text-pink-500">亲密度：{{ friend.intimacy }}</div>
							</div>

							<!-- 选中标记 -->
							<div v-if="selectedFriend?.id === friend.id" class="text-pink-500 text-xl">
								✓
							</div>
						</div>
					</div>
				</div>

				<!-- 空状态 -->
				<div v-else class="text-center py-8 text-gray-400">
					<div class="text-4xl mb-2">👥</div>
					<div>暂无好友</div>
				</div>
			</div>

			<!-- 步骤2：选择结婚道具 -->
			<div>
				<div class="mb-3 font-bold flex items-center gap-2">
					<span class="text-pink-500 text-xl">💎</span>
					<span>选择结婚道具</span>
				</div>

				<!-- 道具列表 -->
				<div v-if="marriageItems.length > 0" class="grid grid-cols-2 gap-3">
					<div
						v-for="item in marriageItems"
						:key="item.id"
						@click="selectedItem = item"
						:class="[
							'card p-3 cursor-pointer transition-all',
							selectedItem?.id === item.id ? 'border-2 border-pink-500 bg-pink-50' : 'hover:bg-gray-50'
						]"
					>
						<div class="flex items-center gap-3">
							<!-- 图标 -->
							<div class="text-3xl">{{ item.icon }}</div>

							<!-- 信息 -->
							<div class="flex-1">
								<div class="font-bold flex items-center gap-2">
									{{ item.name }}
									<el-tag :type="getQualityType(item.quality)" size="small">
										{{ item.quality }}
									</el-tag>
								</div>
								<div class="text-xs text-gray-500 mt-1">{{ item.desc }}</div>
								<div class="text-xs text-pink-500 mt-1">需要亲密度: {{ item.need_heart }}</div>
								<div class="text-xs text-gray-600 mt-1">数量：{{ item.count }}</div>
							</div>

							<!-- 选中标记 -->
							<div v-if="selectedItem?.id === item.id" class="text-pink-500 text-xl">
								✓
							</div>
						</div>
					</div>
				</div>

				<!-- 空状态 -->
				<div v-else class="text-center py-8 text-gray-400">
					<div class="text-4xl mb-2">💍</div>
					<div>暂无结婚道具</div>
					<div class="text-xs mt-1">请前往商店购买</div>
				</div>
			</div>

			<!-- 提示信息 -->
			<div class="bg-pink-50 p-3 rounded-lg text-sm text-gray-600">
				<div class="font-bold mb-1 text-pink-600">💡 温馨提示</div>
				<div>1. 发起邀请后，对方需要同意才能正式结婚</div>
				<div>2. 使用戒指需要满足亲密度要求</div>
				<div>3. 戒指将在发起求婚时立即消耗</div>
				<div>4. 对方同意后可开始婚礼，举办24小时婚礼供所有玩家送祝福</div>
			</div>

			<!-- 按钮组 -->
			<div class="flex justify-end gap-4">
				<el-button @click="vis = false">取消</el-button>
				<el-button
					type="primary"
					@click="handleSubmit"
					:disabled="!selectedFriend || !selectedItem"
				>
					发送邀请
				</el-button>
			</div>
		</div>
	</el-dialog>
</template>

<script setup>
import { ref, inject, computed } from 'vue'
import { message } from '@/game/notification-center'
import PlayerAvatar from '../common/PlayerAvatar.vue'

const game = inject('game')
const emit = defineEmits(['success'])

const vis = ref(false)
const selectedFriend = ref(null)
const selectedItem = ref(null)

// 获取好友列表
const friends = computed(() => {
	const friendList = game.player_friend.data || []

	// 数据适配：将真实API数据转换为组件所需格式
	return friendList.map(friend => ({
		id: friend.id,
		nickname: friend.nickname || friend.username,
		sex: friend.sex,
		avatar_frame_id: friend.avatar_frame_id,
		level: friend.lv,
		online: friend.isOnline,
		intimacy: friend.heart
	}))
})

// 获取结婚道具列表（从玩家背包中的戒指）
const marriageItems = computed(() => {
	const rings = game.player_item_ring.data || []
	// 转换为组件所需格式
	return rings.map(ring => ({
		id: ring.id, // player_item_ring的ID
		game_item_ring_id: ring.game_item_ring_id, // game_item_ring的ID
		name: ring.game_item_ring?.nickname || '未知戒指',
		desc: ring.game_item_ring?.desc || '',
		need_heart: ring.game_item_ring?.need_heart || 0,
		count: ring.count || 0,
		icon: '💍',
		quality: getQualityByHeart(ring.game_item_ring?.need_heart || 0)
	})).filter(ring => ring.count > 0) // 只显示有数量的戒指
})

// 根据亲密度需求判断品质
const getQualityByHeart = (needHeart) => {
	if (needHeart >= 1000) return '传说'
	if (needHeart >= 500) return '史诗'
	if (needHeart >= 100) return '稀有'
	return '普通'
}

// 根据品质返回Tag类型
const getQualityType = (quality) => {
	const typeMap = {
		'传说': 'danger',
		'史诗': 'warning',
		'稀有': 'primary',
		'普通': 'info'
	}
	return typeMap[quality] || 'info'
}

// 显示弹窗
const show = () => {
	selectedFriend.value = null
	selectedItem.value = null
	vis.value = true
}

// 提交邀请
const handleSubmit = async () => {
	if (!selectedFriend.value) {
		message.warning('请选择结婚对象')
		return
	}

	if (!selectedItem.value) {
		message.warning('请选择结婚道具')
		return
	}

	// 检查亲密度是否满足要求
	if (selectedFriend.value.intimacy < selectedItem.value.need_heart) {
		message.warning(`亲密度不足！需要${selectedItem.value.need_heart}点，当前${selectedFriend.value.intimacy}点`)
		return
	}

	try {
		// 调用真实API
		const res = await game.player_marriage.api.propose(
			selectedFriend.value.id,
			selectedItem.value.id // player_item_ring的ID
		)

		if (res.code === 200) {
			message.success(`已向 ${selectedFriend.value.nickname} 发送结婚邀请！`)
			// 刷新数据
			await game.player_item_ring.update()
			vis.value = false
			emit('success')
		} else {
			message.error(res.msg || '发送邀请失败')
		}
	} catch (error) {
		message.error('发送邀请失败，请稍后再试')
	}
}

defineExpose({
	show
})
</script>

<style scoped>


</style>
