import request from '@/utils/request'

// 注册时发送邮箱验证码
export function registerSendEmail(email) {
    return request({
        url: `/register/send`,
        method: 'POST',
        data: {email}
    });
}

export function register(params) {
    return request({
        url: `/register`,
        method: 'POST',
        data: params
    });
}

export function login(params) {
    return request({
        url: `/login`,
        method: 'POST',
        data: params
    });
}

// 忘记密码发送邮箱验证码
export function forgetSendEmail(email) {
    return request({
        url: `/forget/send`,
        method: 'POST',
        data: {email}
    });
}

export function forget(data) {
    return request({
        url: `/forget`,
        method: 'POST',
        data: data
    });
}