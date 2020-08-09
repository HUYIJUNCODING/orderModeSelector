import React, { Component } from 'react'
import { Provider } from 'react-redux'  
import './app.scss'

import { getStore } from './store/storeUtil'
import AppUtil from './framework/utils/app'

const store = getStore()

class App extends Component {

  //taro 3.x 新增的生命周期方法,用来替代 componentWillMount()
  UNSAFE_componentWillMount(){
      //初始化设备信息
      AppUtil.initSysInfo();
      
  }

  componentDidMount () {}

  componentDidShow () {}

  componentDidHide () {}

  componentDidCatchError () {}

  // this.props.children 是将要会渲染的页面
  render () {
    return <Provider store={store}>
     { this.props.children}
    </Provider>
  }
}

export default App
