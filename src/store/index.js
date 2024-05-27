import {reactive} from 'vue'

export const store=reactive({
    pTitle:"",
    token:localStorage.getItem("token") || '',
    level:localStorage.getItem("level") || 'common',
    username:localStorage.getItem("username") || '',
    setTitle(title){
        this.pTitle=title
    },
    setToken(token){
        this.token=token
        localStorage.setItem("token",token)
    },
    setLevel(level){
        this.level=level
        localStorage.setItem("level",level)
    },
    setUsername(username){
        this.username=username
        localStorage.setItem("username",username)
    }
})