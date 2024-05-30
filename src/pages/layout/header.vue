<template>
    <div class="page-header">
        <el-row>
            <el-col :span="6"></el-col>
            <el-col :span="12">
                <h1 class="page-title">{{store.pTitle}}</h1>
            </el-col>
            <el-col :span="6" class="flex-center">
                <template v-if="store.token">
                    <div class="flex-center">
                        <el-text>{{store.level}}</el-text>
                        &nbsp;&nbsp;
                        <el-button @click="changeVisible=true">修改密码</el-button>
                        &nbsp;&nbsp;
                        <el-icon><SwitchButton @click="logoutVisible=!logoutVisible" /></el-icon>
                    </div>
                </template>
                <template v-else>
                    <el-button @click="authVisible=!authVisible">登录</el-button>
                </template>
            </el-col>
        </el-row>
        <el-dialog v-model="authVisible" center width="410px" :show-close="false" style="border-radius: 10px;">
            <template #header="{close,titleId,titleClass}">
                <el-menu :default-active="activeIndex" mode="horizontal" class="menu-center" @select="menuSelect" text-color="#8F8F91" active-text-color="#111111">
                    <el-menu-item index="1" class="menu-title">登陆</el-menu-item>
                    <el-menu-item index="2" class="menu-title">注册</el-menu-item>
                </el-menu>
            </template>
            <template v-if="activeIndex==1">
                <login @forget="forgetPwd" @success="loginSuccess"></login>
            </template>
            <template v-else>
                <register> @success="registerSuccess"</register>
            </template>
        </el-dialog>
        <el-dialog v-model="forgetVisible" center width="410px" :show-close="false" style="border-radius: 10px;">
            <template #header="{close,titleId,titleClass}">
                <h1 :class="titleClass" class="forget-title">
                    <el-icon style="cursor: pointer;" @click="backToAuth"><Back /></el-icon>    
                    <el-text>重置密码</el-text>
                    <div style="display: inline-block;"></div>
                </h1>
            </template>
            <forget @return="backToAuth" @success="forgetSuccess"></forget>
        </el-dialog>
        <el-dialog v-model="changeVisible" title="修改密码" center width="410px" :show-close="false" style="border-radius: 10px;">
            <change @success="changeSuccess"></change>
        </el-dialog>
        <el-dialog v-model="logoutVisible" title="" center :show-close="false" width="410px" heigt="240px" style="border-radius: 10px;">
            <div class="dialog-container">
                <h1 class="dialog-title">退出登录</h1>
                <div class="dialog-content">你确定要退出登录</div>
                <div class="dialog-btns">
                    <el-button class="dialog-btn cancel" @click="logoutVisible=false">取消</el-button>
                    <el-button class="dialog-btn confirm" type="primary" @click="confirmLogout">确认</el-button>
                </div>
            </div>
        </el-dialog>
        <el-dialog v-model="resetSuccessVisible" title="" center :show-close="false" width="410px" heigt="240px" style="border-radius: 10px;">
            <div class="dialog-container">
                <img src="@assets/reset_success.png" style="width:128px;" />
                <div class="dialog-content">重置密码成功！</div>
                <div class="dialog-btns">
                    <el-button class="dialog-btn send-confirm" color="#055CF9" @click="resetSuccessVisible=false">确认</el-button>
                </div>
            </div>
        </el-dialog>
        <el-dialog v-model="registerSuccessVisible" title="" center :show-close="false" width="410px" heigt="240px" style="border-radius: 10px;">
            <div class="dialog-container">
                <img src="@assets/reset_success.png" style="width:128px;" />
                <div class="dialog-content">您已注册成功！</div>
                <div class="dialog-btns">
                    <el-button class="dialog-btn send-confirm" color="#055CF9" @click="registerSuccessVisible=false">确认</el-button>
                </div>
            </div>
        </el-dialog>
    </div>
</template>
<script setup>
    import {store} from '@/store/index'
    import login from '@/components/login.vue'
    import register from '@/components/register.vue'
    import forget from '@/components/forget.vue'
    import change from '@/components/change.vue'
    import {ref,provide,watch,defineProps,defineEmits} from 'vue'
    const props=defineProps({
        title:String,
        authDialog:Boolean,
    })
    const emit=defineEmits(['close-auth-dialog'])
    const authVisible=ref(false)
    const logoutVisible=ref(false)
    const forgetVisible=ref(false)
    const changeVisible=ref(false)
    const resetSuccessVisible=ref(false)
    const registerSuccessVisible=ref(false)
    const activeIndex=ref("1")

    watch(()=>props.authDialog, (n,o)=>{
        authVisible.value=n
    })

    watch(authVisible,(n,o)=>{
        if(!n){
            emit('close-auth-dialog')
        }
    })

    function menuSelect(index){
        activeIndex.value=index
    }

    function forgetPwd(){
        authVisible.value=false
        forgetVisible.value=true
    }

    function backToAuth(){
        authVisible.value=true
        forgetVisible.value=false
        activeIndex.value=1
    }
    function cancelLogout(){
        logoutVisible.value=false
    }
    function confirmLogout(){
        store.setToken("")
        logoutVisible.value=false
    }
    function loginSuccess(){
        authVisible.value=false
    }
    function registerSuccess(){
        authVisible.value=false
    }
    function forgetSuccess(){
        forgetVisible.value=false
        authVisible.value=true
    }
    function changeSuccess(){
        changeVisible.value=false
    }


</script>
<style type="text/css">
    .flex-center{
        display: flex;
        align-items: center;
        justify-content: space-around;
    }
    .menu-center{
        justify-content: center;
    }
    .menu-title{
        font-family: 'PingFang SC';
        font-weight: bold;
        font-size: 22px;
        color: #8F8F91;
        line-height: 24px;
    }
    .menu-title.active{
        color: #111111;
    }
    .forget-title{
        display: flex;
        justify-content: space-between;
    }
    .dialog-container{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    .dialog-title{
        font-weight: bold;
        font-size: 20px;
        color: #111111;
        line-height: 24px;
    }
    .dialog-content{
        font-family: 'PingFang SC';
        font-weight: 400;
        font-size: 16px;
        color: #999999;
        line-height: 24px;
        margin-bottom: 40px;
        margin-top: 27px;
    }
    .dialog-btn{
        width: 120px;
    }
    .dialog-btn.cancel{
        margin-right: 12px;
    }
    .dialog-btn.send-confirm{
        width: 327px;
    }
</style>