import request from '@/utils/request'

// 修改密码
export function changePassword(data) {
    return request({
        url: '/api/change',
        method: 'POST',
        data
    });
}

/**
 * 获取存储空间
 */
export function storage() {
    return request({
        url: '/api/storage',
        method: 'GET',
    });
}