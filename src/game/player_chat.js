import {request, wsClient} from './config'
import { markRaw } from 'vue'

class api {
  // 发送世界聊天消息
  sendWorld = (content) => request('chat', 'send_world', { content })

  // 获取聊天历史
  getHistory = (limit = 50, offset = 0) => request('chat', 'get_history', { limit, offset })

  // 发送 NPC 消息（系统内部使用）
  sendNpc = (npc_name, content) => request('chat', 'send_npc', { npc_name, content })
}

export default class player_chat {
  constructor() {
    this.data = [] // 聊天消息列表
    this.api = new api()
    this.isListening = false
    this.callback = null
    this.lastMessageIds = new Set() // 添加消息ID集合用于去重
  }

  /**
   * 获取聊天历史
   */
  async update() {
    const res = await this.api.getHistory()
    if (res.code !== 200) {
      return
    }
    // 使用 markRaw 防止 Vue 将消息对象深度响应式化，减少内存占用
    this.data = (res.data || []).map(msg => markRaw(msg))

    // 同步ID集合
    this.lastMessageIds.clear()
    this.data.forEach(msg => {
      if (msg.id) {
        this.lastMessageIds.add(msg.id)
      }
    })
  }

  /**
   * 发送聊天消息
   */
  async send(content) {
    return await this.api.sendWorld(content)
  }


}
