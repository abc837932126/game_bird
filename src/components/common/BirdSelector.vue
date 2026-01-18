<template>
	<el-dialog v-model="visible" :title="title" width="90%" append-to-body @close="handleClose">
		<div v-if="loading" class="text-center py-8 text-gray-400">
			加载中...
		</div>
		<div v-else-if="filteredBirds.length === 0" class="text-center py-8 text-gray-400">
			暂无可用的鸟
		</div>
		<div v-else class="max-h-[60vh] overflow-y-auto">
			<div class="grid grid-cols-1 gap-3">
				<el-card
					v-for="bird in filteredBirds"
					:key="bird.id"
					bodyClass="flex p-2! items-center justify-between"
					class="cursor-pointer hover:shadow-lg transition-shadow"
					:class="{'opacity-50': !!bird.status}"
					@click="!bird.status && handleSelect(bird)"
				>
					<div class="flex items-center gap-3">
						<img
							:src="getImageUrl('bird', bird.game_bird?.nickname)"
							alt=""
							class="w-16 h-16 object-contain"
						>
						<div>
							<div class="font-bold">{{ bird.game_bird.nickname }}</div>
							<div class="flex gap-1 text-sm mt-1">
								<el-tag size="small">Lv.{{ bird.lv }}</el-tag>
								<el-tag size="small" type="success">经验: {{ bird.exp }}</el-tag>
								<el-tag size="small" type="warning">体重: {{ bird.weight?.toFixed(2) }}kg</el-tag>
							</div>
							<el-tag v-if="bird.status" :type="bird.status === 'ladder' ? 'danger' : 'warning'" size="small" class="mt-1">
								{{ bird.statusDetail }}
							</el-tag>
						</div>
					</div>
					<el-button type="primary" size="small" :disabled="!!bird.status">选择</el-button>
				</el-card>

				<!-- 取消选项（仅当 allowCancel 为 true 且有当前选择时显示） -->
				<el-card
					v-if="allowCancel"
					bodyClass="flex p-2! items-center justify-between"
					class="cursor-pointer hover:shadow-lg transition-shadow"
					@click="handleSelect(null)"
				>
					<div class="flex items-center gap-3">
						<div class="w-16 h-16 flex items-center justify-center text-3xl">
							❌
						</div>
						<div>
							<div class="font-bold">{{ cancelText || '取消选择' }}</div>
						</div>
					</div>
					<el-button type="danger" size="small">取消</el-button>
				</el-card>
			</div>
		</div>
	</el-dialog>
</template>

<script setup>
import { ref, computed, watch, inject, onUnmounted } from 'vue'
import { getImageUrl } from '@/config/oss'

const game = inject('game')

const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false
	},
	title: {
		type: String,
		default: '选择鸟'
	},
	// 过滤函数，接收 bird 对象，返回 true/false
	filter: {
		type: Function,
		default: null
	},
	// 排除的鸟 ID 列表
	excludeIds: {
		type: Array,
		default: () => []
	},
	// 是否显示取消选项
	allowCancel: {
		type: Boolean,
		default: false
	},
	// 取消按钮文字
	cancelText: {
		type: String,
		default: ''
	},
	// 是否自动加载鸟列表
	autoLoad: {
		type: Boolean,
		default: true
	}
})

const emit = defineEmits(['update:modelValue', 'select'])

const visible = computed({
	get: () => props.modelValue,
	set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)

// 过滤后的鸟列表
const filteredBirds = computed(() => {
	if (!game.player_bird.data) return []

	let birds = game.player_bird.data

	// 排除指定 ID
	if (props.excludeIds.length > 0) {
		birds = birds.filter(bird => !props.excludeIds.includes(bird.id))
	}

	// 应用自定义过滤
	if (props.filter) {
		birds = birds.filter(props.filter)
	}

	return birds
})

// 当对话框打开时，自动加载鸟列表
const stopWatcher = watch(visible, async (newVal) => {
	if (newVal && props.autoLoad) {
		loading.value = true
		try {
			await game.player_bird.update()
		} finally {
			loading.value = false
		}
	}
})

onUnmounted(() => {
	if (stopWatcher) {
		stopWatcher()
	}
})

const handleSelect = (bird) => {
	emit('select', bird)
	visible.value = false
}

const handleClose = () => {
	visible.value = false
}
</script>

<style scoped>
</style>
