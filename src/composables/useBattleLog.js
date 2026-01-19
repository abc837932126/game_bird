import { ref } from 'vue'
import {
  generateBattleTextHtml,
  generateFinalResultHtml,
  generateBattleStartSkillsHtml
} from '@/utils/battleFormatter'

export function useBattleLog() {
  const displayedLogs = ref([])
  const challengerBirdsState = ref([])
  const targetBirdsState = ref([])

  /**
   * 初始化鸟状态
   */
  function initBirdsState(challengerLineup, targetLineup) {
    challengerBirdsState.value = []
    targetBirdsState.value = []

    // 初始化挑战方阵容
    if (challengerLineup) {
      for (let i = 1; i <= 3; i++) {
        const bird = challengerLineup[`slot${i}`]
        if (bird) {
          challengerBirdsState.value.push({
            slot: i,
            currentWeight: bird.weight,
            isDefeated: false
          })
        }
      }
    }

    // 初始化目标方阵容
    if (targetLineup) {
      for (let i = 1; i <= 3; i++) {
        const bird = targetLineup[`slot${i}`]
        if (bird) {
          targetBirdsState.value.push({
            slot: i,
            currentWeight: bird.weight,
            isDefeated: false
          })
        }
      }
    }
  }

  /**
   * 更新鸟状态
   */
  function updateBirdState(log) {
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
  }

  /**
   * 处理战斗结果并生成显示日志
   */
  function processBattleResult(battleResult, challengerLineup, targetLineup) {
    const battleLog = battleResult?.battleLog || battleResult?.battle_log
    if (!battleLog) return

    initBirdsState(challengerLineup, targetLineup)

    const logs = []

    // 添加战斗开始前的技能（如果有）
    const battleStartSkillsHtml = generateBattleStartSkillsHtml(battleLog)
    if (battleStartSkillsHtml) {
      logs.push({
        round: null,
        text: battleStartSkillsHtml
      })
    }

    for (const log of battleLog) {
      if (log.round) {
        logs.push({
          round: log.round,
          text: generateBattleTextHtml(log)
        })

        updateBirdState(log)
      }
    }

    logs.push({
      round: null,
      text: generateFinalResultHtml(battleResult.winner)
    })

    displayedLogs.value = logs
  }

  /**
   * 获取鸟状态
   */
  function getBirdState(birdStates, slot) {
    return birdStates.find(b => b && b.slot === slot)
  }

  return {
    displayedLogs,
    challengerBirdsState,
    targetBirdsState,
    initBirdsState,
    processBattleResult,
    getBirdState
  }
}
