import { createApp } from 'vue'
import './style.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import { game } from './game/index.js'
import { checkVersion } from './utils/version-check.js'
import { ElMessage } from 'element-plus'
import { loadOSSConfig } from './config/oss.js'

// 加载 OSS 配置
loadOSSConfig()

const app = createApp(App)
app.use(ElementPlus)
app.provide('game', game)
app.mount('#app')

// 启动版本检测（每5分钟检查一次）
checkVersion()

// 注册训练被偷取通知监听器
game.notificationCenter.on('player_train', 'training_stolen', (message) => {
	if (message.data && message.data.message) {
		ElMessage.warning(message.data.message)
		// 刷新训练场数据
		game.player_train.update()
	}
}, {
	showNotification: true,
	formatMessage: (message) => ({
		title: '训练场通知',
		body: message.data?.message || '你的训练场被偷取了'
	})
})
