import wsClient from './ws-client.js'
import { ElNotification, ElMessage, ElMessageBox } from 'element-plus'

/**
 * 通知中心 - 统一管理所有 WebSocket 通知和消息提示
 */
class NotificationCenter {
	constructor() {
		// 存储所有已注册的处理器 { 'type:action': [handler1, handler2, ...] }
		this.handlers = new Map()
		// 是否已初始化
		this.initialized = false
		// 通知历史记录（可选）
		this.history = []
		// 最大历史记录数
		this.maxHistory = 50
	}

	/**
	 * 初始化通知中心，注册所有通知监听器
	 */
	init() {
		if (this.initialized) {
			console.warn('[NotificationCenter] 通知中心已初始化')
			return
		}

		this.initialized = true
		console.log('[NotificationCenter] 通知中心已启动')
	}

	// ==================== 消息提示方法 ====================

	/**
	 * 显示成功消息
	 * @param {string} message - 消息内容
	 * @param {Object} options - 可选配置
	 */
	success(message, options = {}) {
		return ElMessage({
			message,
			type: 'success',
			duration: 3000,
			...options
		})
	}

	/**
	 * 显示错误消息
	 * @param {string} message - 消息内容
	 * @param {Object} options - 可选配置
	 */
	error(message, options = {}) {
		return ElMessage({
			message,
			type: 'error',
			duration: 3000,
			...options
		})
	}

	/**
	 * 显示警告消息
	 * @param {string} message - 消息内容
	 * @param {Object} options - 可选配置
	 */
	warning(message, options = {}) {
		return ElMessage({
			message,
			type: 'warning',
			duration: 3000,
			...options
		})
	}

	/**
	 * 显示信息消息
	 * @param {string} message - 消息内容
	 * @param {Object} options - 可选配置
	 */
	info(message, options = {}) {
		return ElMessage({
			message,
			type: 'info',
			duration: 3000,
			...options
		})
	}

	/**
	 * 显示确认对话框
	 * @param {string} message - 消息内容
	 * @param {string} title - 标题（可选，默认"提示"）
	 * @param {Object} options - 可选配置
	 * @returns {Promise} 返回 Promise，确认时 resolve，取消时 reject
	 */
	confirm(message, title = '提示', options = {}) {
		return ElMessageBox.confirm(message, title, {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
			...options
		})
	}

	// ==================== WebSocket 通知方法 ====================

	/**
	 * 注册通知处理器
	 * @param {string} type - 消息类型（如 'player_nest', 'chat' 等）
	 * @param {string} action - 动作名称（如 'nest_updated', 'world_message' 等）
	 * @param {Function} handler - 处理函数 (message) => {}
	 * @param {Object} options - 可选配置
	 * @param {boolean} options.showNotification - 是否显示通知弹窗（默认 false）
	 * @param {Function} options.formatMessage - 自定义通知消息格式化函数
	 */
	on(type, action, handler, options = {}) {
		const key = `${type}:${action}`

		// 如果是第一次注册这个通知类型，向 wsClient 注册监听器
		if (!this.handlers.has(key)) {
			this.handlers.set(key, [])

			// 在 wsClient 上注册统一的处理器
			wsClient.on(type, action, (message) => {
				this._handleNotification(key, message, options)
			})
		}

		// 检查是否已存在相同的处理器，避免重复注册
		const handlers = this.handlers.get(key)
		const exists = handlers.some(h => h.handler === handler)
		if (!exists) {
			// 添加处理器到列表
			handlers.push({ handler, options })
		}
	}

	/**
	 * 取消注册通知处理器
	 * @param {string} type - 消息类型
	 * @param {string} action - 动作名称
	 * @param {Function} handler - 要移除的处理函数（可选，不传则移除所有）
	 */
	off(type, action, handler = null) {
		const key = `${type}:${action}`

		if (!this.handlers.has(key)) {
			return
		}

		if (handler) {
			// 移除特定处理器
			const handlers = this.handlers.get(key)
			const index = handlers.findIndex(h => h.handler === handler)
			if (index !== -1) {
				handlers.splice(index, 1)
			}

			// 如果没有处理器了，从 wsClient 取消监听
			if (handlers.length === 0) {
				this.handlers.delete(key)
				wsClient.off(type, action)
			}
		} else {
			// 移除所有处理器
			this.handlers.delete(key)
			wsClient.off(type, action)
		}
	}

	/**
	 * 处理通知（内部方法）
	 */
	_handleNotification(key, message, options) {
		// 保存到历史记录
		this._addToHistory({
			key,
			message,
			timestamp: Date.now()
		})

		// 调用所有注册的处理器
		const handlers = this.handlers.get(key) || []
		handlers.forEach(({ handler, options: handlerOptions }) => {
			try {
				handler(message)

				// 如果配置了显示通知
				if (handlerOptions.showNotification) {
					this._showNotification(message, handlerOptions)
				}
			} catch (error) {
				console.error(`[NotificationCenter] 处理器执行出错:`, error)
			}
		})
	}

	/**
	 * 显示通知弹窗
	 */
	_showNotification(message, options) {
		let title = '新通知'
		let body = ''

		// 如果提供了自定义格式化函数
		if (options.formatMessage) {
			const formatted = options.formatMessage(message)
			title = formatted.title || title
			body = formatted.body || ''
		} else {
			// 默认格式
			body = message.msg || JSON.stringify(message.data)
		}

		ElNotification({
			title,
			message: body,
			type: 'info',
			duration: 3000,
			position: 'top-right'
		})
	}

	/**
	 * 添加到历史记录
	 */
	_addToHistory(item) {
		this.history.push(item)

		// 限制历史记录数量
		if (this.history.length > this.maxHistory) {
			this.history.shift()
		}
	}

	/**
	 * 获取通知历史记录
	 */
	getHistory() {
		return [...this.history]
	}

	/**
	 * 清空历史记录
	 */
	clearHistory() {
		this.history = []
	}

	/**
	 * 清理所有监听器
	 */
	destroy() {
		this.handlers.forEach((_, key) => {
			const [type, action] = key.split(':')
			wsClient.off(type, action)
		})
		this.handlers.clear()
		this.initialized = false
		console.log('[NotificationCenter] 通知中心已销毁')
	}
}

// 导出单例
export const notificationCenter = new NotificationCenter()
export default notificationCenter

// 导出便捷的消息方法，统一的通知接口
export const message = {
	success: (msg, options) => notificationCenter.success(msg, options),
	error: (msg, options) => notificationCenter.error(msg, options),
	warning: (msg, options) => notificationCenter.warning(msg, options),
	info: (msg, options) => notificationCenter.info(msg, options),
	confirm: (msg, title, options) => notificationCenter.confirm(msg, title, options)
}
