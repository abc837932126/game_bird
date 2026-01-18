import { request } from './config'


// Mock数据 - 任务列表
const MOCK_CHALLENGES = [
	{
		id: 1,
		title: '心意相通',
		desc: '与心仪的玩家互赠礼物达到 10 次',
		icon: '💝',
		progress: 7,
		target: 10,
		completed: false,
		reward: { gold: 1000, item: '爱情羽毛' }
	},
	{
		id: 2,
		title: '并肩作战',
		desc: '与心仪的玩家组队捕获稀有小鸟 5 只',
		icon: '⚔️',
		progress: 5,
		target: 5,
		completed: true,
		reward: { gold: 2000, item: '誓言戒指' }
	},
	{
		id: 3,
		title: '心灵默契',
		desc: '完成情侣问答，答对 8 题以上',
		icon: '🎯',
		progress: 3,
		target: 10,
		completed: false,
		reward: { gold: 1500, item: '缘分手链' }
	},
	{
		id: 4,
		title: '浪漫约会',
		desc: '在彩虹森林约会 3 次',
		icon: '🌈',
		progress: 1,
		target: 3,
		completed: false,
		reward: { gold: 800, item: '约会纪念币' }
	},
	{
		id: 5,
		title: '携手冒险',
		desc: '共同完成 20 次日常任务',
		icon: '🗺️',
		progress: 20,
		target: 20,
		completed: true,
		reward: { gold: 3000, item: '冒险徽章' }
	}
]



// Mock数据 - 结婚道具
const MOCK_MARRIAGE_ITEMS = [
	{
		id: 1001,
		name: '钻石婚戒',
		icon: '💍',
		desc: '永恒爱情的象征，镶嵌99颗钻石',
		count: 1,
		quality: '传说'
	},
	{
		id: 1002,
		name: '黄金婚戒',
		icon: '💍',
		desc: '经典款式的黄金婚戒',
		count: 2,
		quality: '史诗'
	},
	{
		id: 1003,
		name: '玫瑰花束',
		icon: '💐',
		desc: '999朵红玫瑰组成的花束',
		count: 1,
		quality: '稀有'
	},
	{
		id: 1004,
		name: '誓言戒指',
		icon: '💎',
		desc: '刻有两人名字的誓言戒指',
		count: 3,
		quality: '史诗'
	}
]

class api {
	// 获取所有有效婚礼
	getWeddings = () => request('marriage', 'get_weddings', {})

	// 送祝福
	sendBlessing = (weddingId, message, goldCoins) =>
		request('marriage', 'send_blessing', { weddingId, message, goldCoins })

	// 获取任务列表
	getChallenges = () => request('marriage', 'get_challenges', {})

	// 获取人气排行榜
	getRanking = () => request('marriage', 'get_ranking', {})

	// 获取结婚历史
	getHistory = () => request('marriage', 'get_history', {})

	// 发起结婚邀请
	sendProposal = (friendId, itemId) =>
		request('marriage', 'send_proposal', { friendId, itemId })

	// 获取结婚道具列表
	getMarriageItems = () => request('marriage', 'get_marriage_items', {})

	// 获取正在进行的婚礼（不包括自己的）
	getActiveWeddings = () => request('player_marriage', 'get_active_weddings')
}

export default class game_marriage {
	constructor() {
		this.data = {
			weddings: [],      // 当前婚礼列表（Mock数据）
			activeWeddings: [], // 正在进行的婚礼（真实API数据）
			challenges: [],    // 任务列表
			history: [],       // 结婚历史
			marriageItems: []  // 结婚道具（好友列表已移至player_friend）
		}
		this.api = new api()
	}

	async update() {
		// 加载正在进行的婚礼（真实API）
		const activeWeddingsRes = await this.api.getActiveWeddings()
		if (activeWeddingsRes.code === 200) {
			this.data.activeWeddings = activeWeddingsRes.data || []
		}

		// 加载结婚历史记录（真实API）
		const { game } = await import('./index.js')
		const historyRes = await game.player_marriage.api.getMarriageHistory()
		if (historyRes.code === 200) {
			this.data.history = historyRes.data || []
		}

		// 使用 Mock 数据（临时，其他功能待开发）
		// 后续替换为真实 API 调用
		// 注意：好友列表数据来自 player_friend，不在此处加载
		this.data.challenges = MOCK_CHALLENGES
		this.data.marriageItems = MOCK_MARRIAGE_ITEMS
	}

	// 工具方法：检查婚礼是否过期（24小时）
	isWeddingExpired(wedding) {
		const expiresAt = new Date(wedding.expiresAt).getTime()
		return Date.now() > expiresAt
	}

	// 获取有效的婚礼列表（真实API数据）
	getActiveWeddings() {
		return this.data.activeWeddings
	}
}

