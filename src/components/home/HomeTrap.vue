<template>
	<!-- Grid布局容器 -->
	<div class="grid grid-cols-4 gap-3 p-0!">
		<el-card v-for="player_trap in game.player_trap.data" :key="player_trap.id" shadow="hover"  body-class=" p-1!">
			<div class="flex flex-col items-center text-center relative">
				<!-- 倒计时 - 覆盖在右上角 -->
				<el-countdown
					:value="get_trap_deadline(player_trap)"
					format="HH:mm:ss"
					:value-style="{ fontSize: '12px', color: '#4d9ef8', fontWeight: 'bold' }"
					class=" rounded-bl w-full"
				/>


				<!-- 圆形陷阱图片 -->
				<el-avatar
					:size="80"
					:src="player_trap?.selected_bird ? getImageUrl('bird', player_trap.selected_bird.nickname) : player_trap?.image_url"
					:class="[' border-2', getTrapBorderClass(player_trap)]"
				>
					<span class="text-4xl">🪤</span>
				</el-avatar>


				<!-- 按钮区域 - 垂直排列 -->
				<div class="w-full space-y-2! pt-2!">
					<!-- 陷阱名称按钮（点击更换陷阱） -->
					<el-button class="w-full ml-0!" size="small" @click="changeTrap(player_trap)">
						{{ player_trap?.selected_bird ? player_trap.selected_bird.nickname : player_trap?.nickname }}
					</el-button>

					<!-- 条件显示的操作按钮 -->
					<!-- 情况1: 未下饵 - 显示"下饵"按钮 -->
					<el-button
						v-if="!player_trap?.selected_bird"
						class="w-full ml-0!"
						size="small"
						type="primary"
						@click="show_bait_list(player_trap)"
					>
						下饵
					</el-button>

					<!-- 情况2: 已下饵且倒计时结束 - 显示"收获"按钮 -->
					<el-button
						v-else-if="get_trap_time(player_trap) <= 0"
						class="w-full ml-0!"
						size="small"
						type="success"
						@click="get_bird(player_trap)"
					>
						收获
					</el-button>

					<!-- 情况3: 已下饵且倒计时进行中 - 显示"使用加速道具"按钮 -->
					<el-button
						v-else
						class="w-full ml-0!"
						size="small"
						type="warning"
						@click="show_trap_buff_list(player_trap)"
					>
						使用加速道具
					</el-button>
				</div>
			</div>
		</el-card>
	</div>

	<!-- 下饵弹窗 -->
	<el-dialog v-model="vis_item_bait" title="选择诱饵">
		<el-card v-for="bait in game.player_item_bait.data" :key="bait.id" shadow="never" bodyClass="flex p-2! justify-between glass-effect">
			<div>
				<div class="text-lg">{{ bait.game_item_bait.nickname }}x{{ bait.count }}</div>
			</div>

			<div class="text-right">
				<el-button type="primary" @click="set_bait(bait)">下饵</el-button>
			</div>
		</el-card>
	</el-dialog>

	<!-- 使用陷阱加成道具弹窗 -->
	<el-dialog v-model="vis_item_trap_buff" title="选择陷阱加成道具">
		<div v-if="!game.player_item_trap_buff?.data || game.player_item_trap_buff.data.length === 0" class="text-center text-gray-400 py-4">
			暂无陷阱加成道具
		</div>
		<el-card v-for="buff in game.player_item_trap_buff.data" :key="buff.id" shadow="never" bodyClass="flex p-2! justify-between glass-effect">
			<div>
				<div class="text-lg">{{ buff.game_item_trap_buff.nickname }}x{{ buff.count }}</div>
				<div class="text-sm text-gray-500">{{ buff.game_item_trap_buff.desc }}</div>
				<div class="text-sm text-purple-600">时间加成: +{{ buff.game_item_trap_buff.buff_time }}%</div>
			</div>

			<div class="text-right">
				<el-button type="primary" @click="use_trap_buff(buff)">使用</el-button>
			</div>
		</el-card>
	</el-dialog>

	<!-- 鸟信息弹窗 -->
	<PlayerBirdInfo ref="birdInfoDialog" />
</template>


<script setup>
import {inject, onActivated, onDeactivated, onMounted, onUnmounted, ref} from "vue";
import {ElMessage} from "element-plus";
import {getImageUrl} from '@/config/oss'
import PlayerBirdInfo from '@/components/playerbird/PlayerBirdInfo.vue'

const game = inject('game')
const vis_item_bait = ref(false)
const vis_item_trap_buff = ref(false)
const birdInfoDialog = ref(null)


const select_trap = ref(null)

// 添加用于存储定时器的引用
const timer = ref(null)
const currentTime = ref(Date.now())

const show_bait_list = async (trap) => {
	await game.player_item_bait.update()
	select_trap.value = trap
	vis_item_bait.value = true
}

const set_bait = async (item) => {
	const res = await game.player_trap.set_bait(select_trap.value.id, item.id)
	vis_item_bait.value = false
	if (res.code !== 200) {
		ElMessage.error(res.msg)
	}
  await game.player_trap.update()
}

const get_bird = async (trap) => {
	const res = await game.player_trap.get_bird(trap.id)
	if (res.code !== 200) {
		ElMessage.error(res.msg)
		return
	}

	// 获取新鸟数据
	const newBird = res.data.new_bird

	// 添加到鸟仓库
	if (game.player_bird.data && newBird) {
		game.player_bird.data.push(newBird)
	}

	// 显示新鸟信息弹窗
	if (birdInfoDialog.value && newBird) {
		birdInfoDialog.value.show(newBird)
	}

	// 更新陷阱数据
	await game.player_trap.update()
}

const show_trap_buff_list = async (trap) => {
	await game.player_item_trap_buff.update()
	select_trap.value = trap
	vis_item_trap_buff.value = true
}

const use_trap_buff = async (buff) => {
	if (!select_trap.value) {
		ElMessage.error('请先选择陷阱')
		return
	}

	const res = await game.player_trap.use_player_item_trap_buff(select_trap.value.id, buff.game_item_trap_buff.id)
	vis_item_trap_buff.value = false
	if (res.code !== 200) {
		ElMessage.error(res.msg)
		return
	}
	ElMessage.success('使用成功')
	await game.player_trap.update()
	await game.player_item_trap_buff.update()
}

const changeTrap = (trap) => {
	ElMessage.info('更换陷阱功能开发中')
}

const get_trap_time = (trap) => {
	if (!trap.selected_bird) {
		return 0
	}

	const need_time = trap.selected_bird.need_time;
	const over_time = Number(trap.use_time) + need_time;
	return Math.ceil(over_time - currentTime.value / 1000);
}

// 计算陷阱收获的目标时间戳（毫秒）
const get_trap_deadline = (trap) => {
	if (!trap?.selected_bird || !trap?.use_time) {
		return Date.now()
	}
	const useTime = Number(trap.use_time)
	const needTime = trap.selected_bird.need_time
	return (useTime + needTime) * 1000
}

// 获取陷阱边框颜色类
const getTrapBorderClass = (trap) => {
	if (!trap?.selected_bird) {
		// 未下饵 - 灰色边框
		return 'border-gray-300 bg-gray-100'
	}

	const timeLeft = get_trap_time(trap)
	if (timeLeft <= 0) {
		// 可收获 - 绿色边框
		return 'border-green-500 bg-green-50'
	}

	// 进行中 - 橙色边框
	return 'border-orange-500 bg-orange-50'
}

const startTimer = ()=>{
	timer.value = setInterval(() => {
		// 只更新当前时间，不强制刷新整个数组
		currentTime.value = Date.now()
	}, 1000);
}

const stopTimer = ()=>{
  if (timer.value) {
    clearInterval(timer.value);
  }
}

// 页面挂载时启动定时器
onMounted(() => {
  startTimer()
})

onActivated(() => {
  startTimer()
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
