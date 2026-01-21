<template>
	<div class="bank-page">
		<div class="balance-list">
			<div v-for="type in allowedCurrencyTypes" :key="type" class="balance-row">
				<span class="balance-label">背包{{ getCurrencyName(type) }}:</span>
				<span class="balance-value wallet-value">{{ getWalletBalance(type) }}</span>
			</div>
			<div v-for="type in allowedCurrencyTypes" :key="'bank_' + type" class="balance-row">
				<span class="balance-label">银行{{ getCurrencyName(type) }}:</span>
				<span class="balance-value">{{ getBankBalance(type) }}</span>
			</div>
		</div>

		<el-card class="operation-card">
			<el-tabs v-model="activeTab">
				<el-tab-pane label="存款" name="deposit">
					<div class="limit-info">
						<div>存款上限: {{ bankData.bank_limit || 0 }} (金币等值)</div>
						<el-progress :percentage="usagePercent" :color="progressColor" />
					</div>
					<el-divider />
					<el-form :model="depositForm" label-width="80px">
						<el-form-item label="货币类型">
							<el-select v-model="depositForm.currency_type">
								<el-option v-for="type in allowedCurrencyTypes" :key="type" :label="getCurrencyName(type)" :value="type" />
							</el-select>
						</el-form-item>
						<el-form-item label="金额">
							<el-input-number v-model="depositForm.amount" :min="1" />
						</el-form-item>
						<el-form-item>
							<el-button type="primary" @click="handleDeposit">存款 (手续费1%)</el-button>
						</el-form-item>
					</el-form>
				</el-tab-pane>

				<el-tab-pane label="取款" name="withdraw">
					<el-form :model="withdrawForm" label-width="80px">
						<el-form-item label="货币类型">
							<el-select v-model="withdrawForm.currency_type">
								<el-option v-for="type in allowedCurrencyTypes" :key="type" :label="getCurrencyName(type)" :value="type" />
							</el-select>
						</el-form-item>
						<el-form-item label="金额">
							<el-input-number v-model="withdrawForm.amount" :min="1" />
						</el-form-item>
						<el-form-item>
							<el-button type="success" @click="handleWithdraw">取款</el-button>
						</el-form-item>
					</el-form>
				</el-tab-pane>
			</el-tabs>
		</el-card>

		<el-card class="upgrade-card">
			<div class="upgrade-info">
				<div>提升额度: 花费 {{ bankData.upgrade_cost || 100 }} 元宝提升 {{ (bankData.upgrade_rate || 0.1) * 100 }}% 额度</div>
				<el-button type="warning" @click="handleUpgrade">提升额度</el-button>
			</div>
		</el-card>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { game } from '../../game'

const activeTab = ref('deposit')
const depositForm = ref({ currency_type: 1, amount: 100 })
const withdrawForm = ref({ currency_type: 1, amount: 100 })

const bankData = computed(() => game.bank.data || {})

const allowedCurrencyTypes = computed(() => {
	return bankData.value.allowed_currency_types || [1]
})

const usagePercent = computed(() => {
	const rate = bankData.value.usage_rate || 0
	return Math.min(Math.round(rate * 100), 100)
})

const progressColor = computed(() => {
	const percent = usagePercent.value
	if (percent < 50) return '#67c23a'
	if (percent < 80) return '#e6a23c'
	return '#f56c6c'
})

function getCurrencyName(type) {
	// 从玩家余额中查找对应的货币名称
	const balance = game.player?.data?.player_balance?.find(b => b.balance_id === type)
	return balance?.game_config_player_balance?.nickname || '未知'
}

function getBankBalance(type) {
	// 从银行余额数组中查找
	const bankBalance = bankData.value.player_bank_balance?.find(b => b.balance_id === type)
	return bankBalance?.count || 0
}

function getWalletBalance(type) {
	// 从玩家余额数组中查找
	const balance = game.player?.data?.player_balance?.find(b => b.balance_id === type)
	return balance?.count || 0
}

async function handleDeposit() {
	try {
		const res = await game.bank.deposit(depositForm.value.currency_type, depositForm.value.amount)
		if (res.code === 200) {
			ElMessage.success('存款成功')
			await game.player.update()
		} else {
			ElMessage.error(res.message || '存款失败')
		}
	} catch (error) {
		ElMessage.error('存款失败')
	}
}

async function handleWithdraw() {
	try {
		const res = await game.bank.withdraw(withdrawForm.value.currency_type, withdrawForm.value.amount)
		if (res.code === 200) {
			ElMessage.success('取款成功')
			await game.player.update()
		} else {
			ElMessage.error(res.message || '取款失败')
		}
	} catch (error) {
		ElMessage.error('取款失败')
	}
}

async function handleUpgrade() {
	try {
		const res = await game.bank.upgradeLimit()
		if (res.code === 200) {
			ElMessage.success('额度提升成功')
			await game.player.update()
			await game.bank.update()
		} else {
			ElMessage.error(res.message || '额度提升失败')
		}
	} catch (error) {
		ElMessage.error('额度提升失败')
	}
}

onMounted(async () => {
	await game.bank.update()
	// 设置默认选中第一个允许的货币类型
	if (allowedCurrencyTypes.value.length > 0) {
		depositForm.value.currency_type = allowedCurrencyTypes.value[0]
		withdrawForm.value.currency_type = allowedCurrencyTypes.value[0]
	}
})
</script>

<style scoped>
.bank-page {
	padding: 20px;
	max-width: 600px;
	margin: 0 auto;
}

.balance-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
	margin-bottom: 20px;
}

.balance-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 8px 12px;
	background-color: #f5f7fa;
	border-radius: 4px;
}

.balance-label {
	font-size: 14px;
	color: #606266;
	font-weight: 500;
}

.balance-value {
	font-size: 18px;
	font-weight: bold;
	color: #409eff;
}

.wallet-value {
	color: #67c23a;
}

.limit-info {
	text-align: center;
}

.limit-info > div {
	margin-bottom: 10px;
}

.operation-card {
	margin-bottom: 20px;
}

.upgrade-card {
	text-align: center;
}

.upgrade-info {
	display: flex;
	flex-direction: column;
	gap: 15px;
	align-items: center;
}
</style>
