import request from '@/utils/request'

// 检查是否可用
export function checkOpenAI(params) {
    return request({
        url: `/check`,
        method: 'POST',
        data: params
    });
}

export function delFile(filename) {
    return request({
        url: `/delFile`,
        method: 'POST',
        data: {filename}
    });
}


export function transalteFile(params){
    return request({
        url: `/translate`,
        method: 'POST',
        data: params
    });
}

export function transalteProcess(params){
    return request({
        url: `/process`,
        method: 'POST',
        data: params
    });
}