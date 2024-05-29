import request from '@/utils/request'

// 检查是否可用
export function checkOpenAI(params) {
    return request({
        url: `/api/check`,
        method: 'POST',
        data: params
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