import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 获取北京时间格式化字符串
function getBeijingTime() {
  return new Date().toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

// 生成版本信息
const version = {
  version: '1.1.1',
  buildTime: getBeijingTime(),
  changelog: [

  ]
}

// 写入 public/version.json
const versionPath = resolve(__dirname, '../public/version.json')
writeFileSync(versionPath, JSON.stringify(version, null, 2))

console.log(`[Build] 版本信息已更新: ${version.buildTime}`)
