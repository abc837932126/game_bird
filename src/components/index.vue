<template>
	<el-card class="min-h-screen w-full" :body-style="{ padding: 0 }">
		<!-- 横幅图片 -->
		<div class="h-48 flex items-center justify-center bg-center bg-cover",
			 style="background-image:url('https://bird.cn-nb1.rains3.com/img/bg/bird_game_big.png');">
		</div>

		<!-- 文字简介 -->
		<div class="text-center py-4 px-6">
			<h1 class="text-2xl font-bold">Bird Game</h1>
			<p class="text-gray-500 mt-2">一款有趣的小鸟冒险游戏</p>
		</div>

		<!-- 登录注册框 -->
		<div>
			<el-tabs v-model="activeTab" stretch>
				<el-tab-pane label="登录" name="login"/>
				<el-tab-pane label="注册" name="register"/>
			</el-tabs>

			<el-form :model="form" style="padding: 0 48px 24px">
				<el-form-item>
					<el-input v-model="form.username" placeholder="用户名" size="large" :prefix-icon="User"/>
				</el-form-item>

				<el-form-item>
					<el-input v-model="form.userpass" type="password" placeholder="密码" size="large" show-password
					          :prefix-icon="Lock"/>
				</el-form-item>

				<!-- 注册时的确认密码 -->
				<el-form-item v-if="activeTab === 'register'">
					<el-input v-model="form.confirmPassword" type="password" placeholder="确认密码" size="large" show-password
					          :prefix-icon="Lock"/>
				</el-form-item>

				<el-form-item v-if="activeTab === 'register'">
					<el-input v-model="form.nickname" placeholder="昵称" size="large" :prefix-icon="User"/>
				</el-form-item>
				<el-form-item v-if="activeTab === 'register'">
					<el-radio v-model="form.sex" size="large" name="sex" value="0" label="男" :prefix-icon="User"/>
					<el-radio v-model="form.sex" size="large" name="sex" value="1" label="女" :prefix-icon="User"/>
				</el-form-item>

				<!-- 登录时的记住密码 -->
				<el-form-item v-if="activeTab === 'login'">
					<el-checkbox v-model="rememberPassword" size="large">记住密码</el-checkbox>
				</el-form-item>

				<el-form-item>
					<el-button type="primary" size="large"  @click="submit" class="w-full">
						{{ activeTab === 'login' ? '开始游戏' : '立即注册' }}
					</el-button>
				</el-form-item>
			</el-form>
		</div>
	</el-card>
</template>

<script setup>
import {ref, inject, onMounted, watch, onUnmounted} from 'vue'
import {User, Lock} from '@element-plus/icons-vue'
import {ElMessage, ElCheckbox} from 'element-plus'

const game = inject('game')
const activeTab = ref('login')
const form = ref({username: '', userpass: '', nickname: '', sex: 0, confirmPassword: ''})
const rememberPassword = ref(true) // 默认勾选记住密码

// 页面加载时读取已保存的账号密码
onMounted(() => {
	const savedUsername = localStorage.getItem('bird_username')
	const savedPassword = localStorage.getItem('bird_password')
	if (savedUsername && savedPassword) {
		form.value.username = savedUsername
		form.value.userpass = savedPassword
		rememberPassword.value = true
	}
})

// 切换标签页时清空确认密码
const stopWatcher = watch(activeTab, () => {
	if (activeTab.value === 'login') {
		form.value.confirmPassword = ''
	}
})

onUnmounted(() => {
	if (stopWatcher) {
		stopWatcher()
	}
})

const submit = async () => {
	// 注册时验证密码是否一致
	if (activeTab.value === 'register') {
		if (form.value.userpass !== form.value.confirmPassword) {
			ElMessage.error('两次输入的密码不一致')
			return
		}
		if (!form.value.userpass || form.value.userpass.length < 6) {
			ElMessage.error('密码至少需要6个字符')
			return
		}
	}

	let res
	if (activeTab.value === 'login') {
		res = await game.player.api.login(form.value)
	} else {
		res = await game.player.api.reg(form.value)
	}

	if (res.code === 200) {
		if (res.data?.token) {
			// 登录成功后处理记住密码
			if (activeTab.value === 'login') {
				if (rememberPassword.value) {
					localStorage.setItem('bird_username', form.value.username)
					localStorage.setItem('bird_password', form.value.userpass)
				} else {
					localStorage.removeItem('bird_username')
					localStorage.removeItem('bird_password')
				}
			}

			game.token = res.data.token
			await game.refreshGameData()



		}
		ElMessage.success(res.msg)
	} else {
		ElMessage.error(res.msg)
	}

}
</script>