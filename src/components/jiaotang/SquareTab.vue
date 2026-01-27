<template>
	<div>
		<!-- 当前婚姻状态 -->
		<div v-if="currentMarriage" class="mb-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border-2 border-pink-200">
			<div class="flex items-center justify-between p-1!">
				<div class="flex items-center gap-4">
					<div class="text-center">
						<PlayerAvatar
							:player-id="currentMarriage.proposer.id"
							:sex="currentMarriage.proposer.sex"
							:avatar-frame-id="currentMarriage.proposer.avatar_frame_id"
							:size="60"
						/>
						<div class="text-sm font-bold " :class="currentMarriage.proposer.sex?'text-blue-500':'text-pink-500'">{{ currentMarriage.proposer.nickname }}</div>
					</div>
					<div class="text-2xl">💕</div>
					<div class="text-center">
						<PlayerAvatar
							:player-id="currentMarriage.receiver.id"
							:sex="currentMarriage.receiver.sex"
							:avatar-frame-id="currentMarriage.receiver.avatar_frame_id"
							:size="60"
						/>
            <div class="text-sm font-bold " :class="currentMarriage.receiver.sex?'text-blue-500':'text-pink-500'">{{ currentMarriage.receiver.nickname }}</div>
					</div>
				</div>
				<el-button type="danger" size="small" @click="handleDivorce">
					离婚
				</el-button>
			</div>
		</div>

		<!-- 求婚等待列表 -->
		<div v-if="proposals.length > 0" class="mb-6">
			<div class="mb-3 font-bold text-lg flex items-center gap-2">
				<span class="text-pink-500">💍</span>
				<span>求婚等待列表</span>
			</div>
			<div class="space-y-3">
				<div
					v-for="proposal in proposals"
					:key="proposal.id"
					class="bg-white rounded-lg p-4 shadow-sm border-2 border-pink-200"
				>
					<div class="flex items-center justify-between">
						<!-- 左侧信息 -->
						<div class="flex-1">
							<div class="flex items-center gap-3 mb-2">
								<!-- 发起方 -->
								<div class="text-center">
									<PlayerAvatar
										:player-id="proposal.proposer.id"
										:sex="proposal.proposer.sex"
										:avatar-frame-id="proposal.proposer.avatar_frame_id"
										:size="50"
									/>
                  <div class="text-sm font-bold " :class="proposal.proposer.sex?'text-blue-500':'text-pink-500'">{{ proposal.proposer.nickname }}</div>
									<div class="text-xs text-gray-500">Lv.{{ proposal.proposer.lv }}</div>
								</div>

								<!-- 戒指 -->
								<div class="flex flex-col items-center">
									<div class="text-2xl">💖</div>
									<div class="text-xs text-pink-500">{{ proposal.game_item_ring.nickname }}</div>
								</div>

								<!-- 接收方 -->
								<div class="text-center">
									<PlayerAvatar
										:player-id="proposal.receiver.id"
										:sex="proposal.receiver.sex"
										:avatar-frame-id="proposal.receiver.avatar_frame_id"
										:size="50"
									/>
                  <div class="text-sm font-bold " :class="proposal.receiver.sex?'text-blue-500':'text-pink-500'">{{ proposal.receiver.nickname }}</div>
									<div class="text-xs text-gray-500">Lv.{{ proposal.receiver.lv }}</div>
								</div>
							</div>

							<!-- 时间 -->
							<div class="text-xs text-gray-400 mt-1">
								{{ formatTime(proposal.propose_time) }}
							</div>
						</div>

						<!-- 右侧按钮 -->
						<div class="ml-4">
							<!-- 如果是接收方且状态为pending：显示同意/拒绝按钮 -->
							<div v-if="proposal.my_role === 'receiver' && proposal.status === 'pending'" class="flex flex-col gap-2">
								<el-button class="m-0!" type="success" size="small" @click="handleAccept(proposal.id)">
									同意
								</el-button>
								<el-button class="m-0!" type="danger" size="small" @click="handleReject(proposal.id)">
									拒绝
								</el-button>
							</div>

							<!-- 如果是发起方且状态为pending：显示取消按钮 -->
							<div v-else-if="proposal.my_role === 'proposer' && proposal.status === 'pending'" class="flex flex-col gap-2">
								<el-tag type="warning">等待对方回应</el-tag>
								<el-button class="m-0!" type="info" size="small" @click="handleCancel(proposal.id)">
									取消求婚
								</el-button>
							</div>

							<!-- 如果状态为accepted：显示开始婚礼按钮 -->
							<div v-else-if="proposal.status === 'accepted'">
								<el-button type="primary" size="small" @click="handleStartWedding(proposal.id)">
									开始婚礼
								</el-button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- 婚礼列表 -->
		<div v-if="activeWeddings.length > 0">
			<div class="mb-3 font-bold text-lg flex items-center gap-2">
				<span class="text-pink-500">💒</span>
				<span>正在进行的婚礼</span>
			</div>
			<div class="flex flex-col gap-4">
				<WeddingCard
					v-for="wedding in activeWeddings"
					:key="wedding.id"
					:wedding="wedding"
					:show-blessing="true"
					@bless="handleBless"
				/>
			</div>
		</div>

		<!-- 空状态 -->
		<div v-else class="text-center py-12 text-gray-400">
			<div class="text-6xl mb-4">💒</div>
			<div class="text-lg">暂无正在进行的婚礼</div>
			<div class="text-sm mt-2">快来见证其他玩家的幸福时刻吧！</div>
		</div>

		<!-- 送祝福弹窗 -->
		<BlessingDialog ref="blessingDialogRef" @success="handleBlessingSuccess" />
	</div>
</template>

<script setup>
import { ref, inject, computed } from 'vue'
import { ElMessageBox } from 'element-plus'
import { message } from '@/game/notification-center'
import WeddingCard from './WeddingCard.vue'
import BlessingDialog from './BlessingDialog.vue'
import PlayerAvatar from '../common/PlayerAvatar.vue'

const game = inject('game')
const blessingDialogRef = ref(null)

// 获取当前玩家的婚姻状态
const currentMarriage = computed(() => {
	const proposals = game.player_marriage.data || []
	return proposals.find(p => p.status === 'married')
})

// 获取求婚列表（只显示 pending 和 accepted 状态）
const proposals = computed(() => {
	const allProposals = game.player_marriage.data || []
	return allProposals.filter(p => p.status === 'pending' || p.status === 'accepted')
})

// 获取有效的婚礼列表（24小时内）
const activeWeddings = computed(() => {
	const weddings = game.game_marriage.getActiveWeddings()
	// 转换数据格式以适配 WeddingCard 组件
	return weddings.map(wedding => ({
		id: wedding.id,
		groom: {
			id: wedding.proposer.id,
			sex: wedding.proposer.sex,
			avatar_frame_id: wedding.proposer.avatar_frame_id,
			nickname: wedding.proposer.nickname
		},
		bride: {
			id: wedding.receiver.id,
			sex: wedding.receiver.sex,
			avatar_frame_id: wedding.receiver.avatar_frame_id,
			nickname: wedding.receiver.nickname
		},
		weddingTime: new Date(parseInt(wedding.wedding_time) * 1000).toISOString(),
		blessCount: wedding.blessCount || 0,
		gift_money: wedding.gift_money || 0,
		gift_money_left: wedding.gift_money_left || 0,
		currency_name: wedding.marriage_item?.currency?.nickname || '金币'
	}))
})

// 格式化时间戳
const formatTime = (timestamp) => {
	const date = new Date(parseInt(timestamp) * 1000)
	const now = new Date()
	const diff = now - date
	const minutes = Math.floor(diff / 60000)
	const hours = Math.floor(diff / 3600000)
	const days = Math.floor(diff / 86400000)

	if (minutes < 1) return '刚刚'
	if (minutes < 60) return `${minutes}分钟前`
	if (hours < 24) return `${hours}小时前`
	if (days < 30) return `${days}天前`
	return date.toLocaleDateString()
}

// 同意求婚
const handleAccept = async (proposalId) => {
	try {
		const res = await game.player_marriage.api.accept(proposalId)
		if (res.code === 200) {
			message.success('你同意了求婚！')
			// 刷新数据
			await game.player_marriage.update()
		} else {
			message.error(res.msg || '操作失败')
		}
	} catch (error) {
		message.error('操作失败，请稍后再试')
	}
}

// 拒绝求婚
const handleReject = async (proposalId) => {
	try {
		await ElMessageBox.confirm('确定要拒绝这个求婚吗？', '确认', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning'
		})

		const res = await game.player_marriage.api.reject(proposalId)
		if (res.code === 200) {
			message.success('已拒绝求婚')
			// 刷新数据
			await game.player_marriage.update()
		} else {
			message.error(res.msg || '操作失败')
		}
	} catch (error) {
		if (error !== 'cancel') {
			message.error('操作失败，请稍后再试')
		}
	}
}

// 取消求婚
const handleCancel = async (proposalId) => {
	try {
		await ElMessageBox.confirm('确定要取消求婚吗？', '确认', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning'
		})

		const res = await game.player_marriage.api.cancel(proposalId)
		if (res.code === 200) {
			message.success('已取消求婚')
			// 刷新数据
			await game.player_marriage.update()
		} else {
			message.error(res.msg || '操作失败')
		}
	} catch (error) {
		if (error !== 'cancel') {
			message.error('操作失败，请稍后再试')
		}
	}
}

// 开始婚礼
const handleStartWedding = async (proposalId) => {
	try {
		// 获取婚礼道具列表
		const marriageItemsRes = await game.game_config_marriage.api.getAll()
		if (marriageItemsRes.code !== 200 || !marriageItemsRes.data || marriageItemsRes.data.length === 0) {
			message.error('暂无可用的婚礼道具')
			return
		}

		const marriageItems = marriageItemsRes.data

		// 构建选项HTML
		const optionsHtml = marriageItems.map(item => {
			const currencyName = item.currency?.nickname || '未知货币'
			return `
				<div style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 8px; cursor: pointer;"
					 data-item-id="${item.id}"
					 class="marriage-item-option">
					<div style="font-weight: bold; font-size: 14px;">${item.nickname}</div>
					<div style="color: #666; font-size: 12px; margin-top: 4px;">${item.desc}</div>
					<div style="color: #f56c6c; font-size: 13px; margin-top: 4px;">价格: ${item.price} ${currencyName}</div>
					<div style="color: #67c23a; font-size: 12px; margin-top: 2px;">礼金: ${item.price} ${currencyName}</div>
				</div>
			`
		}).join('')

		// 使用 ElMessageBox 显示选择对话框（不使用 await）
		ElMessageBox({
			title: '选择婚礼道具',
			message: `
				<div style="max-height: 400px; overflow-y: auto;">
					<div style="margin-bottom: 10px; color: #909399; font-size: 13px;">
						选择婚礼道具后，将扣除道具价格，道具价格即为婚礼礼金
					</div>
					${optionsHtml}
				</div>
			`,
			dangerouslyUseHTMLString: true,
			showCancelButton: true,
			confirmButtonText: '开始婚礼',
			cancelButtonText: '取消',
			beforeClose: async (action, instance, done) => {
				if (action === 'confirm') {
					const selected = document.querySelector('.marriage-item-option.selected')
					if (!selected) {
						message.warning('请选择一个婚礼道具')
						return
					}

					const selectedItemId = selected.getAttribute('data-item-id')
					instance.confirmButtonLoading = true

					try {
						const res = await game.player_marriage.api.startWedding(proposalId, parseInt(selectedItemId))
						if (res.code === 200) {
							message.success('婚礼开始！恭喜你们喜结连理 🎉')
							// 刷新数据
							await game.player_marriage.update()
							await game.game_marriage.update()
							done()
						} else {
							message.error(res.msg || '操作失败')
							instance.confirmButtonLoading = false
						}
					} catch (error) {
						message.error('操作失败，请稍后再试')
						instance.confirmButtonLoading = false
					}
				} else {
					done()
				}
			}
		})

		// 添加点击事件监听（在对话框打开后立即执行）
		setTimeout(() => {
			const options = document.querySelectorAll('.marriage-item-option')
			options.forEach(option => {
				option.addEventListener('click', function() {
					options.forEach(opt => {
						opt.classList.remove('selected')
						opt.style.borderColor = '#ddd'
						opt.style.backgroundColor = 'white'
					})
					this.classList.add('selected')
					this.style.borderColor = '#409eff'
					this.style.backgroundColor = '#ecf5ff'
				})
			})
		}, 100)
	} catch (error) {
		if (error !== 'cancel') {
			console.error('开始婚礼失败:', error)
		}
	}
}

// 处理送祝福按钮点击
const handleBless = (wedding) => {
	blessingDialogRef.value?.show(wedding)
}

// 祝福成功后的回调
const handleBlessingSuccess = () => {
	// 可以在这里刷新数据或显示成功提示
	// await game.game_marriage.update()
}

// 处理离婚
const handleDivorce = async () => {
	try {
		await ElMessageBox.confirm('确定要离婚吗？此操作不可撤销。', '确认离婚', {
			confirmButtonText: '确定离婚',
			cancelButtonText: '取消',
			type: 'warning'
		})

		const res = await game.player_marriage.api.divorce()
		if (res.code === 200) {
			message.success('离婚成功')
			// 刷新数据
			await game.player_marriage.update()
			await game.game_marriage.update()
		} else {
			message.error(res.msg || '离婚失败')
		}
	} catch (error) {
		if (error !== 'cancel') {
			message.error('操作失败，请稍后再试')
		}
	}
}
</script>

<style scoped>
</style>
