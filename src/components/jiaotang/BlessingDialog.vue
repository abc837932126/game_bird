<template>
	<el-dialog
		v-model="vis"
		title="送祝福"
		width="90%"
		:show-close="true"
	>
		<div v-if="currentWedding" class="flex flex-col gap-4">
			<!-- 新人信息 -->
			<div class="text-center mb-4">
				<div class="flex items-center justify-center gap-4 mb-2">
					<PlayerAvatar
						:player-id="currentWedding.groom.id"
						:sex="currentWedding.groom.sex"
						:avatar-frame-id="currentWedding.groom.avatar_frame_id"
						:size="50"
					/>
					<span class="text-xl">💕</span>
					<PlayerAvatar
						:player-id="currentWedding.bride.id"
						:sex="currentWedding.bride.sex"
						:avatar-frame-id="currentWedding.bride.avatar_frame_id"
						:size="50"
					/>
				</div>
				<div class="font-bold text-lg">
					{{ currentWedding.groom.nickname }} & {{ currentWedding.bride.nickname }}
				</div>
			</div>

			<!-- 祝福语输入 -->
			<div>
				<div class="mb-2 text-sm text-gray-600">祝福语：</div>
				<el-input
					v-model="blessingMessage"
					type="textarea"
					:rows="4"
					placeholder="写下你对新人的祝福吧..."
					maxlength="100"
					show-word-limit
				/>
			</div>

			<!-- 金币数量 -->
			<div>
				<div class="mb-2 text-sm text-gray-600">赠送{{ currentWedding.currency_name || '金币' }}：</div>
				<el-input-number
					v-model="goldCoins"
					:min="10"
					:max="1000"
					:step="10"
					class="w-full"
				/>
			</div>

			<!-- 按钮组 -->
			<div class="flex justify-end gap-4 mt-4">
				<el-button @click="vis = false">取消</el-button>
				<el-button
					type="primary"
					@click="handleSubmit"
					:disabled="!blessingMessage.trim()"
				>
					送出祝福
				</el-button>
			</div>
		</div>
	</el-dialog>
</template>

<script setup>
import { ref, inject } from 'vue'
import { message } from '@/game/notification-center'
import PlayerAvatar from '../common/PlayerAvatar.vue'

const game = inject('game')
const emit = defineEmits(['success'])

const vis = ref(false)
const currentWedding = ref(null)
const blessingMessage = ref('')
const goldCoins = ref(50)

// 显示弹窗
const show = (wedding) => {
	currentWedding.value = wedding
	blessingMessage.value = ''
	goldCoins.value = 50
	vis.value = true
}

// 提交祝福
const handleSubmit = async () => {
	if (!blessingMessage.value.trim()) {
		message.warning('请输入祝福语')
		return
	}

	try {
		const res = await game.player_marriage.api.sendBlessing(
			currentWedding.value.id,
			blessingMessage.value,
			goldCoins.value
		)

		if (res.code === 200) {
			// 显示后端返回的消息（包含礼金信息）
			message.success(res.msg || '祝福已送达！')
			vis.value = false
			emit('success')
		} else {
			message.error(res.msg || '送祝福失败')
		}
	} catch (error) {
		message.error('送祝福失败，请稍后再试')
	}
}

defineExpose({
	show
})
</script>

<style scoped>
</style>
