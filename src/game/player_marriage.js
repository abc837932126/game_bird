import { request } from './config'

class api {

	// 发起求婚
	propose = (friend_id, player_item_ring_id) => request('player_marriage', 'propose', { friend_id, player_item_ring_id })

	// 同意求婚
	accept = (proposal_id) => request('player_marriage', 'accept', { proposal_id })

	// 拒绝求婚
	reject = (proposal_id) => request('player_marriage', 'reject', { proposal_id })

	// 取消求婚
	cancel = (proposal_id) => request('player_marriage', 'cancel', { proposal_id })

	// 获取求婚列表
	getList = () => request('player_marriage', 'get_list')

	// 开始婚礼
	startWedding = (proposal_id, marriage_item_id) => request('player_marriage', 'start_wedding', { proposal_id, marriage_item_id })

	// 获取正在进行的婚礼列表（不包括自己的）
	getActiveWeddings = () => request('player_marriage', 'get_active_weddings')

	// 获取玩家的婚姻信息
	getPlayerMarriage = (player_id) => request('player_marriage', 'get_player_marriage', { player_id })

	// 送祝福
	sendBlessing = (marriage_id, message, amount) => request('player_marriage', 'send_blessing', { marriage_id, message, amount })

	// 离婚
	divorce = () => request('player_marriage', 'divorce')

	// 获取结婚历史记录
	getMarriageHistory = () => request('player_marriage', 'get_marriage_history')

}

export default class player_marriage {

	constructor() {
		this.data = null;
		this.api = new api();
	}

	async update() {
		const res = await this.api.getList()

		if (res.code !== 200) {
			return;
		}

		this.data = res.data;
	}

}
