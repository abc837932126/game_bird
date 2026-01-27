<template>
	<div class="card">
		"爱的巢穴"
	</div>

	<el-card v-if="game.player_nest.data" shadow="never" bodyClass="flex flex-col p-0! glass-effect">
		<!-- 上部分：道具信息和进度 -->
		<div class="flex justify-between items-start mb-3 p-2!">
			<div class="flex-1">
				<div class="text-lg" v-if="game.player_nest.data?.game_item_nest">
					{{ game.player_nest.data.game_item_nest.nickname }}
				</div>
				<div class="text-sm" v-if="game.player_nest.data?.game_item_nest">{{ get_nest_desc() }}</div>
			</div>
			<div class="flex flex-col items-end gap-1">
				<el-countdown
					v-if="game.player_nest.data?.is_pairing && !is_pairing_complete()"
					:value="get_countdown_deadline()"
					format="HH:mm:ss"
					title="剩余时间"
					:title-style="{ fontSize: '12px', color: '#E6A23C' }"
					:value-style="{ fontSize: '14px', color: '#E6A23C', fontWeight: 'bold' }"
				/>
				<el-tag v-if="is_pairing_complete()" type="success">
					配对完成
				</el-tag>
			</div>
		</div>

		<!-- 中部分：两只鸟的头像，一左一右 -->
		<div class="flex justify-center items-center gap-4 mb-3 p-1!">
			<!-- 位置1 -->
			<div
				class="flex flex-col items-center cursor-pointer"
				@click="!game.player_nest.data?.is_pairing && (game.player_nest.data?.player_bird_id_1 ? show_remove_confirm(1) : show_bird_list(1))"
			>
				<div class="relative" :class="{
					'opacity-50 cursor-not-allowed': game.player_nest.data?.is_pairing
				}">
					<el-avatar
						v-if="game.player_nest.data?.player_bird_1"
						:size="70"
						:src="getImageUrl('bird', game.player_nest.data.player_bird_1.game_bird.nickname)"
						class="border-2 border-blue-400"
					/>
					<el-avatar v-else :size="70" class="border-2 border-gray-300 bg-gray-50">
  						<img :src="nestPlaceholder" class="slot-icon" alt="巢穴" />
					</el-avatar>
				</div>
				<div class="text-xs mt-1" v-if="game.player_nest.data?.player_bird_1">
					{{ game.player_nest.data.player_bird_1.game_bird.nickname }} {{ game.player_nest.data.player_bird_1.sex === 0 ? '♂' : '♀' }} {{ game.player_nest.data.player_bird_1.weight.toFixed(2) }}kg
				</div>
				<div class="text-xs mt-1 text-gray-400" v-else>位置1</div>
			</div>

			<!-- 中间图标：显示巢穴 -->
			<div class="flex items-center justify-center w-20 h-20">
			<img
				v-if="!game.player_nest.data?.is_pairing && game.player_nest.data?.game_item_nest"
				:src="getImageUrl('nest', game.player_nest.data.game_item_nest.nickname)"
				class="nest-heart"
				alt="巢穴"
			/>
			</div>



			<!-- 位置2 -->
			<div
				class="flex flex-col items-center cursor-pointer"
				@click="!game.player_nest.data?.is_pairing && (game.player_nest.data?.player_bird_id_2 ? show_remove_confirm(2) : show_bird_list(2))"
			>
				<div class="relative" :class="{
					'opacity-50 cursor-not-allowed': game.player_nest.data?.is_pairing
				}">
					<el-avatar
						v-if="game.player_nest.data?.player_bird_2"
						:size="70"
						:src="getImageUrl('bird', game.player_nest.data.player_bird_2.game_bird.nickname)"
						class="border-2 border-pink-400"
					/>
					<el-avatar v-else :size="70" class="border-2 border-gray-300 bg-gray-50">
  						<img :src="nestPlaceholder" class="slot-icon" alt="巢穴" />
					</el-avatar>
				</div>
				<div class="text-xs mt-1" v-if="game.player_nest.data?.player_bird_2">
					{{ game.player_nest.data.player_bird_2.game_bird.nickname }} {{ game.player_nest.data.player_bird_2.sex === 0 ? '♂' : '♀' }} {{ game.player_nest.data.player_bird_2.weight.toFixed(2) }}kg
				</div>
				<div class="text-xs mt-1 text-gray-400" v-else>位置2</div>
			</div>
		</div>

    <hr class="border-gray-200" />
		<!-- 下部分：按钮横向排列 -->
		<div class="flex gap-2 justify-end flex-wrap p-2!">
			<el-button size="small" type="success" @click="show_item_list()" :disabled="game.player_nest.data?.is_pairing">
				更换巢穴
			</el-button>
			<el-button size="small" type="info" @click="show_buff_list()" :disabled="!game.player_nest.data?.is_pairing || is_pairing_complete()">
				加速道具
			</el-button>
			<el-button size="small" type="warning" @click="start_pairing()" :disabled="!can_start_pairing()">
				开始配对
			</el-button>
			<div class="flex items-center gap-2">
				<el-checkbox v-model="use_fertility_pill" :disabled="!is_pairing_complete() || fertility_pill_count === 0">
					使用{{ game.game_config_special_items.data?.fertility_pill?.nickname || '多胎丸' }} ({{ fertility_pill_count }})
				</el-checkbox>
				<el-button size="small" type="danger" @click="harvest()" :disabled="!is_pairing_complete()">
					收获幼鸟
				</el-button>
			</div>
		</div>
	</el-card>

	<!-- 选择鸟对话框 -->
	<BirdSelector
		v-model="vis_bird_list"
		:title="`选择配对的鸟（位置${select_slot}）`"
		:filter-fields="['has_paired', 'status']"
		:show-filtered-count="true"
		@select="set_bird"
	/>

	<!-- 选择巢穴道具对话框 -->
	<el-dialog v-model="vis_item_list" title="选择巢穴道具">
		<el-card v-for="item in game.player_item_nest.data" shadow="never" bodyClass="flex p-2! justify-between glass-effect">
			<div>
				<div class="text-lg">{{ item.game_item_nest.nickname }}x{{ item.count }}</div>
				<div class="text-sm">{{ item.game_item_nest.desc }}</div>
				<div class="text-sm">
					时间减免: {{ item.game_item_nest.time }}%，
					体重加成: {{ item.game_item_nest.weight_min }}-{{ item.game_item_nest.weight_max }}%，
					经验加成: {{ item.game_item_nest.exp }}%
				</div>
			</div>
			<div class="text-right">
				<el-button type="primary" @click="use_item(item)">使用</el-button>
			</div>
		</el-card>
	</el-dialog>

	<!-- 选择巢穴增益对话框 -->
	<el-dialog v-model="vis_buff_list" title="选择加速道具">
		<el-card v-for="buff in game.player_item_nest_buff.data" :key="buff.id" shadow="never" bodyClass="flex p-2! justify-between glass-effect">
			<div>
				<div class="text-lg">{{ buff.game_item_nest_buff.nickname }}x{{ buff.count }}</div>
				<div class="text-sm">{{ buff.game_item_nest_buff.desc }}</div>
				<div class="text-sm">时间减免: {{ buff.game_item_nest_buff.time }}%</div>
			</div>
			<div class="text-right">
				<el-button type="primary" @click="use_buff(buff)">使用</el-button>
			</div>
		</el-card>
	</el-dialog>
</template>

<script setup>
import nestPlaceholder from './nest_placeholder.png'
import {inject, onMounted, onUnmounted, onActivated, onDeactivated,ref, computed} from "vue";
import {message} from '@/game/notification-center'
import {getImageUrl} from '@/config/oss'
import BirdSelector from '../common/BirdSelector.vue'


const game = inject('game')
const vis_bird_list = ref(false)
const vis_item_list = ref(false)
const vis_buff_list = ref(false)
const select_slot = ref(1)
const timer = ref(null)
const currentTime = ref(Date.now())
const use_fertility_pill = ref(false)

// 计算多胎丸数量
const fertility_pill_count = computed(() => {
	if (!game.player_item_common.data) return 0
	// 从配置中获取多胎丸的ID
	const fertilityPillId = game.game_config_special_items.data?.fertility_pill_id
	if (!fertilityPillId) return 0
	// 通过ID查找玩家的多胎丸道具
	const fertilityPill = game.player_item_common.data.find(item =>
		item.game_item_common_id === fertilityPillId
	)
	return fertilityPill ? fertilityPill.count : 0
})

const show_bird_list = async (slot) => {
	await game.player_bird.update()
	select_slot.value = slot
	vis_bird_list.value = true
}

const show_item_list = async () => {
	await game.player_item_nest.update()
	vis_item_list.value = true
}

const show_buff_list = async () => {
	await game.player_item_nest_buff.update()
	vis_buff_list.value = true
}

const show_remove_confirm = async (slot) => {
	message.confirm('确定要移除这只鸟吗？', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	}).then(async () => {
		const res = await game.player_nest.set_bird(slot, null)
		if (res.code !== 200) {
			message.error(res.msg)
			return
		}
		message.success("移除成功")
	}).catch(() => {
		// 取消操作
	})
}

const set_bird = async (bird) => {
	const res = await game.player_nest.set_bird(select_slot.value, bird?.id || null)
	vis_bird_list.value = false
	if (res.code !== 200) {
		message.error(res.msg)
		return
	}
	message.success(bird ? "设置成功" : "移除成功")
}

const use_item = async (item) => {
	const res = await game.player_nest.use_nest_item(item.id)
	vis_item_list.value = false
	if (res.code !== 200) {
		message.error(res.msg)
		return
	}
	message.success("使用成功")
	await game.player_item_nest.update()
}

const use_buff = async (buff) => {
	const res = await game.player_nest.use_nest_buff(buff.game_item_nest_buff_id)
	vis_buff_list.value = false
	if (res.code !== 200) {
		message.error(res.msg)
		return
	}
	message.success("加速成功")
	await game.player_nest.update()
	await game.player_item_nest_buff.update()
}

const can_start_pairing = () => {
	const nest = game.player_nest.data
	return nest && nest.player_bird_id_1 && nest.player_bird_id_2 && !nest.is_pairing
}

const start_pairing = async () => {
	const res = await game.player_nest.start_pairing()
	if (res.code !== 200) {
		message.error(res.msg)
		return
	}
	message.success("开始配对")
}

const is_pairing_complete = () => {
	const nest = game.player_nest.data
	if (!nest || !nest.is_pairing || !nest.start_time || !nest.player_bird_1) {
		return false
	}

	const startTime = Number(nest.start_time)
	const now = Math.floor(currentTime.value / 1000)
	const needTime = nest.player_bird_1.game_bird.need_time

	// 计算配对时长（捕获时长的一半）
	let duration = needTime / 2
	if (nest.game_item_nest && nest.game_item_nest.time > 0) {
		duration = duration * (1 - nest.game_item_nest.time / 100)
	}

	const elapsed = now - startTime
	return elapsed >= duration
}

const harvest = async () => {
	const res = await game.player_nest.harvest(use_fertility_pill.value)
	if (res.code !== 200) {
		message.error(res.msg)
		return
	}
	const birdsPerPlayer = res.data.birds_per_player || 1
	const pillName = game.game_config_special_items.data?.fertility_pill?.nickname || '多胎丸'
	const successMsg = use_fertility_pill.value
		? `收获成功！使用${pillName}，双方各获得${birdsPerPlayer}只幼鸟，获得经验: ${res.data.player_exp_gained}`
		: `收获成功！双方各获得一只幼鸟，获得经验: ${res.data.player_exp_gained}`
	message.success(successMsg)
	use_fertility_pill.value = false // 重置复选框
	await game.player_bird.update()
	await game.player.update()
	await game.player_item_common.update()
}

const get_nest_desc = () => {
	const nest = game.player_nest.data
	if (nest?.game_item_nest) {
		return `时间减免${nest.game_item_nest.time}% | 体重+${nest.game_item_nest.weight_min}-${nest.game_item_nest.weight_max}% | 经验+${nest.game_item_nest.exp}%`
	}
	return ''
}

// 计算倒计时目标时间（毫秒时间戳）
const get_countdown_deadline = () => {
	const nest = game.player_nest.data
	if (!nest || !nest.is_pairing || !nest.start_time || !nest.player_bird_1) {
		return Date.now()
	}

	const startTime = Number(nest.start_time)
	const needTime = nest.player_bird_1.game_bird.need_time

	// 计算配对时长（捕获时长的一半）
	let duration = needTime / 2
	if (nest.game_item_nest && nest.game_item_nest.time > 0) {
		duration = duration * (1 - nest.game_item_nest.time / 100)
	}

	// 返回目标时间戳（毫秒）
	const targetTime = startTime + duration
	return targetTime * 1000
}

const startTimer = () => {
	if (timer.value) clearInterval(timer.value) // 先清除已有的

	timer.value = setInterval(() => {
		// 只更新当前时间，不强制刷新整个对象
		currentTime.value = Date.now()
	}, 1000)
}


// 页面卸载和停用时都清除定时器
const stopTimer = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

// 页面挂载时启动定时器
onMounted(() => {
  startTimer();
})

onActivated(() =>{
  startTimer();
})



// 组件卸载前清除定时器
onUnmounted(() => {
  stopTimer();
})

onDeactivated(() =>{
  stopTimer();
})


</script>

<style scoped>
.nest-heart {
  width: 70px;     
  height: 70px;    
  object-fit: cover;
  display: block;

  transform: translateY(-6px);

  /* 心形裁剪：mask  */
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath d='M256 464s-40-28-80-64C96 336 32 272 32 192 32 123 83 72 152 72c39 0 72 20 104 56 32-36 65-56 104-56 69 0 120 51 120 120 0 80-64 144-144 208-40 36-80 64-80 64z'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath d='M256 464s-40-28-80-64C96 336 32 272 32 192 32 123 83 72 152 72c39 0 72 20 104 56 32-36 65-56 104-56 69 0 120 51 120 120 0 80-64 144-144 208-40 36-80 64-80 64z'/%3E%3C/svg%3E");

  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;

  -webkit-mask-size: contain;
  mask-size: contain;

  -webkit-mask-position: center;
  mask-position: center;

  /*加一点圆润/投影更像按钮 */
  filter: drop-shadow(0 2px 6px rgba(0,0,0,.18));
}

</style>
