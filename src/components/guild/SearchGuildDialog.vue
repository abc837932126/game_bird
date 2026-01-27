<template>
	<el-dialog v-model="vis" title="搜索工会" width="90%" :close-on-click-modal="true">
		<!-- 搜索框 -->
		<div class="mb-4">
			<el-input
				v-model="keyword"
				placeholder="输入工会名称搜索"
				@keyup.enter="handleSearch"
			>
				<template #append>
					<el-button @click="handleSearch" :loading="loading">
						<span>🔍 搜索</span>
					</el-button>
				</template>
			</el-input>
		</div>

		<!-- 工会列表 -->
		<div v-if="guilds.length > 0" class="space-y-3 max-h-96 overflow-y-auto">
			<el-card v-for="guild in guilds" :key="guild.id" class="cursor-pointer hover:shadow-lg transition-shadow">
				<div class="flex justify-between items-center">
					<div class="flex-1">
						<div class="font-bold text-lg mb-1">{{ guild.nickname }}</div>
						<div class="text-sm text-gray-600 mb-2">{{ guild.desc || '暂无描述' }}</div>
						<div class="flex gap-4 text-xs text-gray-500">
							<span>等级: {{ guild.level }}</span>
							<span>成员: {{ guild.member_count }}/{{ guild.max_members }}</span>
							<span>会长: {{ guild.leader?.nickname }}</span>
						</div>
					</div>
					<el-button
						type="primary"
						size="small"
						@click="handleApply(guild)"
						:loading="applyingGuildId === guild.id"
					>
						申请加入
					</el-button>
				</div>
			</el-card>
		</div>

		<!-- 空状态 -->
		<div v-else-if="searched" class="text-center py-16 text-gray-400">
			<div class="text-6xl mb-4">🔍</div>
			<div class="text-lg">未找到相关工会</div>
		</div>

		<!-- 初始状态 -->
		<div v-else class="text-center py-16 text-gray-400">
			<div class="text-6xl mb-4">🏰</div>
			<div class="text-lg">输入工会名称开始搜索</div>
		</div>

		<template #footer>
			<el-button @click="vis = false">关闭</el-button>
		</template>
	</el-dialog>
</template>

<script setup>
import { inject, ref } from 'vue'
import { message } from '@/game/notification-center'

const game = inject('game')
const vis = ref(false)
const loading = ref(false)
const keyword = ref('')
const guilds = ref([])
const searched = ref(false)
const applyingGuildId = ref(null)

const show = () => {
	vis.value = true
	keyword.value = ''
	guilds.value = []
	searched.value = false
}

const handleSearch = async () => {
	if (!keyword.value.trim()) {
		message.warning('请输入搜索关键词')
		return
	}

	loading.value = true
	try {
		const res = await game.guild.api.search({ keyword: keyword.value.trim() })
		if (res.code === 200) {
			guilds.value = res.data
			searched.value = true
		} else {
			message.error(res.msg || '搜索失败')
		}
	} catch (error) {
		console.error('搜索工会失败:', error)
		message.error('搜索失败')
	} finally {
		loading.value = false
	}
}

const handleApply = async (guild) => {
	applyingGuildId.value = guild.id
	try {
		const res = await game.guild_application.api.apply({
			guild_id: guild.id,
			message: ''
		})

		if (res.code === 200) {
			message.success('申请已提交')
		} else {
			message.error(res.msg || '申请失败')
		}
	} catch (error) {
		console.error('申请加入工会失败:', error)
		message.error('申请失败')
	} finally {
		applyingGuildId.value = null
	}
}

defineExpose({ show })
</script>
