import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 读取 update-version.js 文件
const updateVersionPath = resolve(__dirname, 'update-version.js')
let content = readFileSync(updateVersionPath, 'utf-8')

// 使用正则表达式清空 changelog 数组
// 匹配 changelog: [ ... ] 的内容，替换为空数组
content = content.replace(
  /(changelog:\s*\[)[^\]]*(\])/s,
  '$1\n\n  $2'
)

// 写回文件
writeFileSync(updateVersionPath, content, 'utf-8')

console.log('[Build] Changelog 已清空，准备下次更新')
