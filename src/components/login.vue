<template>
    <el-form :model="user" label-width="auto" ref="form" :show-message="false" :rules="rules">
        <el-form-item label="" required prop="email">
            <el-input v-model="user.email" placeholder="邮箱" />
        </el-form-item>
        <el-form-item label="" required prop="password">
            <el-input v-model="user.password" type="password" show-password placeholder="密码" />
        </el-form-item>
        <el-form-item label="" class="right">
            <el-text class="forget" @click="doForget">忘记密码?</el-text>
        </el-form-item>
        <el-form-item label="" class="center">
            <el-button type="primary" class="btn" color="#055CF9" @click="doLogin(form)">登录</el-button>
        </el-form-item>
    </el-form>
</template>
<script setup>
    import { ref,reactive } from 'vue'
    import {ElMessage} from 'element-plus'
    import {login} from '@/api/auth'
    import {store} from '@/store/index'
    const emit=defineEmits(['forget','success'])
    const form=reactive()
    const user=reactive({
        email:"",
        password:""
    })
    const rules=reactive({
        email: [
            { required: true, message: '请填写邮箱地址', trigger: 'blur' },
        ],
        password: [
            { required: true, message: '请填写密码', trigger: 'blur' },
        ],
    })
    function doLogin(form){
        form.validate((valid,fields)=>{
            if(valid){
                login(user).then(data=>{
                    if(data.code==0){
                        store.setToken(data.data.token)
                        store.setUsername(data.data.email)
                        store.setLevel(data.data.level)
                        emit('success')
                    }else{
                        ElMessage({
                            message:data.msg,
                            type:"error",
                        })
                    }
                }).catch((data)=>{
                    console.log(data)
                })
            }else{
                ElMessage({
                    message:fields[Object.keys(fields)[0]][0]['message'],
                    type:"error",
                })
            }
        })
    }
    function doForget(){
        emit('forget')
    }
</script>
<style type="text/css">
    .forget{
        display: inline-block;
        font-family: 'PingFang SC';
        font-weight: 400;
        font-size: 12px;
        color: #111111;
        line-height: 24px;
        cursor: pointer;
    }
    .right .el-form-item__content{
        justify-content: end;
    }
    .center .el-form-item__content{
        justify-content: center;
    }
    .btn{
        width: 327px;
    }
</style>