import Taro from "@tarojs/taro";
import React, { Component } from 'react' 

import { ScrollView } from "@tarojs/components";

import './index.scss'

import { connect } from "react-redux";

import {getState} from "../../store/storeUtil";

import StoreInfo from './components/storeInfo'
import CateringGoods from './components/cateringGoods'

export default class Home extends Component  {
    static defaultProps = {};

    constructor(props) {
        super(props);

        this.state = {
            navHeight: 0,
            screenHeight: 0,
            statusBarHeight: 0,
            ceilingHeight: 0
        };
    }

    /**
     * 获取设备信息
     */
    getSysInfo() {
        const sysInfo = getState().app.sysInfo
       if(!sysInfo.statusBarHeight){
        this.getSysInfo()
        return;
       };
        this.setState({
            screenHeight: sysInfo.screenHeight,
            statusBarHeight: sysInfo.statusBarHeight,
            navHeight: sysInfo.system.indexOf("iOS") > -1 ? 44 : 48
        });
    }

    onScroll(e){
       this.setState({
        ceilingHeight: Math.floor(e.detail.scrollTop)
       })
    };

    componentDidMount() {
        setTimeout(()=>{
            this.getSysInfo()
        },2000)
       
       
    }

    componentWillUnmount() {
    
    }

    render() {
        const {
            navHeight,
            screenHeight,
            statusBarHeight,
            ceilingHeight 
        } = this.state;

        return (
            <ScrollView
                scroll-y={true}
                enable-back-to-top={true}
                className="home-container"
                onScroll={this.onScroll.bind(this)}
            >
                {/* 店铺信息 */}
                <StoreInfo
                    propData={{
                        navHeight,
                        statusBarHeight,
                        ceilingHeight
                    }}
                />

                {/* 商品列表 */}
                <CateringGoods
                        propData={{
                            navHeight,
                            screenHeight,
                            statusBarHeight
                        }}
                    />

            </ScrollView>
        );
    }
}
