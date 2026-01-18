import { game } from './index.js'
import wsClient from './ws-client.js'

// 设置重连成功回调
wsClient.onReconnect(async () => {
  console.log('[WebSocket] 重连成功，刷新游戏数据...')
  if (game.token) {
    await game.refreshGameData()
    console.log('[WebSocket] 游戏数据刷新完成')
  }
})

/**
 * 发送 WebSocket 请求
 * @param {string} type - 消息类型（对应原来的 api，如 player、game_bird 等）
 * @param {string} action - 动作名称（对应原来的具体接口）
 * @param {object} data - 请求数据
 * @param {boolean} withToken - 是否携带 token
 * @returns {Promise} - 返回响应数据
 */
export async function request(type, action, data = {}, withToken = true) {
  try {
    // 如果 WebSocket 未连接，先建立连接
    if (!wsClient.isConnected()) {
      await wsClient.connect()
    }

    // 更新 token
    if (withToken && game.token) {
      wsClient.setToken(game.token)
    }

    // 发送请求并等待响应
    const response = await wsClient.send(type, action, data, withToken)

    // 如果响应包含 token，保存到 game 对象
    if (response.data && response.data.token) {
      game.token = response.data.token
      wsClient.setToken(response.data.token)
    }

    return response
  } catch (error) {
    console.error('[Request] 请求失败:', error)
    return {
      code: error.code || 500,
      msg: error.msg || '请求失败',
      data: null
    }
  }
}

// 导出 WebSocket 客户端实例，供其他地方使用
export { wsClient }