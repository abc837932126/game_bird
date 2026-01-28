<template>
  <el-dialog v-model="vis" title="工会信息" width="90%" :close-on-click-modal="true" @closed="handleClosed">
    <div v-loading="loading">
      <div v-if="guildInfo" class="space-y-4">
        <!-- 工会名称和等级 -->
        <div class="flex justify-between items-center pb-3 border-b">
          <div class="text-2xl font-bold">{{ guildInfo.nickname }}</div>
          <div class="text-lg text-gray-600">等级 {{ guildInfo.level }}</div>
        </div>

        <!-- 描述和公告 -->
        <div class="grid grid-cols-2 gap-4">
          <div class="border border-gray-300 rounded p-3">
            <div class="text-xs text-gray-500 mb-2">工会描述</div>
            <div class="text-sm text-gray-700 whitespace-pre-line">{{ guildInfo.desc || '暂无描述' }}</div>
          </div>
          <div class="border border-gray-300 rounded p-3">
            <div class="text-xs text-gray-500 mb-2">工会公告</div>
            <div class="text-sm text-gray-700 whitespace-pre-line">{{ guildInfo.announcement || '暂无公告' }}</div>
          </div>
        </div>

        <!-- 会长和成员信息 -->
        <div class="flex justify-between text-sm bg-gray-50 p-4 rounded">
          <div>
            <div class="text-gray-500 mb-1">会长</div>
            <div class="font-medium text-base">{{ guildInfo.leader?.nickname || '未知' }}</div>
          </div>
          <div class="text-right">
            <div class="text-gray-500 mb-1">成员</div>
            <div class="font-medium text-base">{{ guildInfo.member_count }}/{{ guildInfo.max_members }}</div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between">
        <el-button @click="vis = false">关闭</el-button>
        <el-button
          v-if="!isInGuild"
          type="primary"
          @click="handleApply"
          :loading="applying"
        >
          申请加入
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { inject, ref, computed } from 'vue'
import { message } from '@/game/notification-center'

const emit = defineEmits(['closed'])
const game = inject('game')
const vis = ref(false)
const loading = ref(false)
const applying = ref(false)
const guildInfo = ref(null)

const isInGuild = computed(() => {
  return !!game.guild.data
})

const show = async (guildId) => {
  vis.value = true
  guildInfo.value = null
  loading.value = true

  try {
    const res = await game.guild.api.get_info(guildId)
    if (res.code === 200) {
      guildInfo.value = res.data
    } else {
      message.error(res.msg || '获取工会信息失败')
      vis.value = false
    }
  } catch (error) {
    console.error('获取工会信息失败:', error)
    message.error('获取工会信息失败')
    vis.value = false
  } finally {
    loading.value = false
  }
}

const handleApply = async () => {
  if (!guildInfo.value) return

  applying.value = true
  try {
    const res = await game.guild_application.api.apply({
      guild_id: guildInfo.value.id,
      message: ''
    })

    if (res.code === 200) {
      message.success('申请已提交')
      vis.value = false
    } else {
      message.error(res.msg || '申请失败')
    }
  } catch (error) {
    console.error('申请加入工会失败:', error)
    message.error('申请失败')
  } finally {
    applying.value = false
  }
}

const handleClosed = () => {
  emit('closed')
}

defineExpose({ show })
</script>
