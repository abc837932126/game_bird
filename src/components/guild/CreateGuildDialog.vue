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
import { inject, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const game = inject('game')
const vis = ref(false)
const loading = ref(false)

const formData = ref({
	nickname: '',
	desc: ''
})

const emit = defineEmits(['created'])

// 从配置中获取创建价格和货币类型
const createPrice = computed(() => {
	return game.game_config.get_value('guild', 'create_price') || 10000
})

const priceType = computed(() => {
	return game.game_config.get_value('guild', 'price_type') || 2
})

// 货币字段名映射
const balanceField = computed(() => {
	return `balance_${priceType.value}`
})

// 货币名称映射（从配置读取）
const currencyName = computed(() => {
	return game.game_config.get_value('game', 'balance_type')?.[priceType.value] || '金币'
})

const show = () => {
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
		ElMessage.error('工会名称至少需要2个字符')
		return
	}

	// 检查余额
	const currentBalance = game.player.data[balanceField.value] || 0
	if (currentBalance < createPrice.value) {
		ElMessage.error(`${currencyName.value}不足，创建工会需要${createPrice.value.toLocaleString()}${currencyName.value}`)
		return
	}

	loading.value = true
	try {
		const res = await game.guild.api.create({
			nickname: formData.value.nickname.trim(),
			desc: formData.value.desc.trim()
		})

		if (res.code === 200) {
			ElMessage.success('工会创建成功！')
			vis.value = false
			emit('created')
		} else {
			ElMessage.error(res.msg || '创建工会失败')
		}
	} catch (error) {
		console.error('创建工会失败:', error)
		ElMessage.error('创建工会失败')
	} finally {
		loading.value = false
	}
}

defineExpose({ show })
</script>
