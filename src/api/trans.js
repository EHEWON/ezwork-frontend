import request from '@/utils/request'

// 检查是否可用
export function checkOpenAI(params) {
    return request({
        url: `/api/check/openai`,
        method: 'POST',
        data: params
    });
}

// 检查pdf是否是扫描件
export function checkPdf(file_path) {
    return request({
        url: `/api/check/pdf`,
        method: 'POST',
        data: {file_path}
    });
}

export function delFile(filepath) {
    return request({
        url: `/api/delFile`,
        method: 'POST',
        data: {filepath}
    });
}


export function transalteFile(params){
    return request({
        url: `/api/translate`,
        method: 'POST',
        data: params
    });
}

export function transalteProcess(params){
    return request({
        url: `/api/process`,
        method: 'POST',
        data: params
    });
}

/**
 * 翻译
 */
export function translates(params){
    return request({
        url: `/api/translates`,
        method: 'get',
        params
    });
}

/**
 * 获取翻译设置
 */
export function translateSetting(){
    return request({
        url: '/api/translate/setting',
        method: 'get',
    });
}

export function delTranslate(id){
    return request({
        url: `/api/translate/${id}`,
        method: 'delete'
    });
}

/**
 * 删除所有翻译文件记录
 */
export function delAllTranslate(){
    return request({
        url: '/api/translate/all',
        method: 'delete'
    });
}