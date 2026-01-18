import { request } from './config.js'

class api {
  send = (params) => request('player_red_packet', 'send', params)
  claim = (params) => request('player_red_packet', 'claim', params)
  getDetail = (params) => request('player_red_packet', 'get_detail', params)
}

export default class player_red_packet {
  constructor() {
    this.api = new api()
  }

  async send(total_amount, count, message = '', type = 'normal') {
    return await this.api.send({ total_amount, count, message, type })
  }

  async claim(red_packet_id) {
    return await this.api.claim({ red_packet_id })
  }

  async getDetail(red_packet_id) {
    return await this.api.getDetail({ red_packet_id })
  }
}
