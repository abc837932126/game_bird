import {request} from "./config.js";

class api {

	getAll = (params) => request('player_trap', 'get_all', params)

	set_bait = (params) => request('player_trap', 'set_bait', params)

	get_bird = (params) => request('player_trap', 'get_bird', params)

	use_player_item_trap_buff = (params) => request('player_trap', 'use_player_item_trap_buff', params)

	unlock_trap = (params) => request('player_trap', 'unlock_trap', params)

	getConfig = (params) => request('player_trap', 'get_config', params)
}

export default class player_trap {

	constructor() {
		this.data = null;
		this.config = null;
		this.api = new api();
	}

	async update() {
		const res = await this.api.getAll()

		if (res.code !== 200) {
			return;
		}

		// 如果是首次加载，直接赋值
		if (!this.data) {
			this.data = res.data;
			return;
		}

		// 智能更新：只更新变化的陷阱，保持数组引用不变
		const newData = res.data;

		// 更新现有陷阱或添加新陷阱
		newData.forEach(newTrap => {
			const existingIndex = this.data.findIndex(t => t.id === newTrap.id);
			if (existingIndex !== -1) {
				// 更新现有陷阱的属性
				Object.assign(this.data[existingIndex], newTrap);
			} else {
				// 添加新陷阱
				this.data.push(newTrap);
			}
		});

		// 移除不存在的陷阱（从后往前删除，避免索引问题）
		for (let i = this.data.length - 1; i >= 0; i--) {
			if (!newData.some(newTrap => newTrap.id === this.data[i].id)) {
				this.data.splice(i, 1);
			}
		}
	}

	async set_bait(trap_id, player_item_id) {
		return await this.api.set_bait({trap_id, player_item_id});
	}

	async get_bird(trap_id) {
		return await this.api.get_bird({trap_id});
	}

	async use_player_item_trap_buff(trap_id, item_id) {
		return await this.api.use_player_item_trap_buff({trap_id, item_id});
	}

	async unlock_trap() {
		return await this.api.unlock_trap({});
	}

	async loadConfig() {
		const res = await this.api.getConfig();
		if (res.code === 200) {
			this.config = res.data;
		}
		return res;
	}

}