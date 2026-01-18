import { request } from './config.js'

class api {
	sendByPurchase = (params) => request('player_gift', 'send_by_purchase', params)
	sendFromBackpack = (params) => request('player_gift', 'send_from_backpack', params)
	convertValue = () => request('player_gift', 'convert_value')
	getReceivedLog = (params) => request('player_gift', 'get_received_log', params)
	getSentLog = (params) => request('player_gift', 'get_sent_log', params)
	getPlayerReceivedLog = (params) => request('player_gift', 'get_player_received_log', params)
}

export default class player_gift {
	constructor() {
		this.api = new api()
	}

	/**
	 * 购买并赠送礼物
	 */
	async sendByPurchase(receiver_id, game_item_gift_id, count) {
		return await this.api.sendByPurchase({ receiver_id, game_item_gift_id, count })
	}

	/**
	 * 从背包赠送礼物
	 */
	async sendFromBackpack(receiver_id, game_item_gift_id, count) {
		return await this.api.sendFromBackpack({ receiver_id, game_item_gift_id, count })
	}

	/**
	 * 兑换礼物价值为货币
	 */
	async convertValue() {
		return await this.api.convertValue()
	}

	/**
	 * 获取收到的礼物记录
	 */
	async getReceivedLog(page = 1, page_size = 20) {
		return await this.api.getReceivedLog({ page, page_size })
	}

	/**
	 * 获取送出的礼物记录
	 */
	async getSentLog(page = 1, page_size = 20) {
		return await this.api.getSentLog({ page, page_size })
	}

	/**
	 * 获取指定玩家收到的礼物记录
	 */
	async getPlayerReceivedLog(player_id) {
		return await this.api.getPlayerReceivedLog({ player_id })
	}
}
