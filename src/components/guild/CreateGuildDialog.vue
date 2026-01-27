<template>
	<el-dialog v-model="vis" title="创建工会" width="90%" :close-on-click-modal="true">
		<div class="space-y-4">
			<!-- 创建费用提示 -->
			<el-alert
				:title="`创建工会需要消耗 ${createPrice.toLocaleString()} ${currencyName}`"
				type="warning"
				:closable="false"
			/>

			<!-- 工会名称 -->
			<div>
				<label class="block text-sm font-medium mb-2">工会名称 *</label>
				<el-input
					v-model="formData.nickname"
					placeholder="请输入工会名称 (2-50字符)"
					maxlength="50"
					show-word-limit
				/>
			</div>

			<!-- 工会描述 -->
			<div>
				<label class="block text-sm font-medium mb-2">工会描述</label>
				<el-input
					v-model="formData.desc"
					type="textarea"
					placeholder="请输入工会描述 (选填)"
					:rows="4"
					maxlength="500"
					show-word-limit
				/>
			</div>
		</div>

		<template #footer>
			<el-button @click="vis = false">取消</el-button>
			<el-button type="primary" @click="handleSubmit" :loading="loading">
				创建工会
			</el-button>
		</template>
	</el-dialog>
</template>

<script setup>
import { inject, ref, computed, onMounted } from 'vue'
import { message } from '@/game/notification-center'

const game = inject('game')
const vis = ref(false)
const loading = ref(false)

const formData = ref({
	nickname: '',
	desc: ''
})

const emit = defineEmits(['created'])

// 从工会创建配置中获取创建价格和货币类型
const createPrice = computed(() => {
	return game.game_config_guild_create.get_create_price()
})

// 货币名称
const currencyName = computed(() => {
	return game.game_config_guild_create.data?.game_config_player_balance?.nickname || '金币'
})

const show = async () => {
	// 加载工会创建配置
	await game.game_config_guild_create.update()

	vis.value = true
	// 重置表单
	formData.value = {
		nickname: '',
		desc: ''
	}
}

const handleSubmit = async () => {
	// 验证工会名称
	if (!formData.value.nickname || formData.value.nickname.trim().length < 2) {
		message.error('工会名称至少需要2个字符')
		return
	}

	loading.value = true
	try {
		const res = await game.guild.api.create({
			nickname: formData.value.nickname.trim(),
			desc: formData.value.desc.trim()
		})

		if (res.code === 200) {
			message.success('工会创建成功！')
			vis.value = false
			emit('created')
		} else {
			message.error(res.msg || '创建工会失败')
		}
	} catch (error) {
		console.error('创建工会失败:', error)
		message.error('创建工会失败')
	} finally {
		loading.value = false
	}
}

onMounted(async () => {
	// 初始化时加载配置
	await game.game_config_guild_create.update()
})

defineExpose({ show })
</script>
