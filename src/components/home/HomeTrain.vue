<template>

  <div class="card ">
    "训练场"
  </div>

  <el-card v-for="player_train in game.player_train.data" shadow="never" bodyClass="flex flex-col p-0!">
    <!-- 上部分：图片和信息 -->
    <div class="flex p-2!">
      <!-- 左侧：圆形头像和名称 -->
      <div class="flex flex-col items-center p-2">
        <el-avatar :size="64" :src="player_train?.player_bird ? getImageUrl('bird', player_train.player_bird.game_bird?.nickname) : getImageUrl('item', player_train?.game_item_train?.nickname )">

        </el-avatar>
        <div class="text-xs text-center mt-1 max-w-20 truncate">
          {{ player_train?.player_bird ? player_train.player_bird.game_bird?.nickname : (player_train?.game_item_train ? player_train.game_item_train.nickname : player_train?.nickname) }}
        </div>
      </div>
      <!-- 右侧：信息和倒计时 -->
      <div class="flex flex-1 p-2! justify-between items-center  border-gray-200">
        <!-- 倒计时 -->
        <div class="flex gap-2">
          <el-countdown
              v-if="player_train?.player_bird_id && player_train?.start_time"
              :value="get_train_deadline(player_train)"
              format="HH:mm:ss"
              :title="player_train?.game_item_train?.nickname || player_train?.nickname"
              :title-style="{ fontSize: '12px', color: '#409EFF' }"
              :value-style="{ fontSize: '14px', color: '#409EFF', fontWeight: 'bold' }"
          />
          <el-tag v-else type="info" size="small">未开始训练</el-tag>
          <el-countdown
              v-if="get_train_time_remaining(player_train)"
              :value="get_item_deadline(player_train)"
              format="HH:mm:ss"
              title="道具倒计时"
              :title-style="{ fontSize: '12px', color: '#E6A23C' }"
              :value-style="{ fontSize: '14px', color: '#E6A23C', fontWeight: 'bold' }"
          />
        </div>
        <!-- 偷取和剩余信息 -->
        <div v-if="get_train_minutes(player_train) >= 240" class="text-xs text-gray-600">
          被偷: {{ get_stolen_cards(player_train) }} | 剩余: {{ get_remaining_cards(player_train) }}
        </div>
      </div>
    </div>


    <hr class="border-gray-200"/>
    <!-- 下部分：按钮区域（独立） -->

    <div class="flex flex-wrap gap-2 justify-end p-2!">
      <el-button size="small" type="primary" @click="show_bird_list(player_train)">
        {{ player_train?.player_bird_id ? '更换鸟' : '设置鸟' }}
      </el-button>
      <el-button size="small" type="success" @click="show_item_list(player_train)">更换训练场</el-button>
      <el-button v-if="player_train?.player_bird_id && player_train?.start_time" size="small" type="warning"
                 @click="show_buff_list(player_train)">
        加速道具
      </el-button>
      <el-button v-if="player_train?.player_bird_id && player_train?.start_time" size="small" type="warning"
                 @click="get_reward(player_train)">
        领取奖励 ({{ get_train_minutes(player_train) }}分钟)
      </el-button>
    </div>

  </el-card>

  <!-- 选择鸟对话框 -->
  <BirdSelector
      v-model="vis_bird_list"
      title="选择训练的鸟"
      :allow-cancel="!!select_train?.player_bird_id"
      cancel-text="取消训练"
      @select="set_bird"
  />

  <!-- 选择训练道具对话框 -->
  <el-dialog v-model="vis_item_list" title="选择训练道具">
    <el-card v-for="item in game.player_item_train.data" shadow="never"
             bodyClass="flex p-2! justify-between glass-effect">
      <div>
        <div class="text-lg">{{ item.game_item_train.nickname }}x{{ item.count }}</div>
        <div class="text-sm">{{ item.game_item_train.desc }}</div>
        <div class="text-sm">奖励: {{ item.game_item_train.game_item_bird_exp?.nickname }}
          x{{ item.game_item_train.count }}/分钟
        </div>
      </div>
      <div class="text-right">
        <el-button type="primary" @click="use_item(item)">使用</el-button>
      </div>
    </el-card>
  </el-dialog>

  <!-- 选择训练加速道具对话框 -->
  <el-dialog v-model="vis_buff_list" title="选择训练加速道具">
    <div v-if="!game.player_item_train_buff?.data || game.player_item_train_buff.data.length === 0"
         class="text-center text-gray-400 py-4">
      暂无训练加速道具
    </div>
    <el-card v-for="buff in game.player_item_train_buff.data" :key="buff.id" shadow="never"
             bodyClass="flex p-2! justify-between glass-effect">
      <div>
        <div class="text-lg">{{ buff.game_item_train_buff.nickname }}x{{ buff.count }}</div>
        <div class="text-sm text-gray-500">{{ buff.game_item_train_buff.desc }}</div>
        <div class="text-sm text-purple-600">时间加成: +{{ buff.game_item_train_buff.time }}%</div>
      </div>
      <div class="text-right">
        <el-button type="primary" @click="use_buff(buff)">使用</el-button>
      </div>
    </el-card>
  </el-dialog>

</template>


<script setup>
import {inject, onMounted, onUnmounted, onActivated, onDeactivated, ref} from "vue";
import { message } from '@/game/notification-center';
import BirdSelector from '../common/BirdSelector.vue'
import {getImageUrl} from '@/config/oss'

const game = inject('game')
const vis_bird_list = ref(false)
const vis_item_list = ref(false)
const vis_buff_list = ref(false)
const select_train = ref(null)
const timer = ref(null)
const currentTime = ref(Date.now())
const stolenCardsMap = ref({})

const show_bird_list = async (train) => {
  await game.player_bird.update()
  select_train.value = train
  vis_bird_list.value = true
}

const show_item_list = async (train) => {
  await game.player_item_train.update()
  select_train.value = train
  vis_item_list.value = true
}

const set_bird = async (bird) => {
  const res = await game.player_train.set_bird(select_train.value.id, bird?.id || null)
  vis_bird_list.value = false
  if (res.code !== 200) {
    message.error(res.msg)
    return
  }
  message.success(bird ? "设置成功" : "取消成功")
}

const use_item = async (item) => {
  const res = await game.player_train.use_item(select_train.value.id, item.id)
  vis_item_list.value = false
  if (res.code !== 200) {
    message.error(res.msg)
    return
  }
  message.success("使用成功")
  await game.player_item_train.update()
}

const show_buff_list = async (train) => {
  await game.player_item_train_buff.update()
  select_train.value = train
  vis_buff_list.value = true
}

const use_buff = async (buff) => {
  if (!select_train.value) {
    message.error('请先选择训练场')
    return
  }

  const res = await game.player_train.use_player_item_train_buff(select_train.value.id, buff.id)
  vis_buff_list.value = false
  if (res.code !== 200) {
    message.error(res.msg)
    return
  }
  message.success('加速成功')
  await game.player_item_train_buff.update()
  await game.player_train.update()
}

const get_reward = async (train) => {
  const res = await game.player_train.get_reward(train.id)
  if (res.code !== 200) {
    message.error(res.msg)
    return
  }
  message.success(`领取成功: ${res.data.rewardCount}个奖励`)
  // 清除该训练场的被偷取卡片缓存
  delete stolenCardsMap.value[train.id]
  await game.player_item_bird_exp.update()
  await game.player_train.update()
}

const get_train_minutes = (train) => {
  if (!train.start_time) {
    return 0
  }
  const elapsed = Math.floor(Date.now() / 1000) - Number(train.start_time)
  const maxDuration = 4 * 60 * 60 // 4小时（秒）
  const actualElapsed = Math.min(elapsed, maxDuration) // 不超过最大训练时间
  return Math.floor(actualElapsed / 60)
}

const get_train_desc = (train) => {
  if (train?.game_item_train && train.game_item_train.game_item_bird_exp) {
    // 使用了自定义训练道具，显示道具的奖励
    const rewardName = train.game_item_train.game_item_bird_exp.nickname
    const count = train.game_item_train.count || 1
    return `${rewardName} x ${count}/分钟`
  }
  // 默认简易训练场，显示基础经验卡
  return '基础经验卡 x 1/分钟'
}

const get_train_time_remaining = (train) => {
  if (!train.use_game_item_train_id || !train.use_time) {
    return null
  }
  const itemDuration = 24 * 60 * 60 // 24小时
  const elapsed = Math.floor(currentTime.value / 1000) - Number(train.use_time)
  const remaining = itemDuration - elapsed
  return remaining > 0 ? remaining : 0
}


// 计算训练结束的目标时间戳（毫秒）
const get_train_deadline = (train) => {
  if (!train?.start_time) {
    return Date.now()
  }
  const startTime = Number(train.start_time)
  const maxDuration = 4 * 60 * 60 // 4小时（秒）
  return (startTime + maxDuration) * 1000
}

// 计算道具过期的目标时间戳（毫秒）
const get_item_deadline = (train) => {
  if (!train?.use_time) {
    return Date.now()
  }
  const useTime = Number(train.use_time)
  const itemDuration = 24 * 60 * 60 // 24小时（秒）
  return (useTime + itemDuration) * 1000
}

// 计算总卡片数
const get_total_cards = (train) => {
  const minutes = get_train_minutes(train)
  const count = train?.game_item_train?.count || 1
  return Math.floor(minutes * count)
}

// 获取被偷取的卡片数
const get_stolen_cards = (train) => {
  return stolenCardsMap.value[train.id] || 0
}

// 计算剩余卡片数
const get_remaining_cards = (train) => {
  return get_total_cards(train) - get_stolen_cards(train)
}

// 获取今日被偷取的卡片数
const fetch_stolen_cards = async (train) => {
  if (get_train_minutes(train) >= 240 && stolenCardsMap.value[train.id] === undefined) {
    const res = await game.player_train.api.get_stolen_today({train_id: train.id})
    if (res.code === 200 && res.data) {
      stolenCardsMap.value[train.id] = res.data.totalStolen
    }
  }
}


const startTimer = () => {
  timer.value = setInterval(() => {
    // 只更新当前时间，不强制刷新整个数组
    currentTime.value = Date.now()

    // 检查并获取被偷取的卡片数
    if (game.player_train.data) {
      game.player_train.data.forEach(train => {
        if (train.player_bird_id && train.start_time && get_train_minutes(train) >= 240) {
          fetch_stolen_cards(train)
        }
      })
    }
  }, 1000);
}

const stopTimer = () => {

  if (timer.value) {
    clearInterval(timer.value);
  }
}

// 页面挂载时启动定时器
onMounted(() => {
  startTimer();
})

onActivated(() => {
  startTimer();
})

// 组件卸载前清除定时器
onUnmounted(() => {
  stopTimer();
})

onDeactivated(() => {
  stopTimer()
})

</script>

<style scoped>


</style>
