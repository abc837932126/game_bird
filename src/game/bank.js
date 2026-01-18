import { reactive } from 'vue'
import { request } from './config'

class api {
	deposit = (currency_type, amount) => request('bank', 'deposit', { currency_type, amount })
	withdraw = (currency_type, amount) => request('bank', 'withdraw', { currency_type, amount })
	get_info = () => request('bank', 'get_info')
	upgrade_limit = () => request('bank', 'upgrade_limit')
}

export default class bank {
	constructor() {
		this.api = new api()
		this.data = reactive({})
	}

	async update() {
		const res = await this.api.get_info()
		if (res.code === 200) {
			this.data = reactive(res.data)
		}
		return res
	}

	async deposit(currency_type, amount) {
		const res = await this.api.deposit(currency_type, amount)
		if (res.code === 200) {
			await this.update()
		}
		return res
	}

	async withdraw(currency_type, amount) {
		const res = await this.api.withdraw(currency_type, amount)
		if (res.code === 200) {
			await this.update()
		}
		return res
	}

	async upgradeLimit() {
		const res = await this.api.upgrade_limit()
		if (res.code === 200) {
			await this.update()
		}
		return res
	}
}
