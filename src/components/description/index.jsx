import Taro from "@tarojs/taro";
import React, { Component } from "react";
import { View } from '@tarojs/components'
import Parser from '../richText/parser'


import './index.scss'


export default class Description extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }


  render() {
    const { description } = this.props
    return (
      <View className='wrapper'>
        <View className='box'>
          <View className='title'>商品详情</View>
          <View className='info'>
            <Parser content={description} />
          </View>
        </View>
      </View>
    )
  }
}
