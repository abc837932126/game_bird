/**
 * OSS 对象存储配置
 * RainS3 兼容 S3 协议的对象存储服务
 */
export const OSS_CONFIG = {
  // OSS 公开访问域名（从后端获取）
  BASE_URL: 'https://bird.cn-nb1.rains3.com',
}

/**
 * 类型到路径的映射表
 */
const TYPE_PATH_MAP = {
  'nest': 'img/item/nest',
  'bait': 'img/item/bait',
  'trap': 'img/item/trap',
  'train': 'img/item/train',
  'trap_buff': 'img/prop',
  'train_buff': 'img/prop',
  'nest_buff': 'img/prop',
  'ring': 'img/item/ring',
  'bird_exp': 'img/item/prop',
  'gift': 'img/gift',
  'bird': 'img/bird',
  'item': 'img/item',
  'bg': 'img/bg',
  'map': 'img/map',
  'head': 'img/head',
  'avatar': 'img/avatar',
}

/**
 * 获取图片 URL
 * @param {string} type - 图片类型，如 'bird', 'nest', 'bait', 'trap' 等
 * @param {string} nickname - 图片名称（不含扩展名）
 * @param {string} suffix - 可选的文件名后缀，如 '_big'
 * @param {string} ext - 文件扩展名，默认为 '.png'
 * @returns {string} 完整的图片 URL
 */
export function getImageUrl(type, nickname, suffix = '', ext = '.png') {
  const name = nickname || 'default'
  const pathPrefix = TYPE_PATH_MAP[type] || `img/${type}`
  const path = `${pathPrefix}/${name}${suffix}${ext}`
  return `${OSS_CONFIG.BASE_URL}/${path}`
}
