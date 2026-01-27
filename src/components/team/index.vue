<template>
  <div class="h-full flex flex-col p-4">
    <el-card class="h-full overflow-y-auto">
      <!-- 队伍信息区域 (如果已加入队伍) -->
      <div v-if="myTeam" class="mb-4 p-4 bg-white rounded-lg shadow">
        <!-- 队伍名称和状态 -->
        <div class="flex justify-between items-center mb-3">
          <div class="text-xl font-bold">{{ myTeam.nickname }}</div>
          <div class="text-sm text-gray-700">
            <span v-if="myTeam.status === 'preparing'" class="text-yellow-600">准备中</span>
            <span v-else-if="myTeam.status === 'ready'" class="text-green-600">就绪</span>
          </div>
        </div>

        <!-- 分隔线 -->
        <div class="border-t border-gray-200 mb-3"></div>

        <!-- 队长和成员信息 -->
        <div class="flex justify-between text-sm mb-4">
          <div>
            <div class="text-gray-500 mb-1">队长</div>
            <div class="font-medium">{{ myTeam.leader?.nickname || '未知' }}</div>
          </div>
          <div class="text-right">
            <div class="text-gray-500 mb-1">成员</div>
            <div class="font-medium">{{ myTeam.team_members?.length || 0 }}/{{ myTeam.max_members }}</div>
          </div>
        </div>

        <!-- 成员列表 -->
        <div class="mb-4">
          <div class="text-sm font-bold mb-2">队伍成员</div>
          <div class="space-y-2">
            <div v-for="member in myTeam.team_members" :key="member.id"
                 class="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="font-medium">{{ member.player.nickname }}</div>
                <div v-if="member.player.id === myTeam.leader_id" class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">队长</div>
              </div>
              <div class="text-sm text-gray-600">Lv.{{ member.player.lv }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 未加入队伍时的提示 -->
      <div v-if="!myTeam" class="text-center py-8">
        <div class="text-4xl mb-4">⚔️</div>
        <div class="text-lg font-bold mb-2">你还没有加入队伍</div>
        <div class="text-sm text-gray-500 mb-4">创建队伍，邀请好友一起战斗！</div>
      </div>

      <el-divider/>

      <!-- 功能卡片区域 -->
      <div class="grid grid-cols-2 gap-3 mb-4">
        <!-- 已加入队伍的功能 -->
        <template v-if="myTeam">
          <el-card @click="handleInvite" v-if="isLeader" class="cursor-pointer hover:shadow-lg transition-shadow">
            <div class="text-center py-2">
              <div class="text-3xl mb-1">📨</div>
              <div class="text-sm">邀请成员</div>
            </div>
          </el-card>
          <el-card @click="handleBattle" v-if="isLeader" class="cursor-pointer hover:shadow-lg transition-shadow bg-purple-50">
            <div class="text-center py-2">
              <div class="text-3xl mb-1">⚔️</div>
              <div class="text-sm">发起战斗</div>
            </div>
          </el-card>
          <el-card @click="handleLeave" class="cursor-pointer hover:shadow-lg transition-shadow bg-red-50">
            <div class="text-center py-2">
              <div class="text-3xl mb-1">🚪</div>
              <div class="text-sm">{{ isLeader ? '解散队伍' : '离开队伍' }}</div>
            </div>
          </el-card>
        </template>

        <!-- 未加入队伍的功能 -->
        <template v-else>
          <el-card @click="handleCreate" class="cursor-pointer hover:shadow-lg transition-shadow">
            <div class="text-center py-2">
              <div class="text-3xl mb-1">➕</div>
              <div class="text-sm">创建队伍</div>
            </div>
          </el-card>
        </template>
      </div>
    </el-card>

    <!-- 创建队伍对话框 -->
    <el-dialog v-model="createDialogVisible" title="创建队伍" width="400px">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="队伍名称">
          <el-input v-model="createForm.nickname" placeholder="请输入队伍名称" maxlength="20" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCreate" :loading="creating">创建</el-button>
      </template>
    </el-dialog>

    <!-- 邀请成员对话框 -->
    <el-dialog v-model="inviteDialogVisible" title="邀请成员" width="400px">
      <el-form :model="inviteForm" label-width="80px">
        <el-form-item label="玩家ID">
          <el-input v-model.number="inviteForm.target_player_id" placeholder="请输入玩家ID" type="number" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="inviteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmInvite" :loading="inviting">邀请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import { message } from '@/game/notification-center'

const game = inject('game')

const myTeam = computed(() => game.team.data)
const createDialogVisible = ref(false)
const inviteDialogVisible = ref(false)
const creating = ref(false)
const inviting = ref(false)

const createForm = ref({
  nickname: ''
})

const inviteForm = ref({
  target_player_id: null
})

// 是否为队长
const isLeader = computed(() => {
  return myTeam.value && myTeam.value.leader_id === game.player.data.id
})

// 加载我的队伍信息
const loadMyTeam = async () => {
  await game.team.update()
}

// 创建队伍
const handleCreate = () => {
  createForm.value.nickname = ''
  createDialogVisible.value = true
}

const confirmCreate = async () => {
  if (!createForm.value.nickname) {
    message.warning('请输入队伍名称')
    return
  }

  creating.value = true
  try {
    const res = await game.team.api.create_team(createForm.value)
    if (res.code === 200) {
      message.success('队伍创建成功')
      createDialogVisible.value = false
      await loadMyTeam()
    } else {
      message.error(res.msg || '创建失败')
    }
  } catch (error) {
    message.error('创建失败')
  } finally {
    creating.value = false
  }
}

// 邀请成员
const handleInvite = () => {
  inviteForm.value.target_player_id = null
  inviteDialogVisible.value = true
}

const confirmInvite = async () => {
  if (!inviteForm.value.target_player_id) {
    message.warning('请输入玩家ID')
    return
  }

  inviting.value = true
  try {
    const res = await game.team.api.invite_player({
      team_id: myTeam.value.id,
      target_player_id: inviteForm.value.target_player_id
    })
    if (res.code === 200) {
      message.success('邀请成功')
      inviteDialogVisible.value = false
      await loadMyTeam()
    } else {
      message.error(res.msg || '邀请失败')
    }
  } catch (error) {
    message.error('邀请失败')
  } finally {
    inviting.value = false
  }
}

// 发起战斗
const handleBattle = () => {
  message.info('战斗功能开发中...')
}

// 离开队伍
const handleLeave = async () => {
  try {
    await ElMessageBox.confirm(
      isLeader.value ? '确定要解散队伍吗？' : '确定要离开队伍吗？',
      '确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const res = await game.team.api.leave_team({
      team_id: myTeam.value.id
    })
    if (res.code === 200) {
      message.success(res.msg)
      await loadMyTeam()
    } else {
      message.error(res.msg || '操作失败')
    }
  } catch (error) {
    // 用户取消
  }
}

onMounted(() => {
  loadMyTeam()
})
</script>
