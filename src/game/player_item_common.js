import { request } from './config'
import {isDataChanged} from './utils'

class api {
    getAll = () => request('player_item_common', 'get_all')
}

export default class player_item_common {
    constructor() {
        this.data = null
        this.api = new api()
    }

    async update() {
        const res = await this.api.getAll()

        if (res.code !== 200) {
            return
        }

        if (isDataChanged(this.data, res.data)) {
            this.data = res.data
        }
    }

    get(item_id) {
        return this.data?.find(item => item.game_item_common?.id === item_id)
    }

    getCount(item_id) {
        const item = this.get(item_id)
        return item?.count || 0
    }
}
