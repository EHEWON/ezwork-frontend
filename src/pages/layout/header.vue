<template>
  <div class="page-header">
    <div class="head-box">
      <div class="logo">
        <img src="@/assets/logo.png" class="logo_img" alt="EZ-work">
        <span>{{store.pTitle}}</span>
        <img class="icon_vip phone_show" style="height:16px;margin-left:10px;" v-if="store.level == 'vip'" src="@/assets/vip.png" alt="">
      </div>
      <div class="btn-box">
        <template v-if="store.token">
          <div class="flex-center">
            <div class="btn_set" @click="funOpenSet"><img src="@/assets/icon_set.png" alt=""><span class="pc_show">翻译设置</span></div>
            <img class="icon_vip pc_show" v-if="store.level == 'vip'" src="@/assets/vip.png" alt="">
            <el-dropdown placement="bottom-end" @command="user_action">
              <template #default>
                <div>
                  <el-button class="pc_show">
                    <div class="username" :title="store.username">{{store.username}}</div> <el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <div class="phone_show icon_more">
                    <el-icon><MoreFilled /></el-icon>
                  </div>
                </div>
              </template>
              
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="pwd">修改密码</el-dropdown-item>
                  <el-dropdown-item command="exit">退出</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
        <template v-else>
          <el-button class="pc_show" @click="authVisible=!authVisible">登录/注册</el-button>
          <el-icon class="phone_show icon_user" @click="authVisible=!authVisible"><User /></el-icon>
        </template>
      </div>
    </div>

    <!-- 登录注册弹窗 -->
    <el-dialog v-model="authVisible" center width="90%" modal-class="custom_dialog login_dialog" :show-close="false" style="border-radius: 20px;">
      <template #header="{close,titleId,titleClass}">
        <el-menu :default-active="activeIndex" mode="horizontal" class="menu-center" @select="menuSelect" text-color="#8F8F91" active-text-color="#111111">
          <el-menu-item index="1" class="menu-title">登录</el-menu-item>
          <el-menu-item index="2" class="menu-title">注册</el-menu-item>
        </el-menu>
      </template>
      <template v-if="activeIndex==1">
        <login @forget="forgetPwd" @success="loginSuccess"></login>
      </template>
      <template v-else>
        <register @success="registerSuccess"></register>
      </template>
    </el-dialog>

    <!-- 重置密码弹窗 -->
    <el-dialog v-model="forgetVisible" center width="90%" modal-class="custom_dialog login_dialog" :show-close="false" style="border-radius: 20px;">
      <template #header="{close,titleId,titleClass}">
        <h1 :class="titleClass" class="forget-title">
          <el-icon style="cursor: pointer;" @click="backToAuth">
            <Back />
          </el-icon>
          <el-text>重置密码</el-text>
          <div style="display: inline-block;"></div>
        </h1>
      </template>
      <forget @return="backToAuth" @success="forgetSuccess"></forget>
    </el-dialog>

    <!-- 修改密码 -->
    <el-dialog v-model="changeVisible" title="修改密码" modal-class="custom_dialog change_dialog" center width="90%" :show-close="false" style="border-radius: 20px;">
      <change @success="changeSuccess"></change>
    </el-dialog>

    <!-- 退出弹窗 -->
    <el-dialog v-model="logoutVisible" modal-class="custom_dialog" center :show-close="false" width="90%" heigt="240px" style="border-radius: 20px;">
      <div class="dialog-container">
        <div class="dialog-title">退出登录</div>
        <div class="dialog-content">您确定要退出登录吗？</div>
        <div class="dialog-btns">
          <el-button class="dialog-btn cancel" @click="logoutVisible=false">取消</el-button>
          <el-button class="dialog-btn confirm" type="primary" color="#055CF9" @click="confirmLogout">确认</el-button>
        </div>
      </div>
    </el-dialog>
    <el-dialog v-model="resetSuccessVisible" title="" center :show-close="false" class="custom_2_dialog" width="90%" heigt="240px" style="border-radius: 20px;">
      <div class="dialog-container">
        <img src="@assets/reset_success.png" style="width:128px;" />
        <div class="dialog-content" style="margin-top:10px;">重置密码成功！</div>
        <div class="dialog-btns">
          <el-button class="dialog-btn send-confirm" color="#055CF9" @click="resetSuccessVisible=false">确认</el-button>
        </div>
      </div>
    </el-dialog>
    <el-dialog v-model="registerSuccessVisible" title="" center :show-close="false" class="custom_2_dialog" width="90%" heigt="240px" style="border-radius: 20px;">
      <div class="dialog-container">
        <img src="@assets/reset_success.png" style="width:128px;" />
        <div class="dialog-content" style="margin-top:10px;">您已注册成功！</div>
        <div class="dialog-btns">
          <el-button class="dialog-btn send-confirm" color="#055CF9" @click="registerSuccessVisible=false">确认</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
import { store } from '@/store/index'
import login from '@/components/login.vue'
import register from '@/components/register.vue'
import forget from '@/components/forget.vue'
import change from '@/components/change.vue'
import { authInfo } from '@/api/account'
import { ref, provide, watch, defineProps, defineEmits, onMounted } from 'vue'
const props = defineProps({
  title: String,
  authDialog: Boolean,
})
const emit = defineEmits(['close-auth-dialog', 'open-set-form'])
const authVisible = ref(false)
const logoutVisible = ref(false)
const forgetVisible = ref(false)
const changeVisible = ref(false)
const resetSuccessVisible = ref(false)
const registerSuccessVisible = ref(false)
const activeIndex = ref("1")

watch(() => props.authDialog, (n, o) => {
  authVisible.value = n
})

watch(authVisible, (n, o) => {
  if (!n) {
    emit('close-auth-dialog')
  }
})

onMounted(() => {
  authInfo().then(data => {
    store.setUsername(data.data.email)
    store.setLevel(data.data.level)
  })
})

//用户操作
function user_action(command) {
  console.log(command)
  if (command == 'pwd') {
    changeVisible.value = true;
  }
  if (command == 'exit') {
    logoutVisible.value = !logoutVisible.value;
  }
}

function menuSelect(index) {
  activeIndex.value = index
}

//打开设置弹窗
function funOpenSet() {
  emit('open-set-form')
}

function forgetPwd() {
  authVisible.value = false
  forgetVisible.value = true
}

function backToAuth() {
  authVisible.value = true
  forgetVisible.value = false
  activeIndex.value = 1
}
function cancelLogout() {
  logoutVisible.value = false
}
function confirmLogout() {
  store.setToken("")
  logoutVisible.value = false
}
function loginSuccess() {
  authVisible.value = false
}
function registerSuccess() {
  authVisible.value = false
}
function forgetSuccess() {
  forgetVisible.value = false
  authVisible.value = true
}
function changeSuccess() {
  changeVisible.value = false
}

</script>
<style scoped lang="scss">
.page-header {
  width: 100%;
  height: 60px;
  background: #ffffff;
  box-shadow: 0px 0px 12px 0px rgba(0, 22, 52, 0.05);
}
.head-box {
  max-width: 1240px;
  padding: 0 20px;
  margin: 0 auto;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo {
  display: flex;
  align-items: center;
  img {
    height: 44px;
  }
  span {
    font-size: 20px;
    font-weight: bold;
    margin-left: 20px;
  }
}
::v-deep {
  .btn_set {
    display: flex;
    align-items: center;
    margin-right: 20px;
    font-size: 14px;
    color: #000000;
    cursor: pointer;
    img {
      margin-right: 8px;
    }
  }
  .icon_vip {
    margin-right: 12px;
  }
  .username {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 30px;
  }
  .el-dropdown {
    .el-button {
      outline: none;
    }
  }

  .custom_dialog {
    .el-dialog__header {
      padding-bottom: 0;
      font-size: 16px;
      color: #111;
    }
    .el-dialog {
      max-width: 410px;
      padding: 20px;
    }
  }
  .custom_2_dialog{
    .el-dialog {
      max-width: 410px;
    }
  }
  .change_dialog {
    .el-dialog {
      padding: 20px 40px;
    }
    .el-dialog__header {
      margin-top: 10px;
      margin-bottom: 20px;
    }
  }

  .dialog-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .dialog-title {
    font-weight: bold;
    font-size: 20px;
    color: #111111;
    line-height: 24px;
    margin-top: 30px;
    margin-bottom: 20px;
  }
  .dialog-content {
    font-family: "PingFang SC";
    font-weight: 400;
    font-size: 16px;
    color: #999999;
    line-height: 24px;
    margin-bottom: 40px;
  }
  .dialog-btns {
    margin-bottom: 30px;
  }
  .dialog-btn {
    width: 120px;
  }
  .dialog-btn.cancel {
    margin-right: 4px;
  }
  .dialog-btn.send-confirm {
    width: 327px;
  }
  .login_dialog {
    .el-dialog {
      padding: 20px 40px;
    }
    .el-menu {
      border: none;
      height: 65px;
    }
    .el-menu-item {
      padding: 0;
      height: 40px;
      font-size: 20px;
      font-family: PingFang SC;
      margin: 0 15px;
      background: #fff !important;
    }
  }
  .forget-title {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    margin-bottom: 30px;
    .el-text {
      font-size: 22px;
      color: #111111;
    }
    .el-icon{
      font-size: 24px;
    }
  }
}
</style>
<style type="text/css" lang="scss">
.flex-center {
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.menu-center {
  justify-content: center;
}
.menu-title {
  font-family: "PingFang SC";
  font-weight: bold;
  font-size: 22px;
  color: #8f8f91;
  line-height: 24px;
}
.menu-title.active {
  color: #111111;
}
.phone_show{
  display: none;
}
@media screen and (max-width: 767px) {
  .pc_show{
    display: none!important;
  }
  .phone_show{
    display: inline-block!important;
  }
  .icon_user{
    font-size: 30px!important;
  }
  .logo span{
    font-size: 14px!important;
    margin-left: 10px!important;
  }
  .icon_more{
    font-size: 20px;
  }
  .btn_set{
    margin-right: 6px!important;
  }
  .logo_img{
    height: 30px!important;
  }
}
</style>