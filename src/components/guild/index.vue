<template>
  <div class="h-full flex flex-col p-4">
    <el-card class="h-full overflow-y-auto">


      <!-- 工会信息区域 (如果已加入工会) -->
      <div v-if="myGuild" class="mb-4 p-4 bg-white rounded-lg ">
        <!-- 描述和公告 - 两列布局 -->
        <div class="grid grid-cols-2 gap-4 mb-5!">
          <!-- 左侧：描述 -->
          <div class="border border-gray-300 rounded p-3">
            <div class="text-xs text-gray-500 mb-1">工会描述</div>
            <div class="text-sm text-gray-600 whitespace-pre-line">{{ myGuild.desc || '暂无描述' }}</div>
          </div>
          <!-- 右侧：公告 -->
          <div class="border border-gray-300 rounded p-3">
            <div class="text-xs text-gray-500 mb-1">工会公告</div>
            <div class="text-sm text-gray-600 whitespace-pre-line">{{ myGuild.announcement || '暂无公告' }}</div>
          </div>
        </div>

        <!-- 工会名称和等级 -->
        <div class="flex justify-between items-center mb-3">
          <div class="text-xl font-bold">{{ myGuild.nickname }}</div>
          <div class="text-sm text-gray-700">{{ myGuild.level }}级</div>
        </div>

        <!-- 经验进度条 -->
        <div class="mb-3">
          <el-progress
            :percentage="expPercentage"
            :stroke-width="8"
            :show-text="false"
          />
          <div class="flex justify-end text-xs text-gray-500 mt-1">
            <span>{{ myGuild.exp}} /{{myGuild.next_level_exp}}</span>
          </div>
        </div>

        <!-- 分隔线 -->
        <div class="border-t border-gray-200 mb-3"></div>

        <!-- 会长和成员信息 -->
        <div class="flex justify-between text-sm">
          <div>
            <div class="text-gray-500 mb-1">会长</div>
            <div class="font-medium">{{ myGuild.leader?.nickname || '未知' }}</div>
          </div>
          <div class="text-right">
            <div class="text-gray-500 mb-1">成员</div>
            <div class="font-medium">{{ myGuild.member_count }}/{{ myGuild.max_members }}</div>
          </div>
        </div>
      </div>

      <!-- 未加入工会时显示工会列表 -->
      <div v-if="!myGuild" class="text-lg font-bold mb-3">工会列表</div>
      <el-card v-if="!myGuild" class="mb-4 p-4 bg-white rounded-lg shadow border border-gray-200">

        <div v-loading="loadingGuilds" class="space-y-2">
          <div v-for="guild in guildList" :key="guild.id" class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer flex items-center justify-between"
               @click="handleViewGuildInfo(guild)">
            <div class="flex-1">              <div class="font-bold text-base">{{ guild.nickname }}</div>
              <div class="text-sm text-gray-500 mt-1">
                会长: {{ guild.leader_nickname }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-600">Lv.{{ guild.level }}</div>
              <div class="text-xs text-gray-500">{{ guild.member_count }}/{{ guild.max_members }}人</div>
            </div>
          </div>
          <div v-if="!loadingGuilds && guildList.length === 0" class="text-center py-8 text-gray-400">
            暂无工会
          </div>
        </div>
      </el-card>

      <el-divider/>

      <!-- 功能卡片区域 (2列网格) -->
      <div class="grid grid-cols-2 gap-3 mb-4">
        <!-- 已加入工会的功能 -->
        <template v-if="myGuild">
          <el-card @click="handleViewMembers" class="cursor-pointer hover:shadow-lg transition-shadow">
            <div class="text-center py-2">
              <div class="text-3xl mb-1">👥</div>
              <div class="text-sm">成员列表</div>
            </div>
          </el-card>
          <el-card @click="handleSalary" class="cursor-pointer hover:shadow-lg transition-shadow">
            <div class="text-center py-2">
              <div class="text-3xl mb-1">💰</div>
              <div class="text-sm">领取工资</div>
            </div>
          </el-card>
          <el-card @click="handleInvite" v-if="canManage" class="cursor-pointer hover:shadow-lg transition-shadow">
            <div class="text-center py-2">
              <div class="text-3xl mb-1">📨</div>
              <div class="text-sm">邀请成员</div>
            </div>
          </el-card>
          <el-card @click="handleApplications" v-if="canManage"
                   class="cursor-pointer hover:shadow-lg transition-shadow">
            <div class="text-center py-2">
              <el-badge :value="pendingApplicationCount" :hidden="pendingApplicationCount === 0" type="danger">
                <div class="text-3xl mb-1">📬</div>
              </el-badge>
              <div class="text-sm">入会申请</div>
            </div>
          </el-card>
          <el-card @click="handleSettings" v-if="canManage" class="cursor-pointer hover:shadow-lg transition-shadow">
            <div class="text-center py-2">
              <div class="text-3xl mb-1">⚙️</div>
              <div class="text-sm">工会设置</div>
            </div>
          </el-card>
          <el-card @click="handleLeave" class="cursor-pointer hover:shadow-lg transition-shadow bg-red-50">
            <div class="text-center py-2">
              <div class="text-3xl mb-1">🚪</div>
              <div class="text-sm text-red-600">离开工会</div>
            </div>
          </el-card>
        </template>

        <!-- 未加入工会的功能 -->
        <template v-else>

          <el-button @click="handleCreate" class="m-0!">
              <div class="text-sm text-blue-600">创建工会</div>
          </el-button>
          <el-button @click="handleSearch" class="m-0!">
              <div class="text-sm">搜索工会</div>
          </el-button>
          <el-button @click="handleMyInvites" class="m-0!">
              <div class="text-sm">我的邀请</div>
          </el-button>
          <el-button @click="handleMyApplications" class="m-0!">
            <div class="text-sm">我的申请</div>
          </el-button>
        </template>
      </div>
    </el-card>

    <!-- 对话框组件 -->
    <CreateGuildDialog ref="createDialogRef" @created="handleGuildCreated"/>
    <SearchGuildDialog ref="searchDialogRef"/>
    <GuildInfoDialog ref="guildInfoDialogRef" @closed="handleGuildInfoClosed"/>
    <GuildMembersDialog ref="membersDialogRef"/>
    <GuildSettingsDialog ref="settingsDialogRef"/>
    <GuildInvitesDialog ref="invitesDialogRef"/>
    <GuildApplicationsDialog ref="applicationsDialogRef"/>
    <GuildSalaryDialog ref="salaryDialogRef"/>
  </div>
</template>

<script setup>
import {inject, computed, ref, onMounted} from 'vue'
import {ElMessage, ElMessageBox, ElBadge} from 'element-plus'
import { canManageGuild } from '@/utils/guild-position'
import CreateGuildDialog from './CreateGuildDialog.vue'
import SearchGuildDialog from './SearchGuildDialog.vue'
import GuildInfoDialog from './GuildInfoDialog.vue'
import GuildMembersDialog from './GuildMembersDialog.vue'
import GuildSettingsDialog from './GuildSettingsDialog.vue'
import GuildInvitesDialog from './GuildInvitesDialog.vue'
import GuildApplicationsDialog from './GuildApplicationsDialog.vue'
import GuildSalaryDialog from './GuildSalaryDialog.vue'

const game = inject('game')
const createDialogRef = ref(null)
const searchDialogRef = ref(null)
const guildInfoDialogRef = ref(null)
const membersDialogRef = ref(null)
const settingsDialogRef = ref(null)
const invitesDialogRef = ref(null)
const applicationsDialogRef = ref(null)
const salaryDialogRef = ref(null)

// 工会列表相关
const guildList = ref([])
const loadingGuilds = ref(false)

// 获取我的工会信息
const myGuild = computed(() => {
  return game.guild.data
})


// 是否有管理权限 (会长或官员)
const canManage = computed(() => {
  if (!myGuild.value) return false
  return canManageGuild(myGuild.value)
})

// 待处理申请数量
const pendingApplicationCount = computed(() => {
  return game.guild_application?.pendingCount || 0
})

// 经验百分比
const expPercentage = computed(() => {
  if (!myGuild.value) return 0
  const exp = myGuild.value.exp || 0
  const nextLevelExp = myGuild.value.next_level_exp || 1
  return Math.floor((exp / nextLevelExp) * 100)
})

// 页面加载时刷新工会信息
onMounted(async () => {
  await game.guild.update()
  // 如果未加入工会，加载工会列表
  if (!game.guild.data) {
    await loadGuildList()
  }
})

// 加载工会列表
const loadGuildList = async () => {
  loadingGuilds.value = true
  try {
    const res = await game.guild.api.get_list({ page: 1, limit: 20 })
    if (res.code === 200) {
      guildList.value = res.data.guilds || []
    }
  } catch (error) {
    console.error('加载工会列表失败:', error)
  } finally {
    loadingGuilds.value = false
  }
}

// 查看工会信息
const handleViewGuildInfo = (guild) => {
  guildInfoDialogRef.value?.show(guild.id)
}

// 工会信息对话框关闭后刷新列表
const handleGuildInfoClosed = async () => {
  // 如果未加入工会，刷新工会列表
  if (!game.guild.data) {
    await loadGuildList()
  }
}

// 创建工会
const handleCreate = () => {
  createDialogRef.value?.show()
}

// 搜索工会
const handleSearch = () => {
  searchDialogRef.value?.show()
}

// 查看成员列表
const handleViewMembers = () => {
  membersDialogRef.value?.show()
}

// 领取工资
const handleSalary = () => {
  salaryDialogRef.value?.show()
}

// 邀请成员
const handleInvite = () => {
  ElMessage.info('邀请成员功能开发中')
}

// 查看入会申请
const handleApplications = () => {
  applicationsDialogRef.value?.show(true)
}

// 工会设置
const handleSettings = () => {
  settingsDialogRef.value?.show()
}

// 离开工会
const handleLeave = async () => {
  try {
    await ElMessageBox.confirm(
        '确定要离开工会吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    const res = await game.guild.api.leave()
    if (res.code === 200) {
      ElMessage.success('已离开工会')
      await game.guild.update()
    } else {
      ElMessage.error(res.msg || '离开工会失败')
    }
  } catch (error) {
    // 用户取消
  }
}

// 我的邀请
const handleMyInvites = () => {
  invitesDialogRef.value?.show()
}

// 我的申请
const handleMyApplications = () => {
  applicationsDialogRef.value?.show(false)
}

// 工会创建成功后刷新
const handleGuildCreated = async () => {
  await game.guild.update()
}
</script>
