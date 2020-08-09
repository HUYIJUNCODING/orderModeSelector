import Taro from "@tarojs/taro";
import React, { Component } from 'react'     
import { View, Text, Image,Swiper,SwiperItem   } from "@tarojs/components";

import "./index.scss";

import back_img from '../../../../assets/images/back.png'
import back_ceiling_img from '../../../../assets/images/back_ceiling.png'
import more_ceiling_img from '../../../../assets/images/more_ceiling.png'
import more_img from '../../../../assets/images/more.png'
import store_icon from '../../../../assets/images/store_icon.png'
import address_icon from '../../../../assets/images/address_icon.png'
import tel_icon from '../../../../assets/images/tel_icon.png'


export default class StoreInfo extends Component {
    static defaultProps = {
        propData: {
            ceilingHeight: 0,
            navHeight: 0,
            statusBarHeight: 0
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            storeInfo:{
                name: "悠然的奶茶店",
                mall_logo: "http://static.ledouya.com/20200608/170640_1591586611026.jpg",
                telphone: "13510131234",
                avg_price: "100",
                tags: [
                    "品质优选",
                    "网红好店",
                    "种草基地"
                ],
                mall_picture_arr: [
                    "http://static.ledouya.com/20200608/133208_1591586618389.jpeg"
                ],
                detailed_address: "西安市碑林区金花南路20号立丰国际4楼",
                business_time: {
                    startTime: "07:00",
                    endTime: "22:00"
                },
            },
            couponList: [{
                id: 1,
                name: '25减3'
            },{
                id: 2,
                name: '包邮'
            },{
                id: 3,
                name:'无门槛'
            },{
                id:4,
                name: '5折券'
            }]
        };
    }

    componentDidMount() {
    }

    /**
     * 返回上一页
     */
    navigateBack() {
        Taro.navigateBack();
    }


    render() {
        const { navHeight, statusBarHeight,ceilingHeight } = this.props.propData;
        const { couponList,storeInfo } = this.state;
        return (
            <View className= "store-info-container">
                 <View>
                {/* 自定义导航栏 */}
                <View className={["top", ceilingHeight > 100 && "is-ceiling"]} style={{backgroundColor: ceilingHeight <= 100? `rgba(252,223,31,${ceilingHeight/100})`: '#FCDF1F'}}>
                    <View
                        className="box"
                        style={{ height: statusBarHeight + "px" }}
                    />
                    <View
                        className="nav-bar"
                        style={{ height: navHeight + "px" }}
                    >
                        <View className={["left", ceilingHeight > 100 && "is-ceiling"]}>
                            <Image
                                className="back"
                                src={
                                    ceilingHeight > 100 ?back_ceiling_img : back_img
                                }
                            />
                            <View
                                className={["line", ceilingHeight > 100 && "is-ceiling"]}
                            ></View>
                            <Image
                                className="more"
                                src={
                                    ceilingHeight > 100 ?more_ceiling_img: more_img
                                }
                            />
                        </View>
                    </View>
                </View>

                <View className="swiper-box">
                    {/* 轮播图 */}
                    <Swiper
                        autoplay = {false}
                        duration="500"
                        circular
                        indicator-dots={false}
                        className="swiper-style"
                    >
                        {storeInfo.mall_picture_arr &&
                            storeInfo.mall_picture_arr.map(item => (
                                <SwiperItem key={item}>
                                    <View
                                        className="swiper-image"
                                        style={{
                                            backgroundImage: `linear-gradient(180deg,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0.11) 100%),url(${item})`
                                        }}
                                    />
                                </SwiperItem>
                            ))}
                    </Swiper>
                </View>
                {/* 店铺信息 */}
                <View
                    className="store-info"
                >
                    <View className="s-title">
                        <View className="s-title-left">
                            <View
                                className="s-name"
                                style="-webkit-box-orient: vertical;"
                            >
                                {storeInfo.name}
                            </View>
                            <View className="s-time">
                                <Text>
                                   {`营业时间 ${storeInfo.business_time.startTime} ~ ${storeInfo.business_time.endTime}`}
                                </Text>
                                <Text className="per">
                                        ¥{storeInfo.avg_price}/人
                                    </Text>
                            </View>
                        </View>
                        <Image className="logo" src={storeInfo.mall_logo} />
                    </View>
                    <View className="tag-content">
                        {storeInfo.tags &&
                            storeInfo.tags.map(tag => (
                                <Text key={tag} className="tag">
                                    {tag}
                                </Text>
                            ))}
                    </View>
                    <View className="coupon-content">
                            {couponList.map(cou_item=>(<View className="cou-item" key={cou_item.id}>{cou_item.name}</View>))}
                    </View>
                </View>

                {/* 商家地址 */}
                <View
                    className= "address-box"
                >
                    <View
                        className="address-detail"
                        onClick={this.openLocation}
                    >
                        <Image
                            className="icon"
                            src={store_icon}
                        />
                        <Text className="detail">
                            {storeInfo.detailed_address}
                        </Text>
                    </View>
                    <View className="add-link">
                        <Image
                            className="local-icon"
                            src={address_icon}
                            onClick={this.openLocation}
                        />
                        <View className="line"></View>
                        <Image
                            className="tel-icon"
                            src={tel_icon}
                        />
                    </View>
                </View>
           
                </View>
                </View>
        );
    }
}
