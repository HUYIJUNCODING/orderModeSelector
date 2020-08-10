import Taro from "@tarojs/taro";
import React, { Component } from "react";

import { View, Text, Image, Swiper, SwiperItem } from "@tarojs/components";

import "./index.scss";

import { connect } from "react-redux";

import Description from "../description";

import down_arrow_icon from "../../assets/images/down-arrow.png";
import add_icon from "../../assets/images/add_icon.png";
import dec_icon from "../../assets/images/dec_icon.png";

class GoodsDetailPopup extends Component {
  static defaultProps = {
    propData: {
      screenHeight: 0,
      navHeight: 0,
      statusBarHeight: 0,
    },
  };
  cateringInstance = null;
  constructor(props) {
    super(props);
    this.state = {
      f_category_id: "", //一级类目id
      s_category_id: "", //二级类目id
      product_uuid: "", //商品id
      isShow: false,
    };

    this.closePopup = this.closePopup.bind(this);
  }

  componentDidMount() {}

  showPopup({ f_category_id, s_category_id, product_uuid }, cateringInstance) {
    this.cateringInstance = cateringInstance;
    this.setState({
      f_category_id,
      s_category_id,
      product_uuid,
      isShow: true,
    });
  }
  closePopup() {
    this.setState({
      isShow: false,
    });
  }

  render() {
    const { cateringInfo, propData } = this.props;
    const { f_category_id, s_category_id, product_uuid, isShow } = this.state;

    const product_info =
      f_category_id &&
      s_category_id &&
      product_uuid &&
      cateringInfo[f_category_id].s_category[s_category_id].product_info[
        product_uuid
      ];

    if(!product_info || !product_info.detail) return null;

    return (
      <View
        className="goods-detail-popup-container"
        style={{
          height: `${propData.screenHeight}px`,
          bottom: isShow ? 0 : `-${propData.screenHeight}px`,
        }}
      >
        <View
          className="status-bar"
          style={{
            position: isShow ? "fixed" : "relative",
            height: propData.statusBarHeight + "px",
          }}
        />
        <View
          className="nav-bar"
          style={{
            position: isShow ? "fixed" : "relative",
            height: propData.navHeight + "px",
            top: `${propData.statusBarHeight}px`,
          }}
        >
          <Text className="t-text">商品详情</Text>
          <Image
            className="back"
            onClick={this.closePopup}
            src={down_arrow_icon}
          />
        </View>

        <Swiper
          className="swiper-box"
          style={{
            marginTop: propData.navHeight + propData.statusBarHeight + "px",
          }}
        >
          {product_info &&
            product_info.detail &&
            product_info.detail.picture_array.map((v, i) => (
              <SwiperItem key={i}>
                <Image className="swiper-img" mode="aspectFill" src={v} />
              </SwiperItem>
            ))}
        </Swiper>
        <View className="banner-box">
          <View className="product-name">
            {product_info.detail.product_name}
          </View>
          <View className="sales-count">
            销量{product_info.detail.real_sales}
          </View>
          <View className="g-price-info">
            <View className="g-cur-price">
              ¥{parseFloat(product_info.detail.price_current) / 100}
            </View>
            <View className="g-ori-price">
              ¥{parseFloat(product_info.detail.price_original) / 100}
            </View>
            {product_info.detail.spec_type == 1 && (
              <View
                class="sku-btn"
                onClick={(e) => {
                  this.closePopup();
                  this.props.openSkuSelector({
                    f_category_id,
                    s_category_id,
                    product_uuid,
                    spec_type: product_info.detail.spec_type,
                    product_info: { ...product_info },
                  });
                }}
              >
                选规格
                {Number(product_info.counter) > 0 && (
                  <View
                    className={[
                      "m-dot-position",
                      "dot",
                      Number(product_info.counter) > 99 && "more",
                    ]}
                  >
                    {Number(product_info.counter) <= 99
                      ? product_info.counter
                      : "99+"}
                  </View>
                )}
              </View>
            )}
            {product_info.detail.spec_type != 1 &&
              Number(product_info.counter) > 0 && (
                <View className="selector">
                  <View
                    className="decrease"
                    onClick={(e) => {
                      this.props.decrease({
                        f_category_id,
                        s_category_id,
                        product_uuid,
                        spec_type: product_info.detail.spec_type,
                        product_info: {
                          ...product_info,
                        },
                        sku_key: !Number(product_info.detail.spec_type)
                          ? ""
                          : product_info.detail.sku_info_new[
                              product_info.detail.infoTextArr.join("_")
                            ],
                      });
                    }}
                  >
                    <Image className="icon" src={dec_icon} />
                  </View>
                  <View className="counter">
                    {Number(product_info.counter)}
                  </View>
                  <View
                    className="add"
                    onClick={(e) => {
                      this.props.add({
                        f_category_id,
                        s_category_id,
                        product_uuid,
                        spec_type: product_info.detail.spec_type,
                        product_info: {
                          ...product_info,
                        },
                        sku_key: !Number(product_info.detail.spec_type)
                          ? ""
                          : product_info.detail.sku_info_new[
                              product_info.detail.infoTextArr.join("_")
                            ],
                      });
                    }}
                  >
                    <Image className="icon" src={add_icon} />
                  </View>
                </View>
              )}
            {product_info.detail.spec_type != 1 &&
              Number(product_info.counter) == 0 && (
                <View
                  className="add-car-btn"
                  onClick={(e) => {
                    this.props.add({
                      f_category_id,
                      s_category_id,
                      product_uuid,
                      spec_type: product_info.detail.spec_type,
                      product_info: {
                        ...product_info,
                      },
                      sku_key: !Number(product_info.detail.spec_type)
                        ? ""
                        : product_info.detail.sku_info_new[
                            product_info.detail.infoTextArr.join("_")
                          ],
                    });
                  }}
                >
                  加入购物车
                </View>
              )}
          </View>
        </View>
        {/* 商品详情 */}
        <View className="detail-box">
          <Description
            description={
              product_info &&
              product_info.detail &&
              product_info.detail.description
            }
          />
        </View>
      </View>
    );
  }
}
const mapStateToProps = (state, props) => {
  return {
    ...state.shop,
  };
};
export default connect(mapStateToProps, null, null, { forwardRef: true })(
  GoodsDetailPopup
);
