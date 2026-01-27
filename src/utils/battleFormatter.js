/**
 * 格式化效果描述
 * @param {Object} effect - 效果对象
 * @param {String} targetName - 目标鸟名
 * @returns {String} 格式化的效果文本
 */
export function formatEffect(effect, targetName) {
  switch (effect.effectType) {
    case 'weight_add':
      return `${targetName}体重${effect.value > 0 ? '+' : ''}${effect.value.toFixed(2)}kg`
    case 'weight_multiply':
      if (effect.actualValue !== undefined) {
        return `${targetName}体重${effect.value > 0 ? '+' : ''}${effect.value}% (${effect.actualValue > 0 ? '+' : ''}${effect.actualValue.toFixed(2)}kg)`
      }
      return `${targetName}体重${effect.value > 0 ? '+' : ''}${effect.value}%`
    case 'restraint_add':
      return `${targetName}克制值${effect.value > 0 ? '+' : ''}${effect.value}`
    case 'restraint_multiply':
      if (effect.actualValue !== undefined) {
        return `${targetName}克制值${effect.value > 0 ? '+' : ''}${effect.value}% (${effect.actualValue > 0 ? '+' : ''}${effect.actualValue.toFixed(2)})`
      }
      return `${targetName}克制值${effect.value > 0 ? '+' : ''}${effect.value}%`
    case 'type_change':
      return `${targetName}类型变为${effect.value}`
    case 'instant_kill':
      return `${targetName}被即死`
    case 'immunity':
      return `${targetName}获得免疫`
    default:
      return `产生了效果`
  }
}

/**
 * 生成技能触发日志HTML
 * @param {Array} skillLogs - 技能日志数组
 * @returns {String} HTML字符串
 */
export function generateSkillLogsHtml(skillLogs) {
  if (!skillLogs || skillLogs.length === 0) return ''

  return skillLogs.map(log => {
    const ownerName = log.owner.bird_name
    const ownerColor = log.owner.side === 'challenger' ? 'blue' : 'red'

    // 处理克制关系日志
    if (log.type === 'restraint_bonus') {
      const effectTexts = log.effects.map(effect => {
        return formatEffect(effect, ownerName)
      }).join('，')

      return `<div class="skill-trigger restraint">
        <span class="bird-name ${ownerColor}">${ownerName}</span>
        克制加成：${effectTexts}
      </div>`
    }

    // 处理技能触发日志
    const skillName = log.skill?.name || '未知技能'
    const skillDesc = log.skill?.description || ''

    const effectTexts = log.effects.map(effect => {
      const targetName = log.targets.find(
        t => t.slot === effect.targetSlot && t.side === effect.targetSide
      )?.bird_name || '目标'

      return formatEffect(effect, targetName)
    }).join('，')

    return `<div class="skill-trigger">
      <span class="bird-name ${ownerColor}">${ownerName}</span>
      触发了 <span class="skill-name" title="${skillDesc}">${skillName}</span>
      ${effectTexts ? `：${effectTexts}` : ''}
    </div>`
  }).join('')
}

/**
 * 生成战斗开始前的技能日志HTML
 * @param {Array} battleLog - 完整战斗日志
 * @returns {String} HTML字符串
 */
export function generateBattleStartSkillsHtml(battleLog) {
  if (!battleLog || battleLog.length === 0) return ''

  // 收集所有 battle_start 时机的技能
  const battleStartSkills = []

  for (const log of battleLog) {
    if (log.skill_logs) {
      for (const skillLog of log.skill_logs) {
        if (skillLog.timing === 'battle_start') {
          battleStartSkills.push(skillLog)
        }
      }
    }
  }

  if (battleStartSkills.length === 0) return ''

  const skillsHtml = battleStartSkills.map(log => {
    const ownerName = log.owner.bird_name
    const skillName = log.skill.name
    const skillDesc = log.skill.description || ''
    const ownerColor = log.owner.side === 'challenger' ? 'blue' : 'red'

    const effectTexts = log.effects.map(effect => {
      const targetName = log.targets.find(
        t => t.slot === effect.targetSlot && t.side === effect.targetSide
      )?.bird_name || '目标'

      return formatEffect(effect, targetName)
    }).join('，')

    return `<div class="skill-trigger battle-start">
      <span class="bird-name ${ownerColor}">${ownerName}</span>
      的 <span class="skill-name" title="${skillDesc}">${skillName}</span>
      ${effectTexts ? `：${effectTexts}` : ''}
    </div>`
  }).join('')

  return `<div class="battle-start-skills">
    <div class="section-title">⚡ 战斗开始前触发的技能</div>
    ${skillsHtml}
  </div>`
}

/**
 * 生成战斗文本HTML
 * @param {Object} log - 战斗日志条目
 * @returns {String} HTML字符串
 */
export function generateBattleTextHtml(log) {
  const challengerBirdName = log.challenger.bird_name
  const targetBirdName = log.target.bird_name
  const challengerWeight = log.challenger.battle_weight.toFixed(2)
  const targetWeight = log.target.battle_weight.toFixed(2)

  // 显示回合开始时的技能和克制关系加成
  const roundSkills = log.skill_logs?.filter(s => s.timing === 'round_start' || s.type === 'restraint_bonus') || []
  const skillLogsHtml = generateSkillLogsHtml(roundSkills)

  if (log.winner === 'challenger') {
    const weightChange = (log.challenger.weight_before - log.challenger.weight_after).toFixed(2)
    return `${skillLogsHtml}<span class="bird-name blue">${challengerBirdName}</span><span class="bird-weight">(${challengerWeight}kg)</span> 对战 <span class="bird-name red">${targetBirdName}</span><span class="bird-weight">(${targetWeight}kg)</span> <span class="result-win">（胜利）</span> <span class="weight-change">（体重-${weightChange}kg）</span> <span class="bird-down red">（对方${targetBirdName}下场）</span>`
  } else if (log.winner === 'target') {
    const weightChange = (log.target.weight_before - log.target.weight_after).toFixed(2)
    return `${skillLogsHtml}<span class="bird-name blue">${challengerBirdName}</span><span class="bird-weight">(${challengerWeight}kg)</span> 对战 <span class="bird-name red">${targetBirdName}</span><span class="bird-weight">(${targetWeight}kg)</span> <span class="result-lose">（失败）</span> <span class="weight-change">（对方体重-${weightChange}kg）</span> <span class="bird-down blue">（我方${challengerBirdName}下场）</span>`
  } else {
    return `${skillLogsHtml}<span class="bird-name blue">${challengerBirdName}</span><span class="bird-weight">(${challengerWeight}kg)</span> 对战 <span class="bird-name red">${targetBirdName}</span><span class="bird-weight">(${targetWeight}kg)</span> <span class="result-draw">（平局）</span> <span class="bird-down gray">（双方下场）</span>`
  }
}

/**
 * 生成最终结果HTML
 * @param {String} winner - 'challenger' 或 'target'
 * @returns {String} HTML字符串
 */
export function generateFinalResultHtml(winner) {
  return winner === 'challenger'
    ? '<div class="final-result-summary win">🎉 挑战胜利！</div>'
    : '<div class="final-result-summary lose">💔 挑战失败！</div>'
}
