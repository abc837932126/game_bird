/**
 * WebSocket 客户端封装类
 * 基于 type 和 action 的消息路由
 */
class WebSocketClient {
  constructor(url) {
    this.url = url
    this.ws = null
    this.connected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000
    this.messageQueue = []
    this.token = null
    this.onReconnectCallback = null

    // 消息处理器，按 type + action 注册
    this.handlers = new Map()

    // 一次性响应回调（用于 request 方法）
    this.pendingRequests = new Map()
  }

  /**
   * 连接 WebSocket
   */
  connect(isReconnect = false) {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {

          this.connected = true
          const wasReconnecting = this.reconnectAttempts > 0
          this.reconnectAttempts = 0

          // 发送队列中的消息
          this.flushMessageQueue()

          // 如果是重连成功，调用回调
          if (wasReconnecting && this.onReconnectCallback) {
            this.onReconnectCallback()
          }

          resolve()
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data)
        }

        this.ws.onerror = (error) => {

          if (!this.connected) {
            reject(error)
          }
        }

        this.ws.onclose = () => {

          this.connected = false
          this.attemptReconnect()
        }
      } catch (error) {

        reject(error)
      }
    })
  }

  /**
   * 处理接收到的消息
   */
  handleMessage(data) {
    try {
      const message = JSON.parse(data)


      const { type, action, code, msg, data: responseData } = message

      // 先检查是否有等待中的请求（用于 request 方法）
      const key = `${type}:${action}`
      if (this.pendingRequests.has(key)) {
        const callbacks = this.pendingRequests.get(key)
        // 调用所有等待的回调
        callbacks.forEach(callback => callback(message))
        this.pendingRequests.delete(key)
      }

      // 再调用注册的处理器（用于持续监听）
      if (this.handlers.has(key)) {
        const handlers = this.handlers.get(key)
        // 调用所有注册的处理器
        handlers.forEach(handler => {
          try {
            handler(message)
          } catch (error) {
            console.error('[WebSocket] 处理器执行出错:', error)
          }
        })
      }
    } catch (error) {
      console.error('[WebSocket] 解析消息失败:', error)
    }
  }

  /**
   * 注册消息处理器（持续监听某个 type + action 的消息）
   * 支持同一个消息注册多个处理器
   */
  on(type, action, handler) {
    const key = `${type}:${action}`
    if (!this.handlers.has(key)) {
      this.handlers.set(key, [])
    }
    this.handlers.get(key).push(handler)
  }

  /**
   * 取消注册消息处理器
   */
  off(type, action, handler = null) {
    const key = `${type}:${action}`
    if (!this.handlers.has(key)) {
      return
    }
    if (handler) {
      // 移除特定处理器
      const handlers = this.handlers.get(key)
      const index = handlers.indexOf(handler)
      if (index !== -1) {
        handlers.splice(index, 1)
      }
      // 如果没有处理器了，删除 key
      if (handlers.length === 0) {
        this.handlers.delete(key)
      }
    } else {
      // 移除所有处理器
      this.handlers.delete(key)
    }
  }

  /**
   * 发送消息并等待响应（Promise 方式）
   */
  send(type, action, data = {}, withToken = true) {
    return new Promise((resolve, reject) => {
      const message = {
        type,
        action,
        data
      }

      // 添加 token
      if (withToken && this.token) {
        message.token = this.token
      }

      // 注册一次性回调
      const key = `${type}:${action}`
      if (!this.pendingRequests.has(key)) {
        this.pendingRequests.set(key, [])
      }
      this.pendingRequests.get(key).push((response) => {
        if (response.code === 200) {
          resolve(response)
        } else {
          resolve(response) // 仍然 resolve，让调用者处理错误
        }
      })

      // 如果已连接，直接发送；否则加入队列
      if (this.connected && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify(message))

        } catch (error) {
          console.error('[WebSocket] 发送失败:', error)
          reject(error)
        }
      } else {
        console.log('[WebSocket] 未连接，消息加入队列')
        this.messageQueue.push({ message, resolve, reject })
      }

      // 设置超时
      setTimeout(() => {
        const callbacks = this.pendingRequests.get(key)
        if (callbacks && callbacks.length > 0) {
          reject(new Error('请求超时'))
          this.pendingRequests.delete(key)
        }
      }, 30000) // 30秒超时
    })
  }

  /**
   * 发送队列中的消息
   */
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const { message } = this.messageQueue.shift()
      try {
        this.ws.send(JSON.stringify(message))

      } catch (error) {
        console.error('[WebSocket] 发送队列消息失败:', error)
      }
    }
  }

  /**
   * 尝试重连
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] 超过最大重连次数')
      return
    }

    this.reconnectAttempts++
    console.log(`[WebSocket] ${this.reconnectDelay}ms 后尝试第 ${this.reconnectAttempts} 次重连...`)

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error('[WebSocket] 重连失败:', error)
      })
    }, this.reconnectDelay)
  }

  /**
   * 设置 token
   */
  setToken(token) {
    this.token = token
  }

  /**
   * 设置重连成功回调
   */
  onReconnect(callback) {
    this.onReconnectCallback = callback
  }

  /**
   * 关闭连接
   */
  close() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
      this.connected = false
    }
  }

  /**
   * 获取连接状态
   */
  isConnected() {
    return this.connected && this.ws && this.ws.readyState === WebSocket.OPEN
  }
}

// 根据环境变量获取 WebSocket URL
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:3000'

console.log('[WebSocket] 使用的 WebSocket 地址:', WS_URL)

// 创建单例实例
const wsClient = new WebSocketClient(WS_URL)

export default wsClient
