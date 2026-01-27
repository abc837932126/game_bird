<template>
	<el-dialog v-model="vis" class="p-0!" width="90%" align-center :show-close="false" header-class="p-0!" center>
		<!-- 鸟类大图 -->
		<el-image :src="getImageUrl('bird', bird?.game_bird?.nickname)" fit="cover" loading="lazy" class="max-h-64 w-full">
			<template #placeholder>
				<div class="flex-cc w-full h-64 bg-[#f5f7fa]">
					<ElIcon>
						<Picture />
					</ElIcon>
				</div>
			</template>
			<template #error>
				<!-- 如果大图不存在，使用小图 -->
				<el-image :src="getImageUrl('bird', bird?.game_bird?.nickname)" fit="cover" class="max-h-64 w-full">
					<template #error>
						<div class="flex-cc w-full h-64 bg-[#f5f7fa]">
							<span class="text-6xl">🐦</span>
						</div>
					</template>
				</el-image>
			</template>
		</el-image>

		<div class="flex flex-col p-4! gap-3!">
			<!-- 鸟类基本信息 -->
			<div class="mb-3">
				<div class="text-xl font-bold mb-2">{{ bird?.game_bird?.nickname }}</div>
				<div class="text-gray-500 text-sm">{{ bird?.game_bird?.desc }}</div>
			</div>

			<!-- 鸟类属性 -->
			<div class="grid grid-cols-2 gap-2">
				<div class="flex justify-between p-2 bg-gray-50 rounded">
					<span class="text-gray-600">等级:</span>
					<span class="font-bold text-blue-600">Lv.{{ bird?.lv || 1 }}</span>
				</div>
				<div class="flex justify-between p-2 bg-gray-50 rounded">
					<span class="text-gray-600">经验:</span>
					<span class="font-bold text-green-600">{{ bird?.exp || 0 }}/{{ bird?.game_bird?.up_exp || 0 }}</span>
				</div>
				<div class="flex justify-between p-2 bg-gray-50 rounded">
					<span class="text-gray-600">性别:</span>
					<span class="font-bold text-pink-600">{{ bird?.sex === 0 ? '♂ 雄性' : '♀ 雌性' }}</span>
				</div>
				<div class="flex justify-between p-2 bg-gray-50 rounded">
					<span class="text-gray-600">类型:</span>
					<span class="font-bold text-blue-600">{{ bird?.game_bird?.game_config_bird_type?.nickname || '未知' }}</span>
				</div>
				<div class="flex justify-between p-2 bg-gray-50 rounded">
					<span class="text-gray-600">体重:</span>
					<span class="font-bold text-orange-600">{{ bird?.weight?.toFixed(2) || 0 }} kg</span>
				</div>
				<div class="flex justify-between p-2 bg-gray-50 rounded">
					<span class="text-gray-600">成长值:</span>
					<span class="font-bold text-purple-600">{{ bird?.grow?.toFixed(2) || 0 }}</span>
				</div>
				<div class="flex justify-between p-2 bg-gray-50 rounded">
					<span class="text-gray-600">克制值:</span>
					<span class="font-bold text-red-600">{{ bird?.restraint || 0 }}</span>
				</div>
				<div class="flex justify-between p-2 bg-gray-50 rounded">
					<span class="text-gray-600">转生次数:</span>
					<span class="font-bold text-indigo-600">{{ bird?.reincarnation_count || 0 }}</span>
				</div>
				<div class="flex justify-between p-2 bg-gray-50 rounded">
					<span class="text-gray-600">价格:</span>
					<span class="font-bold text-yellow-600">
						{{ bird?.game_bird?.price || 0 }}
						{{ bird?.game_bird?.game_config_player_balance?.nickname || '金币' }}
					</span>
				</div>
			</div>

			<!-- 体重范围 -->
			<div class="p-3 bg-blue-50 rounded">
				<div class="text-sm font-bold mb-2">体重范围</div>
				<div class="flex gap-2 text-sm">
					<span>最小: {{ bird?.game_bird?.weight_min || 0 }} kg</span>
					<span>|</span>
					<span>最大: {{ bird?.game_bird?.weight_max || 0 }} kg</span>
					<span>|</span>
					<span class="text-red-500">超级: {{ bird?.game_bird?.weight_super || 0 }} kg</span>
				</div>
			</div>

			<!-- 品质评估 -->
			<div class="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded">
				<div class="text-sm font-bold mb-2">品质评估</div>
				<div class="flex items-center gap-2">
					<span class="text-sm">{{ getQualityText(bird) }}</span>
					<el-tag :type="getQualityType(bird)" size="small">
						{{ getQualityLevel(bird) }}
					</el-tag>
				</div>
			</div>

			<!-- 高级技能 -->
			<div class="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded">
				<div class="text-sm font-bold mb-2">高级技能</div>
				<div v-if="birdSkills.length > 0" class="flex flex-wrap gap-2">
					<el-tag
						v-for="skill in birdSkills"
						:key="skill.id"
						:type="skill.is_equipped ? 'success' : 'info'"
						size="small"
					>
						{{ skill.game_skill?.nickname || '未知技能' }}
						<span v-if="skill.is_equipped"> ✓</span>
					</el-tag>
				</div>
				<div v-else class="text-sm text-gray-400">
					暂无技能
				</div>
			</div>

			<!-- 按钮 -->
			<div class="grid grid-cols-2 gap-2 mt-2">
				<el-button class="m-0!" type="info" @click="showExpCardSelection">使用经验卡</el-button>
				<el-button class="m-0!" type="warning" @click="handleUseGrowthPotion">洗练成长</el-button>
				<el-button class="m-0!" type="primary" @click="handleUseStabilizer">使用{{ game.game_config_special_items.data?.stabilizer?.nickname || '稳定剂' }}({{ stabilizerCount }})</el-button>
				<el-button class="m-0!" type="success" @click="handleSell" :disabled="!!bird?.status">
					{{ bird?.status ? '无法出售' : '出售' }}
				</el-button>
				<el-button
					type="danger"
          class="m-0!"
					@click="handleReincarnate"
					:disabled="(bird?.lv || 1) < 100"
				>
					{{ bird?.lv >= 100 ? '转生' : `转生(${bird?.lv || 1}/100)` }}
				</el-button>
				<el-button type="primary" @click="vis = false" class="m-0!">关闭</el-button>
			</div>
		</div>
	</el-dialog>

	<!-- 选择经验卡的对话框 -->
	<el-dialog v-model="expCardSelectionVisible" title="选择要使用的经验卡" width="90%">
		<!-- 如果已选择经验卡，显示数量选择器 -->
		<div v-if="selectedExpCard" class="mb-4 bg-blue-50 p-4 rounded">
			<div class="flex items-center justify-between gap-4">
				<div class="flex-1">
					<div class="text-sm font-bold text-blue-600 mb-2">使用数量：</div>
					<div class="text-xs text-gray-500">拥有: {{ selectedExpCard?.count || 0 }} 个</div>
				</div>
				<div class="flex items-center gap-2">
					<el-input-number
						v-model="useCount"
						:min="1"
						:max="selectedExpCard?.count || 1"
						size="large"
						style="width: 150px"
					/>
					<el-button size="large" @click="useCount = selectedExpCard?.count || 1">全部</el-button>
				</div>
			</div>
			<div class="mt-3 text-sm text-blue-600">
				总经验值: <span class="font-bold text-lg">+{{ (selectedExpCard?.game_item_bird_exp?.exp || 0) * useCount }} EXP</span>
			</div>
			<div class="flex gap-2 mt-4">
				<el-button @click="selectedExpCard = null">返回</el-button>
				<el-button type="primary" @click="confirmUseExpCard">确认使用</el-button>
			</div>
		</div>

		<!-- 经验卡列表 -->
		<div v-else class="grid grid-cols-1 gap-3">
			<el-card
				v-for="item in expCardList"
				:key="item.id"
				bodyClass="flex p-2! items-center justify-between"
				class="cursor-pointer hover:shadow-lg transition-shadow"
				@click="selectExpCard(item)"
			>
				<div class="flex items-center gap-3">
					<img
						:src="getImageUrl('item', item.game_item_bird_exp?.nickname)"
						alt=""
						class="w-16 h-16 object-contain"
					>
					<div>
						<div class="font-bold">{{ item.game_item_bird_exp?.nickname }}</div>
						<div class="flex gap-1 text-sm mt-1">
							<el-tag size="small">数量: {{ item.count }}</el-tag>
							<el-tag size="small" type="success">经验: {{ item.game_item_bird_exp?.exp }}</el-tag>
							<el-tag size="small" type="warning">价格: {{ item.game_item_bird_exp?.price }}</el-tag>
						</div>
					</div>
				</div>
				<el-button type="primary" size="small">使用</el-button>
			</el-card>

			<div v-if="expCardList.length === 0" class="text-center text-gray-400 py-8">
				暂无经验卡
			</div>
		</div>
	</el-dialog>
</template>

<script setup>
import { ElButton, ElDialog, ElIcon, ElTag, ElCard, ElInputNumber, ElMessageBox } from "element-plus"
import { ref, inject, computed } from "vue"
import { Picture } from "@element-plus/icons-vue"
import {getImageUrl} from '@/config/oss'
import { message } from '@/game/notification-center'

const game = inject('game')
const vis = ref(false)
const bird = ref(null)
const expCardSelectionVisible = ref(false)
const selectedExpCard = ref(null)
const useCount = ref(1)

// 计算当前鸟的技能列表
const birdSkills = computed(() => {
	if (!bird.value?.player_bird_skill) return []
	return bird.value.player_bird_skill
})

// 计算稳定剂数量
const stabilizerCount = computed(() => {
	if (!game.player_item_common.data) return 0
	// 从配置中获取稳定剂的ID
	const stabilizerId = game.game_config_special_items.data?.stabilizer_id
	if (!stabilizerId) return 0
	// 通过ID查找玩家的稳定剂道具
	const stabilizer = game.player_item_common.data.find(item =>
		item.game_item_common_id === stabilizerId
	)
	return stabilizer ? stabilizer.count : 0
})

const show = (birdData) => {
	bird.value = birdData
	vis.value = true
}

// 经验卡列表
const expCardList = computed(() => {
	if (!game.player_item_bird_exp?.data) return []
	return game.player_item_bird_exp.data.filter(item => item.count > 0)
})

// 显示经验卡选择对话框
const showExpCardSelection = async () => {
	// 更新经验卡数据
	await game.player_item_bird_exp.update()
	selectedExpCard.value = null
	useCount.value = 1
	expCardSelectionVisible.value = true
}

// 选择经验卡
const selectExpCard = (expCard) => {
	selectedExpCard.value = expCard
	useCount.value = 1
}

// 确认使用经验卡
const confirmUseExpCard = async () => {
	if (!bird.value || !selectedExpCard.value) return

	// 验证数量
	if (useCount.value < 1 || useCount.value > (selectedExpCard.value.count || 0)) {
		message.error('使用数量无效')
		return
	}

	try {
		const response = await game.player_bird.useExpCard(
			bird.value.id,
			selectedExpCard.value.game_item_bird_exp_id,
			useCount.value
		)

		if (response.code === 200) {
			message.success(response.data.message || '使用成功')
			// 更新经验卡数据
			await game.player_item_bird_exp.update()
			// 更新当前显示的鸟数据
			const updatedBird = game.player_bird.data.find(b => b.id === bird.value.id)
			if (updatedBird) {
				bird.value = updatedBird
			}
			// 关闭对话框
			expCardSelectionVisible.value = false
			selectedExpCard.value = null
		} else {
			message.error(response.message || '使用失败')
		}
	} catch (error) {
		message.error('使用失败: ' + error.message)
	}
}

// 出售鸟
const handleSell = async () => {
	if (!bird.value) return

	// 检查是否正在使用中
	if (bird.value.status) {
		message.warning(bird.value.statusDetail || '该鸟正在使用中，无法出售')
		return
	}

	// 检查是否可以出售
	const basePrice = bird.value.game_bird.price || 0
	if (basePrice === 0) {
		message.error('该鸟无法出售')
		return
	}

	// 计算预估价格用于确认对话框（基础价格 × 体重，不足1斤按1斤算）
	const weight = Math.max(1, Math.floor(bird.value.weight || 0))
	const estimatedPrice = basePrice * weight
	const currencyType = bird.value.game_bird.game_config_player_balance?.nickname || '金币'

	try {
		// 确认对话框
		await ElMessageBox.confirm(
			`确定要出售 ${bird.value.game_bird.nickname} 吗？\n\n体重：${weight} 斤\n预计获得：${estimatedPrice} ${currencyType}`,
			'出售确认',
			{
				confirmButtonText: '确认出售',
				cancelButtonText: '取消',
				type: 'warning'
			}
		)

		// 调用出售接口
		const response = await game.player_bird.sell({ player_bird_id: bird.value.id })

		if (response.code === 200) {
			// 显示实际获得的金币数（从后端返回）
			message.success(response.data.message || '出售成功')
			// 更新玩家信息（刷新金币）
			await game.player.update()
			// 关闭对话框
			vis.value = false
		} else {
			message.error(response.msg || '出售失败')
		}
	} catch (error) {
		if (error !== 'cancel') {
			message.error('出售失败: ' + (error.message || error))
		}
	}
}

// 转生
const handleReincarnate = async () => {
	if (!bird.value) return

	if ((bird.value.lv || 1) < 100) {
		message.warning('该鸟未达到100级，无法转生')
		return
	}

	try {
		await ElMessageBox.confirm(
			`确定要转生 ${bird.value.game_bird.nickname} 吗？\n\n转生后效果：\n• 等级重置为 1 级\n• 经验重置为 0\n• 初始体重 × 1.1\n• 成长值 + 0.05\n• 克制值 + 10\n• 转生次数 + 1`,
			'转生确认',
			{
				confirmButtonText: '确认转生',
				cancelButtonText: '取消',
				type: 'warning'
			}
		)

		const response = await game.player_bird.reincarnate(bird.value.id)

		if (response.code === 200) {
			message.success(response.data.message || '转生成功')
			const updatedBird = game.player_bird.data.find(b => b.id === bird.value.id)
			if (updatedBird) {
				bird.value = updatedBird
			}
		} else {
			message.error(response.msg || '转生失败')
		}
	} catch (error) {
		if (error !== 'cancel') {
			message.error('转生失败: ' + (error.message || error))
		}
	}
}

// 使用成长药水
const handleUseGrowthPotion = async () => {
	if (!bird.value) return

	try {
		await ElMessageBox.confirm(
			`确定要使用成长药水洗练 ${bird.value.game_bird.nickname} 的成长值吗？\n\n当前成长值: ${bird.value.grow.toFixed(2)}\n\n洗练后将随机获得 0.1-5.0 之间的成长值`,
			'洗练确认',
			{
				confirmButtonText: '确认洗练',
				cancelButtonText: '取消',
				type: 'warning'
			}
		)

		const response = await game.player_bird.useGrowthPotion(bird.value.id)

		if (response.code === 200) {
			message.success(response.data.message || '洗练成功')
			// 更新玩家道具数据
			await game.player_item_common.update()
			// 更新当前显示的鸟数据
			const updatedBird = game.player_bird.data.find(b => b.id === bird.value.id)
			if (updatedBird) {
				bird.value = updatedBird
			}
		} else {
			message.error(response.msg || '洗练失败')
		}
	} catch (error) {
		if (error !== 'cancel') {
			message.error('洗练失败: ' + (error.message || error))
		}
	}
}

// 使用稳定剂
const handleUseStabilizer = async () => {
	if (!bird.value) return

	const stabilizerName = game.game_config_special_items.data?.stabilizer?.nickname || '稳定剂'
	const stabilizerDesc = game.game_config_special_items.data?.stabilizer?.desc || '随机获得一个高级技能'

	try {
		await ElMessageBox.confirm(
			`确定要使用${stabilizerName}吗？\n\n${stabilizerName}的作用：${stabilizerDesc}`,
			'使用确认',
			{
				confirmButtonText: '确认使用',
				cancelButtonText: '取消',
				type: 'warning'
			}
		)

		const response = await game.player_bird.useStabilizer(bird.value.id)

		if (response.code === 200) {
			message.success(response.data.message || '使用成功')
			// 更新玩家道具数据
			await game.player_item_common.update()
			// 更新当前显示的鸟数据
			const updatedBird = game.player_bird.data.find(b => b.id === bird.value.id)
			if (updatedBird) {
				bird.value = updatedBird
			}
		} else {
			message.error(response.msg || '使用失败')
		}
	} catch (error) {
		if (error !== 'cancel') {
			message.error('使用失败: ' + (error.message || error))
		}
	}
}

// 根据体重判断品质
const getQualityLevel = (bird) => {
	if (!bird?.weight || !bird?.game_bird) return '普通'

	const weight = bird.weight
	const { weight_min, weight_max, weight_super } = bird.game_bird

	// 超级品质
	if (weight >= weight_super) return '传说'

	// 完美品质
	if (weight >= weight_max * 0.95) return '完美'

	// 优秀品质
	if (weight >= weight_max * 0.8) return '优秀'

	// 良好品质
	if (weight >= (weight_min + weight_max) / 2) return '良好'

	// 普通品质
	return '普通'
}

// 获取品质描述
const getQualityText = (bird) => {
	if (!bird?.weight || !bird?.game_bird) return '未知品质'

	const weight = bird.weight
	const { weight_max } = bird.game_bird
	const percentage = ((weight / weight_max) * 100).toFixed(1)

	return `体重占最大值的 ${percentage}%`
}

// 获取标签类型
const getQualityType = (bird) => {
	const level = getQualityLevel(bird)
	const typeMap = {
		'传说': 'danger',
		'完美': 'warning',
		'优秀': 'success',
		'良好': 'info',
		'普通': 'info'
	}
	return typeMap[level] || 'info'
}

defineExpose({
	show
})
</script>

<style scoped>
</style>
