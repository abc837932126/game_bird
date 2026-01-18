import { ElMessageBox } from 'element-plus'

// 当前版本（从本地读取）
let currentVersion = null

/**
 * 检查是否有新版本
 */
async function checkForUpdate() {
  try {
    // 添加时间戳防止缓存 version.json
    const response = await fetch(`/version.json?t=${Date.now()}`)
    if (!response.ok) return

    const remoteVersion = await response.json()

    // 首次加载，记录当前版本
    if (currentVersion === null) {
      currentVersion = remoteVersion.buildTime
      return
    }

    // 检测版本是否更新
    if (remoteVersion.buildTime !== currentVersion) {
      // 构建更新内容 HTML
      let changelogHTML = '<p style="margin-bottom: 12px; color: #606266;">发现新版本，建议刷新页面以获得最佳体验。</p>'

      if (remoteVersion.changelog && remoteVersion.changelog.length > 0) {
        changelogHTML += '<div style="text-align: left; margin-top: 16px;">'
        changelogHTML += '<p style="font-weight: bold; margin-bottom: 8px; color: #303133;">本次更新内容：</p>'
        changelogHTML += '<ul style="margin: 0; padding-left: 20px; color: #606266;">'
        remoteVersion.changelog.forEach(item => {
          changelogHTML += `<li style="margin-bottom: 6px;">${item}</li>`
        })
        changelogHTML += '</ul></div>'
      }

      // 发现新版本，提示用户刷新
      ElMessageBox.confirm(
        changelogHTML,
        '版本更新提示',
        {
          confirmButtonText: '立即刷新',
          cancelButtonText: '稍后刷新',
          type: 'info',
          showClose: false,
          closeOnClickModal: false,
          closeOnPressEscape: false,
          dangerouslyUseHTMLString: true
        }
      )
        .then(() => {
          // 用户点击刷新
          window.location.reload()
        })
        .catch(() => {
          // 用户点击稍后刷新，10分钟后再次提醒
          setTimeout(() => {
            currentVersion = null
            checkForUpdate()
          }, 10 * 60 * 1000)
        })
    }
  } catch (error) {
    console.error('[Version Check] 检查版本失败:', error)
  }
}

/**
 * 启动版本检测
 * @param {number} interval - 检查间隔（毫秒），默认1分钟
 */
export function checkVersion(interval = 60 * 1000) {
  // 立即检查一次
  checkForUpdate()

  // 定时检查
  setInterval(checkForUpdate, interval)
}
