<template>
	<el-dialog
		v-model="vis"
		width="90%"
		:show-close="true"
		align-center
		:close-on-click-modal="false"
	>
		<!-- 自定义标题 -->
		<template #header>
			<div class="dialog-title">
				<span class="title-text">天梯对战 - </span>
				<span class="opponent-name">{{ opponentData?.nickname }}</span>
				<span class="opponent-score">⭐{{ opponentData?.score }}</span>
			</div>
		</template>
		<!-- 对手鸟属性显示区域（上方） -->
		<div v-if="opponentData?.lineup" class="birds-info-container opponent-birds mb-4">
			<div class="bird-info-card" v-for="(bird, index) in [opponentData.lineup.slot1, opponentData.lineup.slot2, opponentData.lineup.slot3]" :key="'opponent-'+index">
				<template v-if="bird">
					<el-avatar
						:size="45"
						:src="getImageUrl('bird', bird.nickname)"
						:class="['bird-avatar', 'mb-1', { defeated: getBirdState(targetBirdsState, index + 1)?.isDefeated }]"
					>
						<div class="text-4xl">🐦</div>
					</el-avatar>
					<div class="bird-name" :class="{ defeated: getBirdState(targetBirdsState, index + 1)?.isDefeated }">
						{{ bird.nickname }} <span class="bird-level">Lv.{{ bird.lv }}</span>
					</div>
					<div class="bird-stats">
						<span class="stat-item weight">
							⚖️
							<template v-if="battleResult && currentRound > 0">
								<span :class="{ 'weight-changed': getBirdState(targetBirdsState, index + 1)?.currentWeight !== bird.weight }">
									{{ (getBirdState(targetBirdsState, index + 1)?.currentWeight || bird.weight).toFixed(2) }}kg
								</span>
							</template>
							<template v-else>
								{{ bird.weight.toFixed(2) }}kg
							</template>
						</span>
					</div>
				</template>
				<div v-else class="empty-slot">空位</div>
			</div>
		</div>

		<!-- 战斗结果文字显示区域 -->
		<div class="battle-log-container" v-if="battleResult">
			<div class="battle-log-item" v-for="(log, index) in displayedLogs" :key="index">
				<div v-if="log.round" class="round-number">第{{ log.round }}回合</div>
				<div class="battle-text" v-html="log.text"></div>
			</div>
			<div v-if="!battleFinished && isAnimating" class="battle-loading">战斗进行中...</div>
		</div>
		<div v-else class="battle-placeholder">
			<div class="placeholder-icon">⚔️</div>
			<div class="placeholder-text">点击"开始战斗"查看战斗结果</div>
		</div>

		<!-- 自己鸟属性显示区域（下方） -->
		<div v-if="myLineup" class="birds-info-container my-birds mt-4">
			<div class="bird-info-card" v-for="(bird, index) in [myLineup.slot1, myLineup.slot2, myLineup.slot3]" :key="'my-'+index">
				<template v-if="bird">
					<el-avatar
						:size="45"
						:src="getImageUrl('bird', bird.nickname)"
						:class="['bird-avatar', 'mb-1', { defeated: getBirdState(challengerBirdsState, index + 1)?.isDefeated }]"
					>
						<div class="text-4xl">🐦</div>
					</el-avatar>
					<div class="bird-name" :class="{ defeated: getBirdState(challengerBirdsState, index + 1)?.isDefeated }">
						{{ bird.nickname }} <span class="bird-level">Lv.{{ bird.lv }}</span>
					</div>
					<div class="bird-stats">
						<span class="stat-item weight">
							⚖️
							<template v-if="battleResult && currentRound > 0">
								<span :class="{ 'weight-changed': getBirdState(challengerBirdsState, index + 1)?.currentWeight !== bird.weight }">
									{{ (getBirdState(challengerBirdsState, index + 1)?.currentWeight || bird.weight).toFixed(2) }}kg
								</span>
							</template>
							<template v-else>
								{{ bird.weight.toFixed(2) }}kg
							</template>
						</span>
					</div>
				</template>
				<div v-else class="empty-slot">空位</div>
			</div>
		</div>

		<!-- 底部按钮区域 -->
		<template #footer>
			<div class="flex gap-2 justify-center">
				<el-button type="primary" @click="startBattle">开始战斗</el-button>
				<el-button @click="vis = false">关闭</el-button>
			</div>
		</template>
	</el-dialog>
</template>

<script setup>
import {ref, inject} from 'vue'
import {ElMessage} from 'element-plus'
import {getImageUrl} from '@/config/oss'

const game = inject('game')
const vis = ref(false)

// 对战数据
const opponentData = ref(null)
const myLineup = ref(null)

// 战斗结果数据
const battleResult = ref(null)
const currentRound = ref(0)
const isAnimating = ref(false)
const battleFinished = ref(false)
const displayedLogs = ref([]) // 格式化后的战斗文字

// 鸟的当前状态
const challengerBirdsState = ref([])
const targetBirdsState = ref([])

// 打开对话框
const show = async (opponent) => {
	opponentData.value = opponent

	// 获取自己的阵容
	await game.player_ladder_lineup.getLineup()
	myLineup.value = game.player_ladder_lineup.data.lineup

	// 重置战斗状态
	battleResult.value = null
	currentRound.value = 0
	isAnimating.value = false
	battleFinished.value = false
	displayedLogs.value = []
	challengerBirdsState.value = []
	targetBirdsState.value = []

	vis.value = true
}

// 生成战斗文字描述(带HTML颜色)
const generateBattleText = (log) => {
	const challengerBirdName = log.challenger.bird_name
	const targetBirdName = log.target.bird_name
	const challengerWeight = log.challenger.weight_before.toFixed(2)
	const targetWeight = log.target.weight_before.toFixed(2)

	// 技能信息
	const challengerSkills = []
	if (log.challenger.equipped_skill) {
		const skill = log.challenger.equipped_skill
		challengerSkills.push(`<span class="skill-info blue equipped" title="${skill.description || ''}">【${skill.name}】</span>`)
	}
	if (log.challenger.talent_skill) {
		const skill = log.challenger.talent_skill
		challengerSkills.push(`<span class="skill-info blue talent" title="${skill.description || ''}">【${skill.name}】</span>`)
	}
	const challengerSkillText = challengerSkills.join('')

	const targetSkills = []
	if (log.target.equipped_skill) {
		const skill = log.target.equipped_skill
		targetSkills.push(`<span class="skill-info red equipped" title="${skill.description || ''}">【${skill.name}】</span>`)
	}
	if (log.target.talent_skill) {
		const skill = log.target.talent_skill
		targetSkills.push(`<span class="skill-info red talent" title="${skill.description || ''}">【${skill.name}】</span>`)
	}
	const targetSkillText = targetSkills.join('')

	if (log.winner === 'challenger') {
		// 我方胜利
		const weightChange = (log.challenger.weight_before - log.challenger.weight_after).toFixed(2)
		return `<span class="bird-name blue">${challengerBirdName}</span>${challengerSkillText}<span class="bird-weight">(${challengerWeight}kg)</span> 对战 <span class="bird-name red">${targetBirdName}</span>${targetSkillText}<span class="bird-weight">(${targetWeight}kg)</span> <span class="result-win">（胜利）</span> <span class="weight-change">（体重-${weightChange}kg）</span> <span class="bird-down red">（对方${targetBirdName}下场）</span>`
	} else if (log.winner === 'target') {
		// 对方胜利
		const targetWeightChange = (log.target.weight_before - log.target.weight_after).toFixed(2)
		return `<span class="bird-name blue">${challengerBirdName}</span>${challengerSkillText}<span class="bird-weight">(${challengerWeight}kg)</span> 对战 <span class="bird-name red">${targetBirdName}</span>${targetSkillText}<span class="bird-weight">(${targetWeight}kg)</span> <span class="result-lose">（失败）</span> <span class="weight-change">（体重-${targetWeightChange}kg）</span> <span class="bird-down blue">（我方${challengerBirdName}下场）</span>`
	} else {
		// 平局
		return `<span class="bird-name blue">${challengerBirdName}</span>${challengerSkillText}<span class="bird-weight">(${challengerWeight}kg)</span> 对战 <span class="bird-name red">${targetBirdName}</span>${targetSkillText}<span class="bird-weight">(${targetWeight}kg)</span> <span class="result-draw">（平局）</span> <span class="bird-down gray">（双方下场）</span>`
	}
}

// 开始战斗
const startBattle = async () => {
	if (isAnimating.value) return

	try {
		isAnimating.value = true
		const response = await game.player_ladder_score.challenge(opponentData.value.player_id)

		if (response.code !== 200) {
			ElMessage.error(response.msg)
			isAnimating.value = false
			return
		}
		await game.player_ladder_score.getRank();

		battleResult.value = response.data

		// 初始化鸟的状态
		initBirdsState()

		// 生成战斗文字记录
		displayedLogs.value = battleResult.value.battle_log.map((log, index) => {
			// 更新鸟的状态
			const challengerBird = challengerBirdsState.value.find(b => b.slot === log.challenger.slot)
			const targetBird = targetBirdsState.value.find(b => b.slot === log.target.slot)

			if (challengerBird) {
				challengerBird.currentWeight = log.challenger.weight_after
				if (log.winner === 'target' || log.winner === 'draw') {
					challengerBird.isDefeated = true
				}
			}

			if (targetBird) {
				targetBird.currentWeight = log.target.weight_after
				if (log.winner === 'challenger' || log.winner === 'draw') {
					targetBird.isDefeated = true
				}
			}

			return {
				round: log.round,
				text: generateBattleText(log)
			}
		})

		// 添加最终战斗结果汇总
		const finalResult = battleResult.value.winner === 'challenger'
			? '<div class="final-result-summary win">🎉 挑战胜利！</div>'
			: '<div class="final-result-summary lose">💔 挑战失败！</div>'

		displayedLogs.value.push({
			round: null,
			text: finalResult
		})

		// 刷新玩家信息（更新体力等）
		await game.player.update()

		// 刷新排行榜数据
		await game.player_ladder_score.getRank()

		// 更新对手的天梯分数（从刷新后的排行榜中获取）
		const updatedOpponent = game.player_ladder_score.data.rank_list?.find(
			p => p.player_id === opponentData.value.player_id
		)
		if (updatedOpponent) {
			opponentData.value.score = updatedOpponent.score
		}

		battleFinished.value = true
		isAnimating.value = false

		// 显示最终结果
		showFinalResult()

	} catch (error) {
		console.error('战斗失败:', error)
		ElMessage.error('战斗失败，请重试')
		isAnimating.value = false
	}
}

// 初始化鸟的状态
const initBirdsState = () => {
	const logs = battleResult.value.battle_log

	// 从战斗日志中提取初始状态
	challengerBirdsState.value = []
	targetBirdsState.value = []

	// 遍历我方阵容
	if (myLineup.value.slot1) {
		challengerBirdsState.value.push({
			slot: 1,
			currentWeight: myLineup.value.slot1.weight,
			isDefeated: false
		})
	}
	if (myLineup.value.slot2) {
		challengerBirdsState.value.push({
			slot: 2,
			currentWeight: myLineup.value.slot2.weight,
			isDefeated: false
		})
	}
	if (myLineup.value.slot3) {
		challengerBirdsState.value.push({
			slot: 3,
			currentWeight: myLineup.value.slot3.weight,
			isDefeated: false
		})
	}

	// 遍历对方阵容
	if (opponentData.value.lineup.slot1) {
		targetBirdsState.value.push({
			slot: 1,
			currentWeight: opponentData.value.lineup.slot1.weight,
			isDefeated: false
		})
	}
	if (opponentData.value.lineup.slot2) {
		targetBirdsState.value.push({
			slot: 2,
			currentWeight: opponentData.value.lineup.slot2.weight,
			isDefeated: false
		})
	}
	if (opponentData.value.lineup.slot3) {
		targetBirdsState.value.push({
			slot: 3,
			currentWeight: opponentData.value.lineup.slot3.weight,
			isDefeated: false
		})
	}
}

// 显示最终结果
const showFinalResult = () => {
	const result = battleResult.value

	if (result.winner === 'challenger') {
		const rewards = result.rewards
		ElMessage.success({
			message: `恭喜获胜！获得：天梯分 +${rewards.score}，经验 +${rewards.exp}，金币 +${rewards.balance_1}`,
			duration: 5000
		})
	} else {
		const penalties = result.penalties
		ElMessage.warning({
			message: `很遗憾，挑战失败了！天梯分 -${penalties.score}`,
			duration: 3000
		})
	}
}

// 获取鸟的状态
const getBirdState = (birdStates, slot) => {
	return birdStates.find(b => b && b.slot === slot)
}

defineExpose({
	show
})
</script>

<style scoped>
/* 自定义标题栏样式 */
.dialog-title {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 18px;
	font-weight: bold;
}

.title-text {
	color: #1e293b;
}

.opponent-name {
	color: #ef4444;
	font-size: 20px;
}

.opponent-score {
	color: #f59e0b;
	font-size: 18px;
	font-weight: bold;
}

/* 战斗文字显示区域 */
.battle-log-container {
	background: white;
	border: 2px solid #cbd5e1;
	border-radius: 8px;
	padding: 16px;
	max-height: 300px;
	overflow-y: auto;
	margin: 16px 0;
}

.battle-log-item {
	background: #f8fafc;
	border-left: 4px solid #3b82f6;
	padding: 12px;
	margin-bottom: 12px;
	border-radius: 4px;
}

.battle-log-item:last-child {
	margin-bottom: 0;
}

.round-number {
	font-size: 14px;
	font-weight: bold;
	color: #3b82f6;
	margin-bottom: 6px;
}

.battle-text {
	font-size: 15px;
	color: #1e293b;
	line-height: 1.5;
}

.battle-loading {
	text-align: center;
	color: #64748b;
	margin-top: 12px;
	font-size: 14px;
}

.battle-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60px 20px;
	background: #f8fafc;
	border-radius: 8px;
	margin: 16px 0;
}

.placeholder-icon {
	font-size: 64px;
	margin-bottom: 16px;
}

.placeholder-text {
	color: #64748b;
	font-size: 16px;
}

/* 鸟属性显示区域 */
.birds-info-container {
	display: flex;
	flex-direction: row;
	gap: 8px;
	padding: 10px;
	background: #f8fafc;
	border-radius: 8px;
}

.opponent-birds {
	border: 2px solid #ef4444;
}

.my-birds {
	border: 2px solid #3b82f6;
}

.bird-info-card {
	background: white;
	border-radius: 8px;
	padding: 8px;
	text-align: center;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	transition: all 0.3s;
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;
	min-width: 0;
}

.bird-avatar {
	border: 2px solid #e5e7eb;
	transition: all 0.3s;
}

.bird-avatar.defeated {
	opacity: 0.4;
	filter: grayscale(100%);
	border-color: #9ca3af;
}

.bird-name {
	font-size: 11px;
	font-weight: bold;
	color: #1e293b;
	margin-bottom: 4px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	width: 100%;
}

.bird-level {
	font-size: 10px;
	font-weight: normal;
	color: #64748b;
	margin-left: 4px;
}

.bird-name.defeated {
	color: #9ca3af;
	text-decoration: line-through;
}

.bird-stats {
	display: flex;
	flex-direction: column;
	gap: 2px;
	font-size: 10px;
	color: #64748b;
}

.stat-item {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 4px;
}

.stat-item.weight {
	font-weight: bold;
	color: #f59e0b;
}

.weight-changed {
	color: #ef4444;
	animation: pulse 0.5s ease-in-out;
}

@keyframes pulse {
	0%, 100% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.1);
	}
}

.empty-slot {
	color: #9ca3af;
	font-size: 14px;
	padding: 20px;
}

/* 战斗文字颜色样式 */
.battle-text :deep(.player-name.blue) {
	color: #3b82f6;
	font-weight: bold;
}

.battle-text :deep(.player-name.red) {
	color: #ef4444;
	font-weight: bold;
}

.battle-text :deep(.bird-name.blue) {
	color: #2563eb;
	font-weight: 600;
}

.battle-text :deep(.bird-name.red) {
	color: #dc2626;
	font-weight: 600;
}

.battle-text :deep(.bird-weight) {
	color: #64748b;
	font-size: 14px;
	font-weight: normal;
}

.battle-text :deep(.result-win) {
	color: #10b981;
	font-weight: bold;
}

.battle-text :deep(.result-lose) {
	color: #ef4444;
	font-weight: bold;
}

.battle-text :deep(.result-draw) {
	color: #f59e0b;
	font-weight: bold;
}

.battle-text :deep(.weight-change) {
	color: #f97316;
}

.battle-text :deep(.bird-down.red) {
	color: #ef4444;
}

.battle-text :deep(.bird-down.blue) {
	color: #3b82f6;
}

.battle-text :deep(.bird-down.gray) {
	color: #6b7280;
}

.battle-text :deep(.skill-info) {
	font-size: 13px;
	font-weight: 600;
	margin: 0 4px;
	padding: 2px 6px;
	border-radius: 4px;
	background: rgba(59, 130, 246, 0.1);
	cursor: help;
	transition: all 0.2s;
}

.battle-text :deep(.skill-info:hover) {
	transform: translateY(-1px);
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.battle-text :deep(.skill-info.blue) {
	color: #2563eb;
	background: rgba(37, 99, 235, 0.1);
}

.battle-text :deep(.skill-info.red) {
	color: #dc2626;
	background: rgba(220, 38, 38, 0.1);
}

.battle-text :deep(.skill-info.equipped) {
	border: 1px solid currentColor;
}

.battle-text :deep(.skill-info.talent) {
	font-style: italic;
	opacity: 0.9;
}

/* 最终战斗结果汇总样式 */
.final-result-summary {
	text-align: center;
	font-size: 24px;
	font-weight: bold;
	padding: 20px;
	margin-top: 16px;
	border-radius: 8px;
}

.final-result-summary.win {
	background: linear-gradient(135deg, #10b981 0%, #059669 100%);
	color: white;
	box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
}

.final-result-summary.lose {
	background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
	color: white;
	box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);
}
</style>
