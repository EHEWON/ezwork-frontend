<template>
    <div>
        <div class="container">
            <div class="blank"></div>
            <div class="left">
                <div class="upload-container">
                    <el-upload class="dropzone" drag multiple :action="upload_url" accept=".docx,.xlsx,.pptx,.pdf" auto-upload :limit="5" :on-change="changeFile" :on-success="uploadSuccess" :headers="uploadHeader" :before-upload="beforeUpload" :before-remove="delUploadFile">
                        <template #tip>
                            仅支持word、excel、ppt相关格式，文件大小≤10mb
                        </template>
                        <template #default :uploaded="uploaded">
                            <div class="has-upload" v-if="uploaded">
                                <img :src="uploadedPng" />
                                <div class="upload-success">文件上传成功</div>
                                <div class="upload-filename"></div>
                                <small class="re-upload">点击或拖拽重新上传</small>
                            </div>
                            <div class="wait-upload" v-else>
                                <button class="upload_btn" id="upload_btn" type="button">
                                    <span></span>
                                    <img :src="uploadPng" />
                                    <span>上传文档</span>
                                    <span></span>
                                </button>
                            </div>
                        </template>
                    </el-upload>
                </div>
                <div class="form-container">
                    <el-form ref="transform" :model="form" label-width="auto" :show-message="false" :rules="rules">
                        <el-form-item label="" required prop="files">
                            <el-input type="hidden" v-model="form.files"></el-input>
                        </el-form-item>
                        <el-form-item label="服务商" required prop="server">
                            <el-select v-model="form.server" placeholder="请选择服务商" disabled @change="saveValue">
                                <el-option value="openai" label="OpenAI"></el-option>
                                <el-option value="member" label="EZ-work 会员"></el-option>
                            </el-select>
                        </el-form-item>
                        <template v-if="form.server=='openai'">
                            <el-form-item label="接口地址" required prop="api_url">
                                <el-input v-model="form.api_url" placeholder="请输入接口（base_url）地址"></el-input>
                            </el-form-item>
                            <el-form-item label="API Key" required prop="api_key">
                                <el-input v-model="form.api_key" placeholder="请输入OpenAI的API KEY" show-password>></el-input>
                            </el-form-item>
                        </template>
                        <el-form-item label="模型" required prop="model">
                            <el-select v-model="form.model" placeholder="请选择或自定义OpenAI模型" clearable filterable allow-create>
                                <el-option v-for="model in models" :key="model" :name="model" :value="model"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="翻译语言" required prop="langs">
                            <el-select v-model="form.langs" placeholder="请选择或自定义翻译语言" clearable filterable allow-create :multiple="langMultiSelected" :multiple-limit="5">
                                <el-option v-for="lang in langs" :key="lang" :name="lang" :value="lang"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="译文形式" required prop="type">
                            <el-select v-model="form.type" placeholder="请选择译文形式">
                                <el-option value="translation" label="仅译文"></el-option>
                                <el-option value="both" label="原文+译文"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="提示语" required prop="system">
                            <el-input v-model="form.system" autosize type="textarea" :rows="3" placeholder="请输入系统翻译提示词"></el-input>
                        </el-form-item>
                        <el-form-item label="线程数" required>
                            <el-input-number style="width:100%" :min="10" :max="40" v-model="form.threads" :controls="false" placeholder="注意：高线程≥10虽可以缩短翻译时长，但服务器负载较高，易引发异常，请谨慎使用！"></el-input-number>
                        </el-form-item>
                        <div class="center form-btns">
                            <!-- <div class="check-container">
                                <el-button type="text" @click="check" :loading="checking">{{check_text}}</el-button>
                            </div> -->
                            <el-button type="primary" size="large" color="#055CF9" class="translate-btn" @click="translate(transform,'pc')">立即翻译</el-button>
                        </div>
                    </el-form>
                </div>
            </div>
            <div class="right">
                <div class="translated-container">
                    <div class="translated-header">
                        <h2>翻译任务列表</h2>
                        <span class="storage">存储空间({{storageTotal}}M)</span>
                        <el-progress class="translated-process" :percentage="storagePercentage" />
                    </div>
                    <el-table :data="translatesData" fit flexible>
                        <el-table-column prop="origin_filename" label="文档名称" />
                        <el-table-column prop="status_name" label="任务状态" />
                        <el-table-column label="操作">
                            <template #default="scope">
                                <el-icon v-if="scope.row.status=='done'"  style="margin-right: 21px;cursor: pointer;">
                                    <el-link :href="API_URL+scope.row.target_filepath" target="_blank">
                                        <Download />
                                    </el-link>
                                </el-icon>
                                <el-icon style="cursor: pointer;"><Close @click="delTransFile(scope.row.id)" /></el-icon>
                              </template>
                        </el-table-column>
                    </el-table>
                    <div style="margin-top: 10px;display: flex;justify-content: space-between;">
                        <el-pagination layout="prev, pager, next" :total="translatesTotal" :page-size="translatesLimit" @current-change="getTranslatesData" />
                        <el-button type="danger" text plain link @click="delAllTransFile">删除全部</el-button>
                    </div>
                </div>
                <div class="download-container">
                    <el-card v-for="res in result" class="translate-card">
                        <template #header>
                          <div class="card-header">
                            <span>{{res.file_name}} ({{res.lang}})</span>
                          </div>
                        </template>
                        <el-progress :percentage="res['percentage']" :text-inside="true" :stroke-width="15" status="success"></el-progress>
                        <template #footer>
                            <el-link :disabled="res['disabled']" target="_blank" type="primary" :href="res['link']">下载</el-link>
                        </template>
                    </el-card>
                </div>
            </div>
            <div class="blank"></div>
        </div>
        <div class="static center form-btns hide">
            <div class="check-container">
                <el-button type="text" @click="check" :loading="checking">{{check_text}}</el-button>
            </div>
            <el-button type="primary" color="#055CF9" class="translate-btn" size="large" @click="translate(transform,'mobile')">立即翻译</el-button>
        </div>
        <el-dialog v-model="translateDialog" width="80%" modal append-to-body title="翻译">
            <div class="translate-container">
                <el-card v-for="res in result" class="translate-card">
                    <template #header>
                      <div class="card-header">
                        <span>{{res.file_name}} ({{res.lang}})</span>
                      </div>
                    </template>
                    <el-progress :percentage="res['percentage']" :text-inside="true" :stroke-width="15" status="success"></el-progress>
                    <template #footer>
                        <el-link :disabled="res['disabled']" target="_blank" type="primary" :href="res['link']">下载</el-link>
                    </template>
                </el-card>
            </div>
        </el-dialog>
    </div>
</template>
<script setup>
    import {reactive,ref,computed,watch,inject,defineEmits,onMounted} from 'vue'
    const API_URL=import.meta.env.VITE_API_URL
    import { checkOpenAI,transalteFile,transalteProcess,delFile,translates,delTranslate,delAllTranslate } from '@/api/trans'
    import {storage} from '@/api/account'
    import uploadedPng from '@assets/uploaded.png'
    import uploadPng from '@assets/upload.png'
    import loadingPng from '@assets/loading.gif'
    import finishPng from '@assets/finish.png'
    import completedPng from '@assets/completed.png'
    import {store} from '@/store'
    import {ElMessage,ElMessageBox} from 'element-plus'

    const uploaded=ref(false)
    const translated=ref(false)
    const checking=ref(false)
    const translateDialog=ref(false)
    const langMultiSelected=ref(true)

    const translating={}
    const result=ref({})
    const target_count=ref("")
    const target_time=ref("")
    const target_url=ref("")
    const check_text=ref("检查")
    const upload_url=API_URL+"/api/upload"

    const translatesData=ref([]);
    const translatesTotal=ref(0);
    const translatesLimit=ref(10);
    const storageTotal=ref(0);
    const storageUsed=ref(0);
    const storagePercentage=ref(0.0);

    const transform=ref(null)

    const uploadHeader=ref({token:store.token})

    const emit=defineEmits(['should-auth'])

    const form=ref({
        files:[],
        server:store.level=='vip' ? 'member' : 'openai',
        api_url:localStorage.getItem("api_url") || "https://api.openai.com",
        api_key:localStorage.getItem("api_key") || "",
        model:localStorage.getItem("model") || "gpt-3.5-turbo-0125",
        langs:localStorage.getItem("langs") ? JSON.parse(localStorage.getItem("langs")) : [],
        lang:"",
        type:localStorage.getItem("type") || "translation",
        uuid:"",
        system:localStorage.getItem("system") || "你是一个文档翻译助手，请将以下文本翻译成{target_lang}，如果文本中包含{target_lang}文本、特殊名词（比如邮箱、品牌名、单位名词如mm、px、℃等）、无法翻译等特殊情况，请直接返回原文而无需解释原因。保留多余空格。",
        threads:localStorage.getItem("threads") || 10,
    })

    const models=['gpt-3.5-turbo-0125','gpt-4-1106-preview','gpt-4-0125-preview']
    const langs=['中文','英语','日语','俄语','阿拉伯语','西班牙语']

    const rules={
        files: [
            { required: true, message: '请上传文件', trigger: 'blur' },
        ],
        server: [
            { required: true, message: '请选择供应商', trigger: 'blur' },
        ],
        type: [
            { required: true, message: '请选择译文形式', trigger: 'blur' },
        ],
        model: [
            { required: true, message: '请选择模型', trigger: 'blur' },
        ],
        langs: [
            { required: true, message: '请选择翻译目标语言', trigger: 'blur' },
        ],
        system: [
            { required: true, message: '请填写系统提示语', trigger: 'blur' },
        ]
    }

    const target_tip=computed(()=>{
        return "翻译完成！共计翻译"+this.target_count+"字数，"+this.target_time
    })

    watch(form,async(o,n)=>{
        console.log(n)
        if(n){
            console.log(n.files)
            localStorage.setItem("server", n.server)
            localStorage.setItem("api_url", n.api_url)
            localStorage.setItem("api_key", n.api_key)
            localStorage.setItem("model", n.model)
            localStorage.setItem("langs", JSON.stringify(n.langs))
            localStorage.setItem("type", n.type)
            localStorage.setItem("system", n.system)
            localStorage.setItem("threads", n.threads)
            if(n.files.length>1){
                langMultiSelected.value=false
            }else{
                langMultiSelected.value=true
            }
        }
    },{ deep: true })

    watch(()=>store.level, (n,o)=>{
        if(n=='vip'){
            form.value.server='member'
        }else{
            form.value.server='openai'
        }
    })

    onMounted(()=>{
        getTranslatesData(1)
        storage().then(data=>{
            if(data.code==0){
                storageTotal.value=data.data.storage
                storageUsed.value=data.data.used
                storagePercentage.value=data.data.percentage
            }
        })
    })

    function check(){
        checking.value=true
        check_text.value="检查中..."
        checkOpenAI(form.value).then(data=>{
            checking.value=false
            if(data.code==0){
                check_text.value="成功"
            }else{
                check_text.value="失败"
            }
            
        }).catch(err=>{
            checking.value=false
            check_text.value="失败"
        })
    }

    function translate(transform, source){
        if(!store.token){
            emit('should-auth')
            return
        }
        transform.validate((valid,messages) => {
            if(valid){
                if(source=="mobile"){
                    translateDialog.value=true
                }
                let langs=[]
                if(!Array.isArray(form.value.langs)){
                    langs=[form.value.langs]
                }else{
                    langs=form.value.langs
                }
                result.value={}
                form.value.files.forEach(file=>{
                    form.value.file_name=file.file_name
                    form.value.file_path=file.file_path
                    langs.forEach(lang=>{
                        form.value.lang=lang
                        let uuid=file.uuid+"-"+lang
                        form.value.uuid=uuid
                        translating[uuid]=true
                        console.log(translating)
                        process(uuid,source)
                        result.value[uuid]={
                            file_name:file.file_name,
                            file_path:file.file_path,
                            uuid:uuid,
                            lang:lang,
                            percentage:0, 
                            disabled:true,
                            link:''
                        }
                        transalteFile(form.value).then(data=>{
                            // translating[uuid]=false
                            // if(data.code==0){
                            //     translated.value=true
                            //     target_url.value=API_URL+data.data.url
                            //     target_count.value=data.data.count
                            //     target_time.value=data.data.time
                            //     result.value[uuid]['link']=API_URL+data.data.url
                            //     result.value[uuid]['disabled']=false
                            //     result.value[uuid]['percentage']=100
                            // }else{
                            //     ElMessage({
                            //         message:data.msg,
                            //         type:"error",
                            //     })
                            // }
                        }).catch(data=>{
                            translating[uuid]=false
                        })
                    })
                    
                })
            }else{
                for(var field in messages){
                    messages[field].forEach(message=>{
                        ElMessage({
                            message:message['message'],
                            type:"error",
                        })
                    })
                }
            }
           
        })
    }

    function process(uuid,source){
        console.log(translating)
        console.log(uuid)
        if(!translating[uuid]){
            return
        }
        transalteProcess({uuid}).then(data=>{
            if(data.data.process==1){
                if(source=="mobile"){
                    translateDialog.value=true                            
                }
                // Reflect.set(translating, uuid, false)
                translating[uuid]=false
                translated.value=true
                target_url.value=API_URL+data.data.url
                target_count.value=data.data.count
                target_time.value=data.data.time
                result.value[uuid]['link']=API_URL+data.data.url
                result.value[uuid]['disabled']=false
            }else{
                setTimeout(()=>process(uuid,source), 1000)
            }
            if(data.data.process!=""){
                result.value[uuid]['percentage']=(parseFloat(data.data.process)*100).toFixed(1)
            }
            console.log(result)
        })
    }

    function changeFile(){
        uploaded.value=false
    }

    function beforeUpload(){
        if(!store.token){
            emit('should-auth')
            return false
        }
    }

    function uploadSuccess(data){
        if(data.code==0){
            form.value.files.push({
                file_path:data.data.filepath,
                file_name:data.data.filename,
                uuid:data.data.uuid
            })
            uploaded.value=true
        }else{
            ElMessage({
                message:data.msg,
                type:"error",
            })
        }
    }

    function delUploadFile(file, files){
        let filepath=''
        form.value.files.forEach((item,index)=>{
            if(item.file_name==file.name){
                filepath=item.file_path
                form.value.files.splice(index,1)
            }
        })
        delFile(filepath)
        console.log(result.value)
        for(let uuid in result.value){

            if(result.value[uuid]['file_name']==file.name){
                delete result.value[uuid]
            }
        }
    }

    function getTranslatesData(page){
        translates({page,limit:translatesLimit.value}).then(data=>{
            if(data.code==0){
                console.log(data.data.data)
                translatesData.value=data.data.data
                translatesTotal.value=data.data.total
            }
        })
    }

    function delTransFile(id){
        ElMessageBox.confirm('是否确定要删除？','Warning',{
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }).then(() => {
            delTranslate(id).then((data)=>{
                if(data.code==0){
                    translatesData.value=translatesData.value.filter(item=>item.id!=id)
                }
            })
        })
    }

    function delAllTransFile(){
        ElMessageBox.confirm('是否确定要删除全部？','Warning',{
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }).then(() => {
            delAllTranslate().then((data)=>{
                if(data.code==0){
                    translatesData.value=[]
                }
            })
        })
    }

    store.setTitle("EZ-work AI文档翻译")

</script>
<style type="text/css">
    .form-container .el-input-number .el-input__inner{
        text-align: left;
    }
</style>
<style type="text/css">
    .page-title{
        margin-top: 15px;
        margin-bottom: 20px;
        font-size: 24px;
        font-weight: bold;
        font-family: "PingFang-SC-Bold";
        text-align: center;
    }
    .container{
        display: flex;
        align-self: center;
        flex-wrap: wrap;
        margin:8px;
    }
    .left,.right{
        flex: 1 1;
    }
    .container .blank{
        flex: auto 0;
        width: 10%;
    }
    .dropzone {
        width: calc(100% - 48px);
        height: calc(100% - 48px);
        border-radius: 12px;
        display: flex;
        align-items: center;
        flex-direction: column;
    }
    .dropzone .el-upload{
        margin-bottom: 8px;
    }
    .dropzone .el-upload,.dropzone .el-upload-dragger{
        width: 100%;
        height: 100%;
        background-color: #F5F6FA;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .center{
        text-align: center;
    }
    .hide{
        display: none;
    }
    .upload-container,.form-container,.download-container{
        border: 1px solid gray;
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        border: 1px solid #E0E4F7;
        background-color: #FFFFFF;
        border-radius: 12px;
        min-width: 300px;
    }
    .upload-container{
        text-align: center;
        overflow: auto;
    }
    .upload-container{
        height: 260px;
    }
    .translated-container{
        border: 1px solid gray;
        border: 1px solid #E0E4F7;
        background-color: #FFFFFF;
        border-radius: 12px;
        min-width: 300px;
        height: 380px;
        margin-bottom: 16px;
        padding: 20px;
        overflow: auto;
    }
    .form-container{
        height: 500px;
        overflow: auto;
        margin-top: 20px;
        margin-bottom: 20px;
    }
    .upload-container{
        margin-bottom: 16px;
    }
    .upload-container,.form-container{
        margin-right: 16px;
    }
    .download-container{
        height: 368px;
        text-align: center;
        overflow: auto;
    }
    .form-container form{
        width: calc(100% - 48px);
        height: 100%;
    }
    .item-container{
        line-height: 50px;
        display: flex;
        flex-direction: row;
        margin-bottom: 16px;
    }
    .item-container .required{
        color: #FF0000;
        font-size: 14px;
    }
    .item-container > span{
        flex: atuo 0;
        font-size: 14px;
        font-family: "PingFang SC";
        font-weight: 400;
        color: #111111;
        line-height: 38px;
    }
    /*.item-container select,.item-container input, .item-container textarea{
        flex: auto 1;
        border: 1px solid #DCDEE2;
    }*/
    #file_upload{
        display: none;
    }
    .translated img, .translate-loading img{
        width: 80px;
        height: 80px;
    }
    .translate-btn {
        line-height: 36px;
        width: 180px;
        color: white;
        border: none;
        background: #055CF9;
        border-radius: 4px;
        cursor: pointer;
    }
    .wait-upload .upload_tip{
        margin-top: 36px;
        margin-bottom: 10px;
        color: #333333;
        font-size: 16px;
        font-weight: 400;
    }
    .wait-upload span{
        color: #666666;
        font-size: 14px;
        font-weight: 400;
    }
    .upload-success{
        font-family: "PingFang SC";
        font-weight: bold;
        font-size: 16px;
        color: #333333;
    }
    .upload-filename{
        font-family: "PingFang SC";
        font-weight: 400;
        font-size: 14px;
        color: #055CF9;
        margin-bottom: 13px;
        margin-top: 23px;
    }
    .re-upload{
        font-family: "PingFang SC";
        font-weight: 400;
        font-size: 12px;
        color: #666666;
    }
    .download-button{
        line-height: 36px;
        width: 120px;
        display: inline-block;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        background: #055CF9;
    }
    #upload_btn{
        font-family: "PingFang SC";
        width: 180px;
        height: 40px;
        background-color: #F4F8FF;
        border: 1px dashed #055CF9;
        flex-direction: row;
        align-items: center;
        display: inline-flex;
        text-align: center;
    }
    #upload_btn img{
        width: 20px;
        height: 20px;
        margin-right: 9px;
        flex: auto 0;
    }
    #upload_btn span:first-child, #upload_btn span:last-child{
        flex: auto 1;
    }
    #upload_btn span{
        font-size: 16px;
        font-family: "PingFang SC";
        font-weight: bold;
        color: #055CF9;
    }
    .translate_btn{
        line-height: 36px;
        width: 180px;
        color: white;
        border: none;
        background: #055CF9;
        border-radius: 4px;
        cursor: pointer;
        margin-bottom: 20px;
    }
    /*form input,form select,form textarea{
        line-height: 32px;
        width: 220px;
        height: 32px;
        padding: 2px;
        font-size: 14.6px;
        padding-left: 16px;
    }
    form select{
        height: 38px;
    }
    form select:after{
        padding-right: 10px;
    }
    textarea.system{
        height: 120px;
    }*/
    .item-container > span{
        display: inline-block;
        width: 80px;
    }
    .dropzone form{
        width: 100%;
    }
    .model-custom{
        display: none;
    }
    .process-bar{
        width: 240px;
        height: 8px;
        background: #EFEFEF;
        border-radius: 4px;
        position: relative;
    }
    .process-bar > span{
        height: 8px;
        background: #055CF9;
        border-radius: 4px;
        position: absolute;
        top: 0;
        left: 0;
    }
    .process-tip{
        font-size: 16px;
        font-family: "PingFang SC";
        font-weight: 400;
        color: #055CF9;
    }
    .completed-text{
        margin-top: 8px;
        margin-bottom: 20px;
    }
    .form-btns{
        position: relative;
        padding-bottom: 15px;
    }
    .check-container{
        position: absolute;
        left: 12px;
        display: flex;
        justify-content: center;
        flex-direction: row;
        align-items: center;
        height: calc(100% - 20px);
    }
    .check_btn{
        border: none;
        background: transparent;
        cursor: pointer;
        line-height: 36px;
        font-size: 14px;
        color: #055CF9;
        text-decoration-line: underline;
    }
    .check-status{
        font-size: 12px;
        width: 44px;
        height: 24px;
        border-radius: 4px;
        font-weight: 400;
        display: inline-block;
        line-height: 24px;
    }
    .check-status.success{
        color: #52C41A;
        border: 1px solid #A7E1A9;

    }
    .check-status.fail{
        background: #FFF2F0;
        border: 1px solid #FFCCC7;
        color: #FF4D4F;
    }
    .check-loading{
        display: none;
        width: 21px;
        height: 21px;
    }
    .api-key-container{
        position: relative;
    }
    .api-key-container img{
        position: absolute;
        right: 8px;
        width: 16px;
        height: 12px;
        margin-top: 12px;
    }
    .translate-container{
        text-align: center;
    }
    .translate-card{
        width: calc(100% - 30px);
        margin-bottom: 10px;
        margin-left: 15px;
        margin-right: 15px;
    }
    .translated-header{
        display: flex;
        align-items: center;
    }
    .translated-header h2{
        margin-right: 30px;
        display: inline-block;
        font-family: 'PingFang SC';
        font-weight: bold;
        font-size: 16px;
        color: #000000;
    }
    .translated-header .storage{
        margin-right: 30px;
    }
    .translated-process{
        width:300px;
        display: inline-block;
    }
    @media screen and (max-width:800px){
        .container .blank{
            width: 0%;
        }
        .upload-container, .form-container{
            margin-right: 0px;
            overflow:visible;
        }
        .form-container{
            height: auto;
            padding-top: 30px;
            padding-bottom: 30px;
            margin-bottom: 77px;
        }
        .form-container .form-btns{
            display: none;
        }
        .static.form-btns{
            display: inline-block;
            display: inline-block;
            position: fixed;
            bottom: 0;
            width: 100vw;
            text-align: center;
            background-color: #FFFFFF;
            padding: 16px 0;
        }
        .static .translate_btn{
            margin-bottom:0px;
        }
        .right{
            display: none;
        }
    }
</style>
