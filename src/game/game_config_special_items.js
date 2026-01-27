
import { request } from './config'

class api {
	// 获取特殊道具配置
	get = () => request('game_config_special_items', 'get')
}

export default class game_config_special_items {
	constructor() {
		this.data = null;
		this.api = new api();
	}

	// 更新特殊道具配置数据
	async update() {
		const res = await this.api.get()

		if (res.code !== 200) {
			return;
		}

		this.data = res.data;
	}

	// 获取成长药水配置
	get_growth_potion() {
		return this.data?.growth_potion;
	}

	// 获取多胎丸配置
	get_fertility_pill() {
		return this.data?.fertility_pill;
	}

	// 获取稳定剂配置
	get_stabilizer() {
		return this.data?.stabilizer;
	}

	// 获取战斗恢复卡配置
	get_battle_recovery_card() {
		return this.data?.battle_recovery_card;
	}

	// 获取离婚卡配置
	get_divorce_card() {
		return this.data?.divorce_card;
	}

	// 获取改名卡配置
	get_rename_card() {
		return this.data?.rename_card;
	}

	// 获取变性卡配置
	get_sex_change_card() {
		return this.data?.sex_change_card;
	}

	// 获取所有配置
	get_all() {
		return this.data;
	}
}
