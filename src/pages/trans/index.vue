<template>
  <div class="page-center">
    <div class="container">
      <div class="upload-container">
        <el-upload ref="uploadRef" class="dropzone" drag multiple :action="upload_url" :accept="accepts" auto-upload :limit="5" :on-success="uploadSuccess" :on-error="uploadError" :headers="{token:store.token}" :before-upload="beforeUpload" :before-remove="delUploadFile" :on-change="(file,fileList) => flhandleFileListChange(file,fileList)">
          <div class="left_box pc_show">
            <div class="icon_box" v-if="!fileListShow">
              <img src="@/assets/icon_a.png" />
              <img src="@/assets/icon_w.png" />
              <img src="@/assets/icon_p.png" />
              <img src="@/assets/icon_x.png" />
            </div>
          </div>
          <div class="right_box">
            <div class="title pc_show">拖入/点击按钮选择添加文档</div>
            <button class="upload_btn" type="button">
              <img :src="uploadPng" />
              <span>上传文档</span>
            </button>
            <div class="title phone_show">点击按钮选择添加文档</div>
            <div class="tips">支持格式{{accpet_tip}}，文件≤10MB</div>
          </div>
        </el-upload>
      </div>

      <div class="list_box">
        <div class="title_box">
          <div class="t">翻译任务列表 <el-button type="text" class="phone_show" @click="delAllTransFile" v-if="translatesData.length > 0">全部删除</el-button></div>
          <div class="t_right">
            <span class="storage">存储空间({{storageTotal}}M)</span>
            <el-progress class="translated-process" :percentage="storagePercentage" color='#055CF9'/>
            <!--<el-button class="all_down" v-if="translatesData.length > 0">全部下载</el-button>-->
            <el-button class="pc_show" @click="delAllTransFile" v-if="translatesData.length > 0">全部删除</el-button>
          </div>
        </div>
        <div class="table_box">
          <div class="table_row table_top pc_show">
            <div class="table_li">文档名称</div>
            <div class="table_li">任务状态</div>
            <div class="table_li">用时</div>
            <div class="table_li">完成时间</div>
            <div class="table_li">操作</div>
          </div>
          <div class="table_row phone_row" v-for="(res,index) in result" :key="index">
            <div class="table_li">
              <img v-if="res.file_type == 'pptx'" src="@assets/PPT.png" alt="">
              <img v-else-if="res.file_type == 'docx'" src="@assets/DOC.png" alt="">
              <img v-else-if="res.file_type == 'xlsx'" src="@assets/Excel.png" alt="">
              <img v-else src="@assets/PDF.png" alt="">
              <span class="file_name">{{res.file_name}}</span>
            </div>
            <div class="table_li status">
              <el-progress class="translated-process" :percentage="res['percentage']"  color='#055CF9'>
                <template #default="{ percentage }">
                  <span class="percentage">{{percentage}}%</span>
                </template>
              </el-progress>
              <img src="@assets/waring.png" alt="">
              <span class="process">翻译中</span>
            </div>
            <div class="table_li pc_show">--</div>
            <div class="table_li pc_show">--</div>
            <div class="table_li pc_show">
              <el-icon class="icon_down">
                <Download />
              </el-icon>
            </div>
          </div>

          <div class="table_row phone_row" v-for="(item,index) in translatesData" :key="index">
            <div class="table_li">
              <img v-if="item.file_type == 'pptx'" src="@assets/PPT.png" alt="">
              <img v-else-if="item.file_type == 'docx'" src="@assets/DOC.png" alt="">
              <img v-else-if="item.file_type == 'xlsx'" src="@assets/Excel.png" alt="">
              <img v-else src="@assets/PDF.png" alt="">
              <span class="file_name">{{item.origin_filename}}</span>
            </div>
            <div :class="item.status=='done'?'pc_show table_li status':'table_li status'">
              <el-progress class="translated-process" :percentage="item.process"  color='#055CF9'/>
              <img v-if="item.status == 'done'" src="@assets/success.png" alt="">
              <img v-if="item.status == 'process'" src="@assets/waring.png" alt="">
              <img v-if="item.status == 'failed'" src="@assets/error.png" alt="">
              <span :class="item.status">{{item.status_name}}</span>
            </div>
            <div :class="item.status=='done'?'table_li':'table_li pc_show'"><span class="phone_show">用时:</span>{{item.spend_time?item.spend_time:'--'}}</div>
            <div :class="item.status=='done'?'table_li':'table_li pc_show'"><span class="phone_show">完成时间:</span>{{item.end_at?item.end_at:'--'}}</div>
            <div class="table_li">
              <el-icon class="icon_down active" v-if="item.status=='done'">
                <el-link :href="API_URL+item.target_filepath" target="_blank">
                  <Download />
                </el-link>
              </el-icon>
              <el-icon v-else class="icon_down">
                <Download />
              </el-icon>
              <el-icon style="cursor: pointer;">
                <Close @click="delTransFile(item.id)" />
              </el-icon>
            </div>
          </div>
          <div v-if="no_data" class="table_row no_data" style="border:none;padding-top:15px;justify-content: center;color:#C4C4C4;">
            暂无数据
          </div>
        </div>
      </div>
    </div>

    <!-- 新版翻译设置pc -->
    <el-dialog v-model="formSetShow" title="翻译设置" width="90%" modal-class="custom_dialog" @close="formCancel">
      <el-form ref="transformRef" :model="formSet" label-width="100px" :rules="rules">
        <el-form-item label="服务商" required prop="server" width="100%">
          <el-select v-model="formSet.server" placeholder="请选择服务商" disabled @change="saveValue">
            <el-option value="openai" label="OpenAI"></el-option>
            <el-option value="member" label="EZ-work 会员"></el-option>
          </el-select>
        </el-form-item>
        <template v-if="formSet.server=='openai'">
          <el-form-item label="接口地址" required prop="api_url" width="100%">
            <el-input v-model="formSet.api_url" placeholder="请输入接口（base_url）地址"></el-input>
          </el-form-item>
          <el-form-item label="API Key" required prop="api_key" width="100%">
            <el-input v-model="formSet.api_key" placeholder="请输入OpenAI的API KEY" show-password>></el-input>
          </el-form-item>
        </template>
        <el-form-item label="模型" required prop="model" width="100%">
          <el-select v-model="formSet.model" placeholder="请选择或自定义OpenAI模型" clearable filterable allow-create>
            <el-option v-for="model in models" :key="model" :name="model" :value="model"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备用模型" prop="backup_model" width="100%">
          <el-select v-model="formSet.backup_model" placeholder="备用模型在翻译模型不可用时自动切换并继续完成翻译。" clearable filterable allow-create>
            <el-option v-for="model in models" :disabled="form.model==model ? true :false" :key="model" :name="model" :value="model"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="翻译语言" required prop="langs" width="100%">
          <div class="language-selection">
            <template v-if="formSet.scanned">
              <el-select v-model="formSet.origin_lang" placeholder="请选择起始语言" class="lang-select">
                <el-option v-for="lang in languageOptions" :key="lang.value" :label="lang.label" :value="lang.value"></el-option>
              </el-select>
              <div class="conversion-symbol">→</div>
            </template>
            <el-select v-model="formSet.langs" placeholder="请选择或自定义翻译语言" clearable filterable allow-create :multiple="langMultiSelected" :multiple-limit="langMultipleLimit" class="lang-select">
              <el-option v-for="lang in langs" :key="lang" :name="lang" :value="lang"></el-option>
            </el-select>
          </div>
        </el-form-item>
        <el-form-item label="译文形式" required prop="type" width="100%">
          <el-cascader class="type-cascader" placeholder="请选择译文形式" v-model="formSet.type" :options="types" clearable :props="{ expandTrigger: 'hover' }" style="width:100%;">
          </el-cascader>
        </el-form-item>
        <!-- <el-form-item label="译文形式" required prop="type">
            <el-select v-model="form.type" placeholder="请选择译文形式">
                <el-option value="translation" label="仅译文"></el-option>
                <el-option value="both" label="原文+译文"></el-option>
            </el-select>
        </el-form-item> -->
        <el-form-item label="提示语" required prop="prompt" width="100%">
          <el-input v-model="formSet.prompt" autosize type="textarea" :rows="3" resize="none" placeholder="请输入系统翻译提示词"></el-input>
        </el-form-item>
        <el-form-item label="线程数" required prop="threads" width="100%">
          <el-input-number style="width:100%" :min="10" :max="40" v-model="formSet.threads" :controls="false" placeholder="注意：高线程≥10虽可以缩短翻译时长，但服务器负载较高，易引发异常，请谨慎使用！"></el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="btn_box">
          <div class="btn_check">
            <el-button type="text" @click="check" :loading="checking">{{check_text}}</el-button>
          </div>
          <el-button @click="formCancel">取消</el-button>
          <el-button type="primary" color="#055CF9" @click="formConfim(transformRef)">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- pc 立即翻译按钮 -->
    <div class="fixed_bottom">
      <el-button type="primary" size="large" color="#055CF9" class="translate-btn" @click="translate(transform,'pc')">立即翻译</el-button>
    </div>
  </div>
</template>
<script setup>
import { reactive, ref, computed, watch, inject, defineEmits, onMounted } from 'vue'
const API_URL = import.meta.env.VITE_API_URL
import { checkOpenAI, checkPdf, transalteFile, transalteProcess, delFile, translates, delTranslate, delAllTranslate, translateSetting } from '@/api/trans'
import { storage } from '@/api/account'
import uploadedPng from '@assets/uploaded.png'
import uploadPng from '@assets/upload.png'
import loadingPng from '@assets/loading.gif'
import finishPng from '@assets/finish.png'
import completedPng from '@assets/completed.png'
import { store } from '@/store'
import { ElMessage, ElMessageBox } from 'element-plus'
import hash from 'object-hash'

const props = defineProps({
  setShow: Boolean,
})

const uploaded = ref(false)
const translated = ref(false)
const checking = ref(false)
const translateDialog = ref(false)
const langMultiSelected = ref(true)
const formSetShow = ref(false);
const no_data = ref(true)

const accepts = ".docx,.xlsx,.pptx,.pdf"
const fileListShow = ref(false)
const translating = {}
const result = ref({})
const target_count = ref("")
const target_time = ref("")
const target_url = ref("")
const check_text = ref("检查")
const upload_url = API_URL + "/api/upload"

const translatesData = ref([]);
const translatesTotal = ref(0);
const translatesLimit = ref(100);
const langMultipleLimit = ref(5);
const storageTotal = ref(0);
const storageUsed = ref(0);
const storagePercentage = ref(0.0);

const transformRef = ref(null)

const emit = defineEmits(['should-auth', 'set-hide','open-set'])

let cache_type = ["trans_text", "trans_text_only", "trans_text_only_inherit"]
try {
  cache_type = localStorage.getItem("type") ? JSON.parse(localStorage.getItem("type")) : ["trans_text", "trans_text_only", "trans_text_only_inherit"]
} catch (err) {

}

const uploadRef = ref(null)

const form = ref({
  files: [],
  server: store.level == 'vip' ? 'member' : 'openai',
  api_url: "https://api.openai.com",
  api_key: "",
  model: "",
  backup_model: "",
  langs: localStorage.getItem("langs") ? JSON.parse(localStorage.getItem("langs")) : [],
  lang: "",
  type: cache_type,
  uuid: "",
  prompt: "你是一个文档翻译助手，请将以下文本、单词或短语直接翻译成{target_lang}，不返回原文本。如果文本中包含{target_lang}文本、特殊名词（比如邮箱、品牌名、单位名词如mm、px、℃等）、无法翻译等特殊情况，请直接返回原文而无需解释原因。遇到无法翻译的文本直接返回原内容。保留多余空格。",
  threads: 10,
  scanned: false, // 添加 scanned 字段
  origin_lang: '', // 添加起始语言字段
})


const formSet = ref({})

watch(() => props.setShow, (n, o) => {
  if (n) {
    //表单数据回显form数据
    formSet.value = JSON.parse(JSON.stringify(form.value));
  }
  formSetShow.value = n
})



const models = ref([])
const langs = ['中文', '英语', '日语', '俄语', '阿拉伯语', '西班牙语']

const rules = {
  files: [
    { required: true, message: '请上传文件', trigger: ['blur', 'change'] },
  ],
  server: [
    { required: true, message: '请选择供应商', trigger: ['blur', 'change'] },
  ],
  type: [
    { required: true, message: '请选择译文形式', trigger: ['blur', 'change'] },
  ],
  model: [
    { required: true, message: '请选择模型', trigger: ['blur', 'change'] },
  ],
  langs: [
    { required: true, message: '请选择翻译目标语言', trigger: ['blur', 'change'] },
  ],
  prompt: [
    { required: true, message: '请填写系统提示语', trigger: ['blur', 'change'] },
  ],
  threads: [
    { required: true, message: '请填写线程数', trigger: ['blur', 'change'] },
  ]
}

const types = [
  {
    value: 'trans_text',
    label: '仅文字部分',
    children: [
      {
        value: 'trans_text_only',
        label: '仅译文',
        children: [
          {
            value: 'trans_text_only_new',
            label: '重排版面',
          },
          {
            value: 'trans_text_only_inherit',
            label: '继承原版面',
          },
        ],
      },
      {
        value: 'trans_text_both',
        label: '原文+译文',
        children: [
          {
            value: 'trans_text_both_new',
            label: '重排版面',
          },
          {
            value: 'trans_text_both_inherit',
            label: '继承原版面',
          },
        ],
      },
    ],
  },
  {
    value: 'trans_all',
    label: '全部内容',
    children: [
      {
        value: 'trans_all_only',
        label: '仅译文',
        children: [
          {
            value: 'trans_all_only_new',
            label: '重排版面',
          },
          {
            value: 'trans_all_only_inherit',
            label: '继承原版面',
          },
        ],
      },
      {
        value: 'trans_all_both',
        label: '原文+译文',
        children: [
          {
            value: 'trans_all_both_new',
            label: '重排版面',
          },
          {
            value: 'trans_all_both_inherit',
            label: '继承原版面',
          },
        ],
      },
    ],
  },
]

const target_tip = computed(() => {
  return "翻译完成！共计翻译" + this.target_count + "字数，" + this.target_time
})

const accpet_tip = computed(() => {
  return accepts.split(",").join("/")
})

watch(form, async (o, n) => {
  if (n) {
    if (n.files.length > 1) {
      langMultipleLimit.value = 1
      if (form.value.langs.length > 1) {
        form.value.langs = []
      }
      // langMultiSelected.value=false
    } else {
      // langMultiSelected.value=true
      langMultipleLimit.value = 5
    }
  }
}, { deep: true })

watch(() => store.level, (n, o) => {
  if (n == 'vip') {
    form.value.server = 'member'
  } else {
    form.value.server = 'openai'
  }
})

onMounted(() => {
  getTranslatesData(1)
  storage().then(data => {
    if (data.code == 0) {
      storageTotal.value = data.data.storage
      storageUsed.value = data.data.used
      storagePercentage.value = data.data.percentage
    }
  })
  translateSetting().then(data => {
    if (data.code == 0) {
      let setting = data.data
      form.value.api_url = setting.api_url
      form.value.api_key = setting.api_key
      models.value = setting.models
      form.value.model = setting.default_model
      form.value.backup_model = setting.default_backup
      form.value.prompt = setting.prompt
      form.value.threads = setting.threads
    }
    if (localStorage.getItem("api_url")) {
      form.value.api_url = localStorage.getItem("api_url")
    }
    if (localStorage.getItem("api_key")) {
      form.value.api_key = localStorage.getItem("api_key")
    }
    if (localStorage.getItem("model")) {
      form.value.model = localStorage.getItem("model")
    }
    if (localStorage.getItem("model")) {
      form.value.model = localStorage.getItem("model")
    }
    if (localStorage.getItem("backup_model")) {
      form.value.backup_model = localStorage.getItem("backup_model")
    }
    if (localStorage.getItem("threads")) {
      form.value.threads = localStorage.getItem("threads")
    }
    if (localStorage.getItem("prompt")) {
      form.value.prompt = localStorage.getItem("prompt")
    }
  })
})

function flhandleFileListChange(file, fileList) {
  fileListShow.value = fileList.length > 0 ? true : false;
}

function check() {
  checking.value = true
  check_text.value = "检查中"
  checkOpenAI(form.value).then(data => {
    checking.value = false
    if (data.code == 0) {
      check_text.value = "成功"
    } else {
      check_text.value = "失败"
      ElMessage({
        message: data.message,
        type: "error",
      })
    }

  }).catch(err => {
    checking.value = false
    check_text.value = "失败"
    ElMessage({
      message: "接口异常",
      type: "error",
    })
  })
}

//翻译设置取消
function formCancel() {
  formSet.value = {};
  emit('set-hide')
}

//翻译设置确认
function formConfim(transformRef) {
  transformRef.validate((valid, messages) => {
    if (valid) {
      if (formSet.value.scanned) {
        if (formSet.value.origin_lang == "") {
          ElMessage({
            message: "请选择pdf文件的原始语言",
            type: "error",
          })
          return
        }
      }

      form.value = formSet.value;
      //确认
      localStorage.setItem("server", form.value.server)
      localStorage.setItem("api_url", form.value.api_url)
      localStorage.setItem("api_key", form.value.api_key)
      localStorage.setItem("model", form.value.model)
      localStorage.setItem("langs", JSON.stringify(form.value.langs))
      localStorage.setItem("type", JSON.stringify(form.value.type))
      localStorage.setItem("prompt", form.value.prompt)
      localStorage.setItem("threads", form.value.threads)
      emit('set-hide')
    }
  })
}

//立即翻译方法
function translate(transform, source) {
  if (!store.token) {
    emit('should-auth')
    return;
  }
  
  if (form.value.files.length <= 0) {
    ElMessage({
      message: '请上传文件',
      type: "error",
    })
    return;
  }

  //校验设置
  if(form.value.server == '' || form.value.type == '' || form.value.model == '' || form.value.langs.length < 1 || form.value.prompt == '' || form.value.limit == ''){
    emit('open-set')
    return;
  }
  
  //清空上传文件列表
  uploadRef.value.clearFiles();
  fileListShow.value = false;
  if(translatesData.value.length > 0){
    no_data.value = false;
  }

  if (source == "mobile") {
    translateDialog.value = true
  }
  let langs = []
  if (!Array.isArray(form.value.langs)) {
    langs = [form.value.langs]
  } else {
    langs = form.value.langs
  }
  result.value = {}
  form.value.files.forEach(file => {
    form.value.file_name = file.file_name
    form.value.file_path = file.file_path
    langs.forEach(lang => {
      form.value.lang = lang
      form.timestamp = new Date().getTime();
      let uuid = hash(form.value)
      // let uuid=file.uuid+"-"+lang
      form.value.uuid = uuid
      translating[uuid] = true;

      //判断处理文档类型
      let fileArr = file.file_name.split('.');
      let fileType = fileArr[fileArr.length - 1];
      let fileType_f = ''
      if (fileType == 'docx' || fileType == 'xlsx' || fileType == 'pptx') {
        fileType_f = fileType;
      } else {
        fileType_f = 'other'
      }
      result.value[uuid] = {
        file_name: file.file_name,
        file_path: file.file_path,
        file_type: fileType_f,
        uuid: uuid,
        lang: lang,
        percentage: 0,
        disabled: true,
        link: ''
      }

      // return
      process(uuid, source)
      transalteFile(form.value).then(data => {
        getTranslatesData(1, uuid)
      }).catch(data => {
        translating[uuid] = false
      })
    })
  })
  //循环结束，删除
  form.value.files = [];
}

function process(uuid, source) {
  if (!translating[uuid]) {
    return
  }
  transalteProcess({ uuid }).then(data => {
    if (data.code == 0) {
      if (data.data.process == 1) {
        if (source == "mobile") {
          translateDialog.value = true
        }
        // Reflect.set(translating, uuid, false)
        translating[uuid] = false
        translated.value = true
        target_url.value = API_URL + data.data.url
        target_count.value = data.data.count
        target_time.value = data.data.time
        result.value[uuid]['link'] = API_URL + data.data.url
        result.value[uuid]['disabled'] = false
      } else {
        setTimeout(() => process(uuid, source), 1000)
      }
      if (data.data.process != "") {
        result.value[uuid]['percentage'] = (parseFloat(data.data.process) * 100).toFixed(1)
      }
    } else {
      ElMessage({
        message: data.message,
        type: "error",
        duration: 5000
      })
      delete result.value[uuid];
      getTranslatesData(1)
    }
  })
}

function changeFile() {
  uploaded.value = false
}

function beforeUpload(file) {
  if (!store.token) {
    emit('should-auth')
    return false
  }
  let ext = file.name.split(".").pop()
  if (!accepts.split(",").includes("." + ext)) {
    ElMessage({
      message: "不支持该文件格式",
      type: "error",
      duration: 5000
    })
    return false
  }
}

function uploadSuccess(data) {
  if (data.code == 0) {
    form.value.files.push({
      file_path: data.data.filepath,
      file_name: data.data.filename,
      uuid: data.data.uuid
    })
    let ext = data.data.filename.split('.').pop()
    if (ext == "pdf") {
      checkPdf(data.data.filepath).then(result => {
        form.value.scanned = result.data.scanned // 更新表单的 scanned 值
      })
    }
  } else {
    ElMessage({
      message: data.message,
      type: "error",
    })
  }
}

function uploadError(data) {
  ElMessage({
    message: "文件上传失败，请检查文件是否超过10M",
    type: "error",
  })
}

function delUploadFile(file, files) {
  let filepath = ''
  form.value.files.forEach((item, index) => {
    if (item.file_name == file.name) {
      filepath = item.file_path
      form.value.files.splice(index, 1)
    }
  })
  delFile(filepath)
  for (let uuid in result.value) {
    if (result.value[uuid]['file_name'] == file.name) {
      delete result.value[uuid]
    }
  }
  if(files.length <= 1){
    fileListShow.value = false;
  }
}

function getTranslatesData(page, uuid) {
  //删除翻译中的任务
  if (uuid) {
    delete result.value[uuid];
  }
  let skip_uuids = Object.keys(result.value);

  translates({ page, limit: translatesLimit.value,skip_uuids:skip_uuids}).then(data => {
    if (data.code == 0) {
      data.data.data.forEach(item => {
        //获取文档类型
        let fileArr = item.origin_filename.split('.');
        let fileType = fileArr[fileArr.length - 1];
        let fileType_f = ''
        if (fileType == 'docx' || fileType == 'xlsx' || fileType == 'pptx') {
          fileType_f = fileType;
        } else {
          fileType_f = 'other'
        }
        item.file_type = fileType_f;
      })
      
      translatesData.value = data.data.data;
      translatesTotal.value = data.data.total;

      if(translatesData.value.length > 0){
        no_data.value = false;
      }
    }
  })
}

function delTransFile(id) {
  ElMessageBox.confirm('是否确定要删除？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    delTranslate(id).then((data) => {
      if (data.code == 0) {
        translatesData.value = translatesData.value.filter(item => item.id != id)
      }
    })
  })
}

function delAllTransFile() {
  ElMessageBox.confirm('是否确定要删除全部？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    delAllTranslate().then((data) => {
      if (data.code == 0) {
        translatesData.value = []
      }
    })
  })
}

store.setTitle("EZ-work AI文档翻译")

// 定义语言映射
const languageMap = {
  'chi_sim': '中文（简体）',
  'chi_tra': '中文（繁体）',
  'eng': '英语',
  'jpn': '日语',
  'kor': '韩语',
  'fra': '法语',
  'spa': '西班牙语',
  'rus': '俄语',
  'ara': '阿拉伯语',
  'deu': '德语',
  // ... 添加更多 Tesseract 支持的语言
}

// 创建语言选项数组
const languageOptions = computed(() => {
  return Object.entries(languageMap).map(([value, label]) => ({
    value,
    label
  }))
})

</script>
<style scoped lang="scss">
.page-center {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 90px;
}
.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 20px;
}
.upload-container {
  background: #ffffff;
  box-shadow: 0px 12px 20px 0px rgba(228, 238, 253, 0.5);
  border-radius: 12px;
  width: 100%;
  padding: 28px 28px;
  box-sizing: border-box;
  margin-top: 20px;
}
::v-deep {
  .dropzone {
    position: relative;
    .el-upload-dragger {
      border: 2px dashed #ccdaff;
      border-radius: 12px;
      padding-left: 0;
      padding-right: 0;
      &:hover{
        border-color: #3F66FF;
        background: #F8F9FE;
      }
    }
    .el-upload-list {
      position: absolute;
      width: 50%;
      left: 0;
      top: 50%;
      transform: translate(0, -50%);
      box-sizing: border-box;
      padding-left: 36px;
      padding-right: 36px;
      .el-upload-list__item:hover {
        background: #fff;
        .el-upload-list__item-file-name {
          color: var(--el-color-primary);
        }
      }
      .el-upload-list__item {
        display: inline-flex;
        align-items: center;
        margin-bottom: 20px;
        outline: none;
      }
      .el-upload-list__item-info {
        max-width: 90%;
        width: auto;
        .el-icon {
          display: none;
        }
      }
      .el-upload-list__item-status-label {
        position: relative;
        right: 0;
      }
      .el-icon--close {
        position: relative;
        top: 0;
        right: 0;
        transform: none;
      }
    }
    .left_box {
      width: 50%;
      float: left;
      height: 224px;
      border-right: 2px dashed #bcd4ff;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        margin: 0 15px;
      }
    }
    .right_box {
      width: 50%;
      float: right;
      height: 224px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      padding: 0 20px;
      .title {
        font-family: PingFang SC;
        font-weight: bold;
        font-size: 18px;
        color: #111111;
        line-height: 24px;
      }
      .tips {
        font-family: PingFang SC;
        font-weight: 400;
        font-size: 14px;
        color: #666666;
        line-height: 18px;
      }
      .upload_btn {
        margin-top: 24px;
        margin-bottom: 18px;
        width: 180px;
        height: 40px;
        background: #f7faff;
        border-radius: 4px;
        border: 1px dashed #055cf9;
        display: flex;
        align-items: center;
        justify-content: center;
        outline: none;
        cursor: pointer;
        img {
          height: 18px;
        }
        span {
          font-family: PingFang SC;
          font-weight: bold;
          font-size: 16px;
          color: #045cf9;
          margin-left: 12px;
        }
      }
    }
  }

  .custom_dialog {
    .el-dialog {
      max-width: 600px;
      padding: 20px 30px 20px 30px;
    }
    .el-dialog__title {
      color: #111111;
    }
    .el-dialog__headerbtn {
      font-size: 20px;
      right: 10px;
      top: 10px;
      i {
        color: #111;
      }
    }
    .el-dialog__body {
      padding: 0 30px 0 30px;
    }
    .el-form-item {
      .el-form-item__label {
        justify-content: flex-start;
        color: #111111;
      }
      .el-input-number .el-input__inner {
        text-align: left;
      }
    }
    .btn_box {
      position: relative;
      text-align: center;
      .btn_check {
        position: absolute;
        left: 0;
      }
    }
  }

  .fixed_bottom {
    position: fixed;
    bottom: 0;
    width: 100%;
    background: #fff;
    height: 68px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99;
  }

  .list_box {
    width: 100%;
    margin-top: 20px;
    background: #fff;
    box-shadow: 0px 12px 20px 0px rgba(228, 238, 253, 0.5);
    border-radius: 12px;
    padding: 0 28px;
    box-sizing: border-box;
    padding-bottom: 30px;
    .title_box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 40px;
      padding-top: 14px;
      .t {
        font-weight: bold;
        font-size: 16px;
        color: #000000;
      }
      .t_right {
        display: flex;
        align-items: center;
        flex: 1;
        justify-content: flex-end;
        .storage {
          font-size: 14px;
          color: #333333;
          margin-right: 9px;
        }
        .all_down {
          border-color: #055cf9;
          span {
            color: #055cf9;
          }
        }
      }
    }
    /*任务列表*/
    .table_box {
      width: 100;
      .table_row {
        display: flex;
        min-height: 40px;
        border-bottom: 1px solid #e5e5e5;
        align-items: center;
        font-size: 14px;
        color: #333;
        padding: 5px 0;
        .table_li {
          box-sizing: border-box;
          padding: 0 6px;
          display: flex;
          align-items: center;
          img {
            margin-right: 12px;
          }
          .file_name{
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
        .table_li:first-child {
          width: 420px;
        }
        .table_li:nth-child(2) {
          width: 370px;
        }
        .table_li:nth-child(3) {
          width: 90px;
          white-space: nowrap;
        }
        .table_li:nth-child(4) {
          width: 180px;
        }
        .table_li:nth-child(5) {
          width: 100px;
        }
      }
      .table_top {
        color: #999999;
      }
      .status {
        img {
          margin-left: 5px;
          margin-right: 7px;
        }
        span{
          white-space: nowrap;
        }
        .failed {
          color: #ff4940;
        }
        .done {
          color: #20b759;
        }
        .process {
          color: #ff9c00;
        }
      }
      .icon_down {
        margin-right: 21px;
        color: #9BBEFD;
        cursor: pointer;
        span {
          color: #055cf9;
        }
        &.actived {
          span {
            color: #9bbefd;
          }
        }
      }
    }
  }
  .translate-btn {
    line-height: 36px;
    width: 180px;
    color: white;
    border: none;
    background: #055cf9;
    border-radius: 4px;
    cursor: pointer;
  }
}
</style>
<style type="text/css" lang="scss">
.language-selection {
  display: flex;
  align-items: center;
  gap: 10px; /* 调整元素之间的间距 */
  width: 100%;
}
.lang-select {
  width: 100%; /* 默认宽度为100% */
  transition: width 0.3s ease; /* 添加过渡效果 */
}
.language-selection:has(.conversion-symbol) .lang-select {
  width: 100%; /* 当有转换符号时，设置宽度为45% */
}
.conversion-symbol {
  font-size: 20px;
  color: #409eff; /* 使用 Element Plus 的主色调，可以根据需要调整 */
  flex-shrink: 0; /* 防止符号被压缩 */
}
</style>
<style type="text/css" lang="scss">
.translated-process {
  display: inline-block;
  max-width: 270px;
  width: 80%;
}
/*手机端处理*/
@media screen and (max-width: 767px) {
  .custom_dialog {
    .el-dialog{
      padding: 20px!important;
    }
    .el-dialog__body {
      padding: 0!important;
      height: 300px;
      overflow-y: auto;
      .el-form-item{
        display: block!important;
        margin-bottom: 10px;
      }
    }
  }
  .upload-container{
    padding: 20px!important;
  }
  .list_box{
    padding: 0 20px!important;
    .title_box{
      flex-direction: column!important;
      height: auto!important;
      align-items: flex-start!important;
      .t{
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }
      .t_right{
        width: 100%;
        .storage{
          white-space: nowrap;
        }
      }
    }
    .table_box{
      padding-top: 10px;
      .table_row:last-child{
        border: none;
      }
    }
    .phone_row{
      display: inline-block!important;
      width: 100%;
      overflow: hidden;
      padding-top: 10px!important;
      .table_li{
        margin-bottom: 10px;
      }
      .table_li:first-child{
        width: 100%!important;
      }
      .status{
         width: 100%!important;
      }
      .table_li:nth-child(3){
        display: inline-block!important;
        width: auto!important;
        font-size: 12px!important;
        color: #969FA9;
        &.pc_show{
          display: none!important;;
        }
      }
      .table_li:nth-child(4){
        display: inline-block!important;
        width: auto!important;
        font-size: 12px!important;
        color: #969FA9;
        &.pc_show{
          display: none!important;;
        }
      }
    }
  }
  .dropzone{
    .el-upload-dragger{
      padding: 0!important;
    }
    .right_box{
      width: 100%!important;
      height: auto!important;
      .tips{
        margin-top: 10px;
        margin-bottom: 20px;
      }
    }
     .el-upload-list{
      position: relative!important;
      width: 100%!important;
      left: unset!important;
      transform:none!important;
      padding: 0!important;
      margin: 0;
      .el-upload-list__item{
        margin-top: 18px !important;
        margin-bottom: 0!important;
      }
     }
  }
}
</style>
