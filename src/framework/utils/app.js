import Taro from '@tarojs/taro'

import { getStore } from '../../store/storeUtil'
import { initSysInfo } from '../../store/actions/app'

const store = getStore();

export default class AppUtil {

     /**
     * 初始化设备信息
     */
    static initSysInfo() {
        Taro.getSystemInfo().then(sysInfo => {
            //执行信息上传至store
            store.dispatch(initSysInfo(sysInfo))
           
        });
    }
}