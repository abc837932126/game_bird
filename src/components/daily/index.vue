<template>
	<div class="daily-checkin-page">
		<el-card class="stats-card">
			<div class="stats">
				<div class="stat-item">
					<div class="stat-label">本月已签到</div>
					<div class="stat-value">{{ monthlyCount }}天</div>
				</div>
			</div>
		</el-card>

		<el-card class="checkin-list">
			<div class="week-list">
				<div
					v-for="day in weekDays"
					:key="day.date"
					:class="['day-item', { 'is-today': day.isToday, 'is-checked': day.isChecked }]"
				>
					<div class="day-date">{{ day.dateDisplay }}</div>
					<div class="day-weekday">{{ day.weekday_name }}</div>
					<div class="day-reward">
						<span v-if="day.isChecked" class="checked-badge">✓ 已签到</span>
						<span v-else class="reward-amount">+{{ day.reward }} {{ day.currencyName }}</span>
					</div>
				</div>
			</div>
		</el-card>

		<el-button
			type="primary"
			size="large"
			:disabled="hasCheckedInToday"
			@click="handleCheckin"
			class="checkin-button"
		>
			{{ hasCheckedInToday ? '今日已签到' : '立即签到' }}
		</el-button>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { message } from '@/game/notification-center'
import { game } from '../../game'

const checkinData = ref(null)
const loading = ref(false)

const hasCheckedInToday = computed(() => checkinData.value?.has_checked_in_today || false)
const monthlyCount = computed(() => checkinData.value?.monthly_checkin_count || 0)

const weekDays = computed(() => {
	if (!checkinData.value) return []

	const today = new Date(checkinData.value.today_date)
	const checkedDays = checkinData.value.monthly_checkin_days || []

	// 从 next_7_days 中获取每天的奖励和货币信息
	const next7Days = checkinData.value.next_7_days || []
	const dayInfoMap = {}
	next7Days.forEach(day => {
		dayInfoMap[day.date] = {
			reward: day.reward,
			currencyName: day.currency?.nickname || '金币'
		}
	})

	// 计算本周一的日期
	const dayOfWeek = today.getDay()
	const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
	const monday = new Date(today)
	monday.setDate(today.getDate() + diff)

	// 生成本周7天
	const weekDayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
	const days = []

	for (let i = 0; i < 7; i++) {
		const currentDate = new Date(monday)
		currentDate.setDate(monday.getDate() + i)
		const dateStr = currentDate.toISOString().split('T')[0]
		const weekday = currentDate.getDay()
		const dayInfo = dayInfoMap[dateStr] || { reward: 100, currencyName: '金币' }

		days.push({
			date: dateStr,
			dateDisplay: formatDate(dateStr),
			weekday_name: weekDayNames[weekday],
			reward: dayInfo.reward,
			currencyName: dayInfo.currencyName,
			isToday: dateStr === checkinData.value.today_date,
			isChecked: checkedDays.includes(dateStr)
		})
	}

	return days
})

function formatDate(dateStr) {
	const date = new Date(dateStr)
	return `${date.getMonth() + 1}/${date.getDate()}`
}

async function loadCheckinInfo() {
	loading.value = true
	try {
		await game.checkin.update()
		checkinData.value = game.checkin.data
	} catch (error) {
		message.error('加载签到信息失败')
	} finally {
		loading.value = false
	}
}

async function handleCheckin() {
	if (hasCheckedInToday.value) return

	loading.value = true
	try {
		const res = await game.checkin.doCheckin()
		if (res.code === 200) {
			message.success(`签到成功！获得 ${res.data.reward_amount} ${res.data.reward_type_name}`)
			checkinData.value = game.checkin.data
		} else {
			message.error(res.message || '签到失败')
		}
	} catch (error) {
		message.error('签到失败')
	} finally {
		loading.value = false
	}
}

onMounted(() => {
	loadCheckinInfo()
})
</script>

<style scoped>
.daily-checkin-page {
	padding: 20px;
	max-width: 600px;
	margin: 0 auto;
}

.stats-card {
	margin-bottom: 20px;
}

.stats {
	display: flex;
	justify-content: center;
	gap: 40px;
}

.stat-item {
	text-align: center;
}

.stat-label {
	font-size: 14px;
	color: #666;
	margin-bottom: 8px;
}

.stat-value {
	font-size: 24px;
	font-weight: bold;
	color: #409eff;
}

.checkin-list {
	margin-bottom: 20px;
}

.week-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.day-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px;
	border: 2px solid #eee;
	border-radius: 8px;
	transition: all 0.3s;
}

.day-item.is-today {
	border-color: #409eff;
	background-color: #ecf5ff;
}

.day-item.is-checked {
	background-color: #f0f9ff;
	opacity: 0.7;
}

.day-date {
	font-size: 16px;
	font-weight: bold;
}

.day-weekday {
	font-size: 14px;
	color: #666;
}

.day-reward {
	font-size: 16px;
}

.checked-badge {
	color: #67c23a;
	font-weight: bold;
}

.reward-amount {
	color: #f56c6c;
	font-weight: bold;
}

.checkin-button {
	width: 100%;
	height: 50px;
	font-size: 18px;
}
</style>
