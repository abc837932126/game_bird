import { createApp } from 'vue'
import './style.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import { game } from './game/index.js'
import { checkVersion } from './utils/version-check.js'
import { message } from '@/game/notification-center'
import VConsole from 'vconsole'

// 初始化 vConsole（移动端调试工具）
new VConsole()

  // 2) 再创建并挂载应用
  const app = createApp(App)
  app.use(ElementPlus)
  app.provide('game', game)
  app.mount('#app')

// 启动版本检测（每5分钟检查一次）
  checkVersion()

// 注册训练被偷取通知监听器
game.notificationCenter.on('player_train', 'training_stolen', (wsMessage) => {
	if (wsMessage.data && wsMessage.data.message) {
		message.warning(wsMessage.data.message)
		// 刷新训练场数据
		game.player_train.update()
	}
}, {
	showNotification: true,
	formatMessage: (wsMessage) => ({
		title: '训练场通知',
		body: wsMessage.data?.message || '你的训练场被偷取了'
	})
})
