import Taro from "@tarojs/taro";
import React, { Component } from 'react' 
import {
    View,
    Text,
    Image
} from "@tarojs/components";

import "./index.scss";

import { connect } from "react-redux";

import add_icon from '../../assets/images/add_icon.png'
import dec_icon from '../../assets/images/dec_icon.png'
import close_icon from '../../assets/images/close-icon.png'

class SkuSelector extends Component {
    static defaultProps = {
    };

    constructor(props) {
        super(props);
        this.state = {
            f_category_id: "", //一级类目id
            s_category_id: "", //二级类目id
            product_uuid: "", //当前商品id
            isShowMask: false, //蒙层
            openAnimation: null,
            closeAnimation: null,
            animationData: null
        };
    }

    startAnimation = (type = "in", run = false) => {
        const { openAnimation, closeAnimation } = this.state;
        let newOpenAnimation = openAnimation;
        let newCloseAnimation = closeAnimation;
        if (type === "in") {
            // 创建动画

            if (!newOpenAnimation) {
                newOpenAnimation = Taro.createAnimation({
                    duration: 200,
                    timingFunction: "ease-in"
                });
            }

            if (run) {
                //动画描述
                this.setState({
                    isShowMask: true
                });
                setTimeout(() => {
                    newOpenAnimation
                        .opacity(1)
                        .translate3d(0, 0, 0)
                        .step();
                    this.setState({
                        animationData: newOpenAnimation.export()
                    });
                }, 80);
            }
        } else if (type === "out") {
            // 创建动画
            if (!newCloseAnimation) {
                newCloseAnimation = Taro.createAnimation({
                    duration: 200,
                    timingFunction: "ease-out"
                });
            }
            //蒙层
            if (run) {
                // 动画描述
                newCloseAnimation
                    .opacity(0)
                    .translate3d(0, "100%", 0)
                    .step();
                this.setState(
                    {
                        animationData: newCloseAnimation.export()
                    },
                    () => {
                        setTimeout(() => {
                            this.setState({
                                animationData: {},
                                isShowMask: false
                            });
                        }, 300);
                    }
                );
            }
        }
        this.setState({
            openAnimation: newOpenAnimation,
            closeAnimation: newCloseAnimation
        });
    };

    /**
     * 激活弹窗
     * @param {object} paramsObj
     *
     * {
     *   f_category_id: 一级分类id,
     *   s_category_id: 二级分类id,
     *   product_uuid: 商品id
     * }
     */
    openActionSheet = (paramsObj, cateringInstance) => {
        this.cateringInstance = cateringInstance;
        this.setState({
            f_category_id: paramsObj.f_category_id,
            s_category_id: paramsObj.s_category_id,
            product_uuid: paramsObj.product_uuid
        });
        this.startAnimation("in", true);
    };
    //关闭
    closeActionSheet = e => {
        this.startAnimation("out", true);
    };

    // 规格选择
    onChangeShowState(event) {
        const { f_category_id, s_category_id, product_uuid } = this.state;
        const attr_index = event.currentTarget.dataset.index;
        const attr_idx = event.currentTarget.dataset.idx;
        this.cateringInstance.skuCalc({
            f_category_id,
            s_category_id,
            product_uuid,
            attr_index,
            attr_idx
        });
    }

    componentDidMount() {}

    render() {
        const {  f_category_id, s_category_id, product_uuid,isShowMask, animationData } = this.state;

        if (!f_category_id || !s_category_id || !product_uuid) return null;

        const { attr_value: attr_list } = this.props.cateringInfo[
            f_category_id
        ].s_category[s_category_id].product_info[product_uuid].detail;

        const product_info = this.props.cateringInfo[f_category_id].s_category[s_category_id].product_info[product_uuid];

        const product_detail = product_info.detail;

        const current_sku_info = product_detail.sku_info_new[product_detail.infoTextArr.join("_")];
        const current_sku_name = product_detail.infoTextArr.join(",");

        return (
            <View>
                {isShowMask && (
                    <View className="action-sheet-box">
                        <View
                            className="mask"
                            onClick={this.closeActionSheet}
                            catchtouchmove="true"
                        ></View>
                        <View className="action-bd" animation={animationData}>
                            <View
                                className="btn-close-box"
                                onClick={this.closeActionSheet}
                            >
                                <Image
                                    mode="aspectFit"
                                    className="btn-close-icon"
                                    src={close_icon}
                                />
                            </View>

                            {/* sku信息 */}
                            <View className="content">
                                {/* 头部 */}
                                <View className="hd" catchtouchmove="true">
                                    <Image
                                        className="goods-img"
                                        src={current_sku_info.sku_pics}
                                        mode="aspectFill"
                                    />
                                    <View className="info">
                                        <View className="price">
                                            <View className="price-current">
                                                <Text className="unit">￥</Text>
                                                {parseFloat(
                                                    current_sku_info.price_current
                                                ) / 100}
                                            </View>
                                            {current_sku_info.price_current !=
                                                current_sku_info.price_original && (
                                                <View className="price-origin">
                                                    ￥
                                                    {parseFloat(
                                                        current_sku_info.price_original
                                                    ) / 100}
                                                </View>
                                            )}
                                        </View>
                                        <View className="stock">
                                            库存：{current_sku_info.stock}
                                        </View>
                                        {/* 多规格 */}
                                        <View className="sku">
                                            <Text>{`已选：${current_sku_name}`}</Text>
                                            <Text style="padding-left: 10px;">
                                                {current_sku_info.counter}件
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                {/* 规格选择 */}
                                <View className="sku-box">
                                    {/* 选择 */}
                                    {attr_list.map((item, index) => (
                                        <View className="outStyle" key={item.id}>
                                            <View className="outStyleText">
                                                {item.attrName}
                                            </View>
                                            <View className="typeStyle">
                                                {item.attr.map((it, idx) => (
                                                    <View
                                                        className="unit-cell"
                                                        data-item={
                                                            item.attr[idx]
                                                        }
                                                        data-index={index}
                                                        data-idx={idx}
                                                        key={it.id}
                                                        onClick={this.onChangeShowState.bind(
                                                            this
                                                        )}
                                                    >
                                                        <View
                                                            className={[
                                                                "unit-item",
                                                                it.enable
                                                                    ? it.select
                                                                        ? "orange"
                                                                        : "back"
                                                                    : "white"
                                                            ]}
                                                        >
                                                            {it.attributeValue}
                                                        </View>
                                                    </View>
                                                ))}
                                            </View>
                                            <View
                                                style={{ clear: "both" }}
                                            ></View>
                                        </View>
                                    ))}
                                </View>
                                {/* 数量 */}
                                <View className="add-cart-box">
                                    <View className="selector">
                                        {Number(current_sku_info.counter)> 0 && (
                                            <View
                                                className="decrease"
                                                onClick={e => {
                                                    this.props.decrease({
                                                        f_category_id,
                                                        s_category_id,
                                                        product_uuid,
                                                        spec_type:
                                                            product_info.spec_type,
                                                        product_info: {
                                                            ...product_info
                                                        },
                                                        sku_key: !Number(
                                                            product_info.spec_type
                                                        )
                                                            ? ""
                                                            : product_detail.infoTextArr.join(
                                                                  "_"
                                                              )
                                                    });
                                                }}
                                            >
                                                <Image
                                                    className="icon"
                                                    src={dec_icon}
                                                />
                                            </View>
                                        )}
                                        {Number(current_sku_info.counter) > 0 && (
                                            <View className="counter">
                                                {Number(
                                                    current_sku_info.counter
                                                )}
                                            </View>
                                        )}

                                        <View
                                            className="add"
                                            onClick={e => {
                                                this.props.add({
                                                    f_category_id,
                                                    s_category_id,
                                                    product_uuid,
                                                    spec_type:
                                                        product_info.spec_type,
                                                    product_info: {
                                                        ...product_info
                                                    },
                                                    sku_key: !Number(
                                                        product_info.spec_type
                                                    )
                                                        ? ""
                                                        : product_detail.infoTextArr.join(
                                                              "_"
                                                          )
                                                });
                                            }}
                                        >
                                            <Image
                                                className="icon"
                                                src={add_icon}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            </View>
        );
    }
}
const mapStateToProps = (state,props) => {
    return {
       ...state.shop
    }
}
export default connect(mapStateToProps, null, null, { forwardRef: true })(SkuSelector)
