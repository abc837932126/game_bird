<template>
  <el-dialog
    v-model="vis"
    :show-close="false"
    fullscreen
    :close-on-click-modal="false"
    header-class="p-0! m-0!"
    footer-class="p-0! m-0!"
    body-class="h-[100vh]"
    class="p-0! m-0! "
  >

    <div class="flex flex-col w-full h-full">
      <!-- 标题区域 -->
      <div class="battle-header">
        <span class="title-text">{{ title }}</span>
        <span v-if="opponentName" class="opponent-name">{{ opponentName }}</span>
        <span v-if="opponentInfo" class="opponent-info">{{ opponentInfo }}</span>
      </div>

      <!-- 上部：对手阵容 -->
      <div class="battle-section-top">
        <div v-if="showLineup && targetLineup" class="section-content">
          <div class="birds-info-container opponent-birds">
            <div class="bird-info-card" v-for="(bird, index) in [targetLineup.slot1, targetLineup.slot2, targetLineup.slot3]" :key="'opponent-'+index">
              <template v-if="bird">
                <el-avatar
                  :size="60"
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
                    <span :class="{ 'weight-changed': getBirdState(targetBirdsState, index + 1)?.currentWeight !== bird.weight }">
                      {{ (getBirdState(targetBirdsState, index + 1)?.currentWeight || bird.weight).toFixed(2) }}kg
                    </span>
                  </span>
                </div>
              </template>
              <div v-else class="empty-slot">空位</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中部：战斗日志 -->
      <div class="battle-section-middle">
        <div v-if="!battleResult" class="battle-placeholder">
          <div class="placeholder-icon">⚔️</div>
          <div class="placeholder-text">点击"开始战斗"查看战斗结果</div>
        </div>
        <div v-else class="section-content">
          <div class="battle-log-container">
            <div class="battle-log-item" v-for="(log, index) in displayedLogs" :key="index">
              <div v-if="log.round" class="round-number">第{{ log.round }}回合</div>
              <div class="battle-text" v-html="log.text"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 下部：我方阵容 -->
      <div class="battle-section-bottom">
        <div v-if="showLineup && challengerLineup" class="section-content">
          <div class="birds-info-container my-birds">
            <div class="bird-info-card" v-for="(bird, index) in [challengerLineup.slot1, challengerLineup.slot2, challengerLineup.slot3]" :key="'my-'+index">
              <template v-if="bird">
                <el-avatar
                  :size="60"
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
                    <span :class="{ 'weight-changed': getBirdState(challengerBirdsState, index + 1)?.currentWeight !== bird.weight }">
                      {{ (getBirdState(challengerBirdsState, index + 1)?.currentWeight || bird.weight).toFixed(2) }}kg
                    </span>
                  </span>
                </div>
              </template>
              <div v-else class="empty-slot">空位</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="battle-footer">
        <el-button type="primary" @click="startBattle" :loading="isAnimating">开始战斗</el-button>
        <el-button @click="vis = false">关闭</el-button>
      </div>
    </div>
    <template #footer></template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, inject } from 'vue'
import { ElMessage } from 'element-plus'
import { useBattleLog } from '@/composables/useBattleLog'
import { getImageUrl } from '@/config/oss'

const game = inject('game')

const vis = ref(false)
const battleResult = ref(null)
const isAnimating = ref(false)

const title = ref('')
const opponentName = ref('')
const opponentInfo = ref('')
const showLineup = ref(true)
const challengerLineup = ref(null)
const targetLineup = ref(null)

let battleFunction = null
let onBattleComplete = null

const {
  displayedLogs,
  challengerBirdsState,
  targetBirdsState,
  processBattleResult,
  getBirdState
} = useBattleLog()

watch(() => battleResult.value, (newResult) => {
  if (newResult) {
    processBattleResult(newResult, challengerLineup.value, targetLineup.value)
  }
}, { immediate: true })

const show = (config) => {
  title.value = config.title || '战斗'
  opponentName.value = config.opponentName || ''
  opponentInfo.value = config.opponentInfo || ''
  showLineup.value = config.showLineup !== false
  challengerLineup.value = config.challengerLineup || null
  targetLineup.value = config.targetLineup || null
  battleFunction = config.battleFunction
  onBattleComplete = config.onBattleComplete

  battleResult.value = null
  isAnimating.value = false
  vis.value = true
}

const startBattle = async () => {
  if (isAnimating.value || !battleFunction) return

  try {
    isAnimating.value = true
    const response = await battleFunction()

    if (response.code !== 200) {
      ElMessage.error(response.msg)
      isAnimating.value = false
      return
    }

    battleResult.value = response.data.battle_result || response.data

    // 如果 targetLineup 是占位符，从战斗结果中提取实际的 NPC 阵容
    if (targetLineup.value && targetLineup.value.slot1?.nickname === '???') {
      extractNpcLineup(battleResult.value)
    }

    if (onBattleComplete) {
      await onBattleComplete(response)
    }

    isAnimating.value = false
    showFinalResult()
  } catch (error) {
    console.error('战斗失败:', error)
    ElMessage.error('战斗失败，请重试')
    isAnimating.value = false
  }
}

const extractNpcLineup = (result) => {
  const battleLog = result?.battleLog || result?.battle_log
  if (!battleLog) return

  const npcLineup = { slot1: null, slot2: null, slot3: null }

  for (const log of battleLog) {
    if (log.target && log.target.slot) {
      const slot = `slot${log.target.slot}`
      if (!npcLineup[slot]) {
        npcLineup[slot] = {
          nickname: log.target.bird_name,
          lv: 0,
          weight: log.target.weight_before
        }
      }
    }
  }

  targetLineup.value = npcLineup
}

const showFinalResult = () => {
  const result = battleResult.value

  if (result.winner === 'challenger') {
    const rewards = result.rewards
    if (rewards) {
      const rewardText = []
      if (rewards.score) rewardText.push(`天梯分 +${rewards.score}`)
      if (rewards.exp) rewardText.push(`经验 +${rewards.exp}`)
      if (rewards.balance_1) {
        const currencyName = getCurrencyName(1)
        rewardText.push(`${currencyName} +${rewards.balance_1}`)
      }

      ElMessage.success({
        message: `恭喜获胜！${rewardText.length > 0 ? '获得：' + rewardText.join('，') : ''}`,
        duration: 5000
      })
    } else {
      ElMessage.success('恭喜获胜！')
    }
  } else {
    const penalties = result.penalties
    if (penalties && penalties.score) {
      ElMessage.warning({
        message: `很遗憾，挑战失败了！天梯分 -${penalties.score}`,
        duration: 3000
      })
    } else {
      ElMessage.warning('很遗憾，挑战失败了！')
    }
  }
}

// 获取货币名称
const getCurrencyName = (balanceId) => {
  const balance = game.player.data?.player_balance?.find(b => b.balance_id === balanceId)
  return balance?.game_config_player_balance?.nickname || '未知'
}

defineExpose({
  show
})
</script>

<style scoped>

.battle-header {
  flex: 0 0 auto;
  padding: 2vh;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1vw;
  font-size: clamp(1rem, 2vw, 1.2rem);
  font-weight: bold;
}

.title-text {
  color: #1e293b;
}

.opponent-name {
  color: #ef4444;
  font-size: clamp(1.1rem, 2.2vw, 1.3rem);
}

.opponent-info {
  color: #f59e0b;
  font-size: clamp(1rem, 2vw, 1.2rem);
  font-weight: bold;
}

.battle-section-top {
  flex: 0 0 20%;
  background: linear-gradient(to bottom, #fef2f2, #fff);
  overflow: hidden;
}

.battle-section-middle {
  flex: 1;
  background: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.battle-section-bottom {
  flex: 0 0 20%;
  background: linear-gradient(to top, #eff6ff, #fff);
  overflow: hidden;
}

.battle-footer {
  flex: 0 0 auto;
  padding: 2vh;
  background: white;
  border-top: 2px solid #e5e7eb;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.battle-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f8fafc;
}

.placeholder-icon {
  font-size: clamp(3rem, 8vw, 4rem);
  margin-bottom: 2vh;
}

.placeholder-text {
  color: #64748b;
  font-size: clamp(0.9rem, 2vw, 1rem);
}

.section-content {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2%;
}

.battle-log-container {
  flex: 1;
  background: white;
  border: 0.2vh solid #cbd5e1;
  border-radius: 1vh;
  padding: 2%;
  overflow-y: auto;
  height: 100%;
  width: 100%;
}

.battle-log-item {
  background: #f8fafc;
  border-left: 0.4vh solid #3b82f6;
  padding: 2%;
  margin-bottom: 2%;
  border-radius: 0.5vh;
}

.battle-log-item:last-child {
  margin-bottom: 0;
}

.round-number {
  font-size: clamp(0.9rem, 2vw, 1.1rem);
  font-weight: bold;
  color: #3b82f6;
  margin-bottom: 1%;
}

.battle-text {
  font-size: clamp(0.85rem, 1.8vw, 1rem);
  color: #1e293b;
  line-height: 1.6;
}

.birds-info-container {
  display: flex;
  flex-direction: row;
  gap: 2%;
  width: 100%;
  height: 100%;
}

.opponent-birds {
  border: 0.3vh solid #ef4444;
  border-radius: 1vh;
  padding: 2%;
  background: rgba(254, 242, 242, 0.5);
}

.my-birds {
  border: 0.3vh solid #3b82f6;
  border-radius: 1vh;
  padding: 2%;
  background: rgba(239, 246, 255, 0.5);
}

.bird-info-card {
  background: white;
  border-radius: 1vh;
  padding: 2%;
  text-align: center;
  box-shadow: 0 0.2vh 0.4vh rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-width: 0;
}

.bird-avatar {
  border: 0.2vh solid #e5e7eb;
  transition: all 0.3s;
}

.bird-avatar.defeated {
  opacity: 0.4;
  filter: grayscale(100%);
  border-color: #9ca3af;
}

.bird-name {
  font-size: clamp(0.75rem, 1.5vw, 0.9rem);
  font-weight: bold;
  color: #1e293b;
  margin-top: 1%;
  margin-bottom: 1%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.bird-level {
  font-size: clamp(0.65rem, 1.3vw, 0.8rem);
  font-weight: normal;
  color: #64748b;
  margin-left: 0.5%;
}

.bird-name.defeated {
  color: #9ca3af;
  text-decoration: line-through;
}

.bird-stats {
  display: flex;
  flex-direction: column;
  gap: 1%;
  font-size: clamp(0.7rem, 1.4vw, 0.85rem);
  color: #64748b;
}

.stat-item {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1%;
}

.stat-item.weight {
  font-weight: bold;
  color: #f59e0b;
  font-size: clamp(0.75rem, 1.5vw, 0.9rem);
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
  font-size: clamp(0.8rem, 1.6vw, 1rem);
  padding: 5%;
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

.battle-text :deep(.final-result-summary) {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  padding: 20px;
  margin-top: 16px;
  border-radius: 8px;
}

.battle-text :deep(.final-result-summary.win) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
}

.battle-text :deep(.final-result-summary.lose) {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);
}

.battle-text :deep(.skill-trigger) {
  background: #f0f9ff;
  border-left: 3px solid #3b82f6;
  padding: 6px 10px;
  margin: 4px 0;
  font-size: 13px;
  color: #1e293b;
}

.battle-text :deep(.skill-trigger .skill-name) {
  color: #8b5cf6;
  font-weight: 600;
  padding: 0 4px;
}

.battle-text :deep(.battle-start-skills) {
  background: #fef3c7;
  border: 2px solid #f59e0b;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.battle-text :deep(.battle-start-skills .section-title) {
  font-size: 14px;
  font-weight: bold;
  color: #92400e;
  margin-bottom: 8px;
  text-align: center;
}

.battle-text :deep(.skill-trigger.battle-start) {
  background: #fffbeb;
  border-left: 3px solid #f59e0b;
}
</style>
