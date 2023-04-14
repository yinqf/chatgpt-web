<script setup>
import { NButton, NForm, NFormItem, NInput, NModal, useMessage } from 'naive-ui'
import { computed, onMounted, ref, watch } from 'vue'
import request from '@/utils/request/axios'
import { useUserStore } from '@/store'

const dialogVisible = ref(false)

const userStore = useUserStore()
const apiUrl = import.meta.env.VITE_GLOB_API_URL
const loading = ref(false)

const mobileNo = ref('')
const password = ref('')
const captcha = ref('')
const captchaUid = ref('')
const captchaUrl = ref('')
const ms = useMessage()

const showLogin = computed(() => userStore.userInfo.showLogin)
dialogVisible.value = showLogin.value

watch(showLogin, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  userStore.updateUserInfo({ showLogin: val })
})

function LoginHandle() {
  if (!mobileNo.value)
    return

  if (!password.value)
    return

  try {
    loading.value = true
    request.post('/login', {
      mobileNo: mobileNo.value,
      password: password.value,
      captchaUid: captchaUid.value,
      userType: 'normal',
      clientType: 'chat-aiCore',
      loginType: 'password',
      captcha: captcha.value,
    }, {
      headers: {
        post: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    }).then((res) => {
      loading.value = false
      if (res.data.success && res.data.content) {
        const appUser = res.data.content.appUser
        const accessToken = res.data.content.token
        userStore.updateUserInfo({
          avatar: userStore.userInfo.avatar,
          name: appUser.userName,
          description: `到期时间：${appUser.expireTime.substring(0, 10)}`,
          accessToken,
        })
        ms.success('登录成功')
        dialogVisible.value = false
      }
      else {
        getCaptcha()
        ms.error(res.data.errorMessage ?? 'error')
      }
    }, (error) => {
      ms.error(error.message ?? 'error')
    })
  }
  catch (error) {
    loading.value = false
    ms.error(error.message ?? 'error')
  }
}

function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
}

function guid() {
  return (`${S4() + S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`)
}

function getCaptcha() {
  captcha.value = ''
  captchaUid.value = guid()
  captchaUrl.value = `${apiUrl}/captcha/getImg?width=95&high=35&clientId=chat&captchaUid=${captchaUid.value}`
}

onMounted(() => {
  getCaptcha()
})
</script>

<template>
  <div>
    <NModal :show="dialogVisible" title="登录" style="width: 90%; max-width: 440px">
      <div class="p-10 bg-white rounded dark:bg-slate-800">
        <div class="space-y-4">
          <NForm ref="loginForm">
            <NFormItem label="账号" label-width="80px" prop="username">
              <NInput v-model:value="mobileNo" placeholder="请输入账号" />
            </NFormItem>
            <NFormItem label="密码" label-width="80px" prop="password">
              <NInput v-model:value="password" type="password" placeholder="请输入密码" />
            </NFormItem>
            <NFormItem label="验证码" label-width="80px" prop="password">
              <div class="inputBox">
                <NInput v-model:value="captcha" placeholder="请输入验证码" />
                <img :src="captchaUrl" alt="" class="captchaImg" @click="getCaptcha">
              </div>
            </NFormItem>
            <div class="footer">
              <NButton type="primary" class="btn" :loading="loading" @click="LoginHandle">
                登录
              </NButton>
              <NButton style="margin-left: 40px" class="btn" @click="dialogVisible = false">
                取消
              </NButton>
            </div>
          </NForm>
        </div>
      </div>
    </NModal>
  </div>
</template>

<style lang="less" scoped>
  .footer {
     display: flex;
     text-align: center;
     align-items: center;
     justify-content: center;
     .btn{
         padding: 0 30px;
     }
  }
  .inputBox{
     position: relative;
     width: 100%;
     height: 34px;
  }
  .captchaImg{
     cursor:pointer;
     position: absolute;
     top:1px;
     right: 1px;
     border-radius: 3px;
     height: 32px;
  }
</style>
