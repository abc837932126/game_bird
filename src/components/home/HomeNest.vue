<template>
	<div class="card">
		"爱的巢穴"
	</div>

	<el-card v-if="game.player_nest.data" shadow="never" bodyClass="flex flex-col p-0! glass-effect">
		<!-- 上部分：道具信息和进度 -->
		<div class="flex justify-between items-start mb-3 p-2!">
		<!-- 标题 + 描述：描述放在标题下方 -->
		<div class="flex flex-col">
			<div class="text-lg leading-tight">
				{{ get_nest_title() }}
			</div>
			<div class="text-sm text-gray-600 mt-0.5">
				{{ get_nest_desc() }}
			</div>
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

		<!-- 中部分：巢穴图片固定最左，鸟位保持居中 -->
		<div class="flex items-center w-full mb-3 p-1!">

			<!-- 左侧：巢穴图片 —— 始终贴左 -->
			<div class="flex-none shrink-0 -ml-2 -mt-1 relative -top-2.5">
				<div class="w-20 h-20 sm:w-24 sm:h-24 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
				<img :src="get_nest_image()" class="w-full h-full object-cover" alt="巢穴" />
				</div>
			</div>

			<!-- 中间：位置1 + 爱心 + 位置2（保持居中） -->
			<div class="flex-1 flex justify-center items-center gap-4">

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

				<!-- 巢穴中间图标：显示爱心 -->
				<div class="text-3xl text-gray-300 relative -top-2">💕</div>


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
			<el-button size="small" type="danger" @click="harvest()" :disabled="!is_pairing_complete()">
				收获幼鸟
			</el-button>
		</div>
	</el-card>

	<!-- 选择鸟对话框 -->
	<BirdSelector
		v-model="vis_bird_list"
		:title="`选择配对的鸟（位置${select_slot}）`"
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
import defaultNestImg from './normal_nest.png'
import nestPlaceholder from './nest_placeholder.png'
import {inject, onMounted, onUnmounted, onActivated, ref} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {getImageUrl} from '@/config/oss'
import BirdSelector from '../common/BirdSelector.vue'
import {onDeactivated} from "@vue/runtime-core";


const game = inject('game')
const vis_bird_list = ref(false)
const vis_item_list = ref(false)
const vis_buff_list = ref(false)
const select_slot = ref(1)
const timer = ref(null)
const currentTime = ref(Date.now())

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
	ElMessageBox.confirm('确定要移除这只鸟吗？', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	}).then(async () => {
		const res = await game.player_nest.set_bird(slot, null)
		if (res.code !== 200) {
			ElMessage.error(res.msg)
			return
		}
		ElMessage.success("移除成功")
	}).catch(() => {
		// 取消操作
	})
}

const set_bird = async (bird) => {
	const res = await game.player_nest.set_bird(select_slot.value, bird?.id || null)
	vis_bird_list.value = false
	if (res.code !== 200) {
		ElMessage.error(res.msg)
		return
	}
	ElMessage.success(bird ? "设置成功" : "移除成功")
}

const use_item = async (item) => {
	const res = await game.player_nest.use_nest_item(item.id)
	vis_item_list.value = false
	if (res.code !== 200) {
		ElMessage.error(res.msg)
		return
	}
	ElMessage.success("使用成功")
	await game.player_item_nest.update()
}

const use_buff = async (buff) => {
	const res = await game.player_nest.use_nest_buff(buff.game_item_nest_buff_id)
	vis_buff_list.value = false
	if (res.code !== 200) {
		ElMessage.error(res.msg)
		return
	}
	ElMessage.success("加速成功")
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
		ElMessage.error(res.msg)
		return
	}
	ElMessage.success("开始配对")
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
	const res = await game.player_nest.harvest()
	if (res.code !== 200) {
		ElMessage.error(res.msg)
		return
	}
	ElMessage.success(`收获成功！双方各获得一只幼鸟，获得经验: ${res.data.player_exp_gained}`)
	await game.player_bird.update()
	await game.player.update()
}

const get_nest_title = () => {
	const nest = game.player_nest.data
  	return nest?.game_item_nest?.nickname || '普通巢穴'
}

const get_nest_image = () => {
  	const nest = game.player_nest.data
  	const nickname = nest?.game_item_nest?.nickname
  	if (!nickname) return defaultNestImg
  		try {
    	// 如果OSS/静态资源里有对应巢穴图片，优先用它
    	return getImageUrl('nest', nickname) || defaultNestImg
		} 
		catch (e) {
    	return defaultNestImg
	}
}

const get_nest_desc = () => {
	const nest = game.player_nest.data
	if (nest?.game_item_nest) {
		return `时间减免${nest.game_item_nest.time}% | 体重+${nest.game_item_nest.weight_min}-${nest.game_item_nest.weight_max}% | 经验+${nest.game_item_nest.exp}%`
	}
  return '简易精致的爱巢。'
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

const format_pairing_progress = () => {
	const nest = game.player_nest.data
	if (!nest || !nest.is_pairing || !nest.start_time || !nest.player_bird_1) {
		return '0%'
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
	const progress = Math.min(100, Math.floor((elapsed / duration) * 100))
	return `${progress}%`
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
