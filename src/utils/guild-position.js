/**
 * 工会职位配置和工具函数
 */

// 职位等级配置（默认配置，实际应从后端获取）
export const POSITION_CONFIG = {
  1: { name: '会长', tag_type: 'danger', can_manage: true },
  2: { name: '副会长', tag_type: 'warning', can_manage: true },
  3: { name: '官员', tag_type: 'warning', can_manage: true },
  4: { name: '精英', tag_type: 'success', can_manage: false },
  5: { name: '成员', tag_type: 'info', can_manage: false }
}

/**
 * 获取职位名称
 */
export function getPositionName(position_lv) {
  return POSITION_CONFIG[position_lv]?.name || '成员'
}

/**
 * 获取职位标签类型 (Element Plus tag type)
 */
export function getPositionTagType(position_lv) {
  return POSITION_CONFIG[position_lv]?.tag_type || 'info'
}

/**
 * 判断是否有管理权限（基于后端配置）
 */
export function canManageGuild(guildData) {
  const config = guildData?.my_position_config
  if (!config) return false
  return config.can_invite_member || config.can_approve_application || config.can_kick_member
}

/**
 * 判断是否为会长
 */
export function isLeader(position_lv) {
  return position_lv === 1
}

/**
 * 判断是否可以升职某个成员（基于后端配置）
 */
export function canPromoteMember(guildData, memberPositionLv) {
  const config = guildData?.my_position_config
  if (!config || !config.can_promote) return false
  const myPositionLv = getMyPositionLv(guildData)
  // 只能升职职位比自己低的成员，且升职后不能和自己同级
  return memberPositionLv > myPositionLv + 1
}

/**
 * 判断是否可以降职某个成员（基于后端配置）
 */
export function canDemoteMember(guildData, memberPositionLv) {
  const config = guildData?.my_position_config
  if (!config || !config.can_demote) return false
  const myPositionLv = getMyPositionLv(guildData)
  // 只能降职职位比自己低的成员
  return memberPositionLv > myPositionLv
}

/**
 * 判断是否可以踢出某个成员（基于后端配置）
 */
export function canKickMember(guildData, memberPositionLv, isMe) {
  const config = guildData?.my_position_config
  if (!config || !config.can_kick_member) return false
  const myPositionLv = getMyPositionLv(guildData)
  // 只能踢出职位比自己低的成员，且不能踢出自己
  return memberPositionLv > myPositionLv && !isMe
}

/**
 * 获取我的职位等级
 */
export function getMyPositionLv(guildData) {
  return guildData?.my_position_lv || 5
}

/**
 * 获取成员职位等级
 */
export function getMemberPositionLv(member) {
  return member.position_lv || 5
}
