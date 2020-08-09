import  { SYS_INFO } from  '../constants/app.js'

export const initSysInfo = options=> ({
    type: SYS_INFO,
    data: {
        ...options
    }
})