import Taro from "@tarojs/taro";
import React, { Component } from "react";

import { View, Text, Image, ScrollView } from "@tarojs/components";

import "./index.scss";

import { connect } from "react-redux";

import CateringUtil from "../../../../utils/cateringUtil";

import GoodsDetailPopup from "../../../../components/goodsDetailPopup";
import SkuSelector from "../../../../components/skuSelector";

import dec_icon from "../../../../assets/images/dec_icon.png";
import add_icon from "../../../../assets/images/add_icon.png";
import del_icon from "../../../../assets/images/del.png";
import circle_buy_icon from "../../../../assets/images/circle_buy.png";
import circle_buy_default_icon from "../../../../assets/images/circle_buy_default.png";

@connect((state) => {
  return { ...state.shop };
})
export default class CateringGoods extends Component {
  static defaultProps = {
    propData: {
      navHeight: 0,
      screenHeight: 0,
      statusBarHeight: 0,
    },
  };
  query = null;
  cateringInstance = null;
  skuNode = React.createRef();
  goodsDetailNode = React.createRef();
  constructor(props) {
    super(props);
    this.state = {
      curNavId: "", //当前选中的导航id
      scrollViewHeight: 0, //滑动列表高度
      scrollViewTop: 0, //滑动菜单距离顶部距离
      isShowBuyCarPopup: false, //购物车列表弹窗状态
      showSkuSelector: false, //sku弹窗状态
    };
  }

  componentDidMount() {
    this.query = Taro.createSelectorQuery();
    this.getEleRectInfo(".catering-goods-container", (rect) => {
      this.setState({
        scrollViewTop: rect.top,
      });
    });
    this.initCateringInstance();
  }

  /**
   * 初始化 catering 模式工具类实例
   */
  initCateringInstance() {
    this.cateringInstance = new CateringUtil();
    this.cateringInstance.initCateringInfo((cateringInfo) => {
      this.setState({
        curNavId: Object.keys(cateringInfo)[0],
      });
    });
  }


  /**
   * 左侧导航栏切换
   * @param {string} curNavId 当前选中的一级类目id
   */
  switchNav(curNavId) {
    if (this.state.curNavId === curNavId) return;
    this.setState(
      {
        curNavId,
      },
      () => {
        this.cateringInstance.switchNav(curNavId);
      }
    );
  }

  /**
   *
   * @param {object} paramsObj  {f_category_id: 一级分类id,s_category_id: 二级分类id,product_uuid: 商品id}
   */
  showGoodsDetailPopup(paramsObj) {
    this.cateringInstance.getProDetail(paramsObj, () => {
      this.goodsDetailNode.current.showPopup(paramsObj, this.cateringInstance);
    });
  }

  getEleRectInfo(className, cb) {
    setTimeout(() => {
      this.query
        .select(className)
        .boundingClientRect((rect) => {
          cb && cb(rect);
        })
        .exec();
    }, 2000);
  }

  /**
   * 购物车弹窗
   */

  showBuyCarPopup() {
    if (!this.props.cateringCartInfo.total_count) return;
    this.setState({
      isShowBuyCarPopup: !this.state.isShowBuyCarPopup,
    });
  }

  //隐藏弹窗
  hideBuyCarPopup() {
    this.setState({
      isShowBuyCarPopup: false,
    });
  }

  /**
   * 激活sku弹窗
   * @param {object} paramsObj
   *
   * {
   *   f_category_id: 一级类目id,
   *   s_category_id: 二级类目id,
   *   product_uuid: 商品id,
   *   spec_type: 规格类型,
   *   product_info: 商品信息
   * }
   */
  openSkuSelector({ f_category_id, s_category_id, product_uuid }) {
    this.skuNode.current.openActionSheet(
      { f_category_id, s_category_id, product_uuid },
      this.cateringInstance
    );
  }
  scrollNav(e) {
    // console.log(e, "scrollNav");
  }

  /**
   * 加入购物车
   * @param {object} paramsObj
   *
   * {
   *   f_category_id: 一级类目id,
   *   s_category_id: 二级类目id,
   *   product_uuid: 商品id,
   *   spec_type: 规格类型,
   *   product_info: 商品信息
   * }
   */

  add(paramsObj) {
    this.cateringInstance.add({
      cart_id: "",
      ...paramsObj,
    });
  }

  /**
   * 减购物车
   * @param {object} paramsObj
   *
   * {
   *   f_category_id: 一级类目id,
   *   s_category_id: 二级类目id,
   *   product_uuid: 商品id,
   *   spec_type: 规格类型,
   *   product_info: 商品信息
   * }
   */
  decrease(paramsObj) {
    this.cateringInstance.decrease(paramsObj, (args) => {
      //当购物车总数量为0且弹窗状态为open时关闭购物车弹窗
      if (!args.cateringCartInfo.total_count && this.state.isShowBuyCarPopup) {
        this.setState({
          isShowBuyCarPopup: false,
        });
      }
    });
  }

  /**
   * 删除商品
   */

  handleCleanBuyCar() {
    const ids = [];
    Object.values(this.props.cateringCartInfo.info).forEach((b_item) => {
      ids.push(b_item.id);
    });
    this.cateringInstance.handleCleanBuyCar();
    this.hideBuyCarPopup();
  }

  render() {
    const { cateringInfo, cateringCartInfo } = this.props;

    const {
      navHeight,
      screenHeight,
      statusBarHeight,
    } = this.props.propData;
    let { curNavId, isShowBuyCarPopup } = this.state;
    const s_category_values =
      (cateringInfo[curNavId] &&
        Object.values(cateringInfo[curNavId].s_category).length &&
        Object.values(cateringInfo[curNavId].s_category)) ||
      [];

    const navListView =
      Object.keys(cateringInfo).length &&
      Object.keys(cateringInfo).map((f_key) => (
        <View
          className={["nav-item", curNavId === f_key && "active"]}
          key={f_key}
          onClick={this.switchNav.bind(this, f_key)}
        >
          <View>{cateringInfo[f_key].category_name}</View>
          {Number(cateringInfo[f_key].counter) > 0 && (
            <View
              className={[
                "n-dot-position",
                "dot",
                Number(cateringInfo[f_key].counter) > 99 && "more",
              ]}
            >
              {Number(cateringInfo[f_key].counter) <= 99
                ? cateringInfo[f_key].counter
                : "99+"}
            </View>
          )}
        </View>
      ));

    const mainListView = s_category_values.map((s_item) => {
      const productInfoMap = Object.values(s_item.product_info);
      return (
        <View className="main-item" key={s_item.id}>
          <View className="title">{s_item.category_name}</View>
          {productInfoMap &&
            productInfoMap.length &&
            productInfoMap.map((p_item, p_index) => (
              <View
                className={["goods-item", p_index === 0 && "first-item"]}
                key={p_item.product_uuid}
                onClick={(e) =>
                  this.showGoodsDetailPopup({
                    f_category_id: curNavId,
                    s_category_id: `s_${s_item.id}`,
                    product_uuid: p_item.product_uuid,
                  })
                }
              >
                <Image
                  mode="aspectFill"
                  className="g-thumb"
                  src={p_item.picture_array[0]}
                />
                <View className="g-content">
                  <View
                    className="g-title"
                    style="-webkit-box-orient: vertical;"
                  >
                    {p_item.product_name}
                  </View>
                  <View className="g-sale-count">
                    销量
                    {p_item.real_sales}
                  </View>
                  <View className="g-price-info">
                    <View className="g-cur-price">
                      ¥{parseFloat(p_item.price_current) / 100}
                    </View>
                    <View className="g-ori-price">
                      ¥{parseFloat(p_item.price_original) / 100}
                    </View>
                    {p_item.spec_type == 1 ? (
                      <View
                        class="sku-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          this.openSkuSelector({
                            f_category_id: curNavId,
                            s_category_id: `s_${s_item.id}`,
                            product_uuid: p_item.product_uuid,
                            spec_type: p_item.spec_type,
                            product_info: { ...p_item },
                          });
                        }}
                      >
                        选规格
                        {Number(p_item.counter) > 0 && (
                          <View
                            className={[
                              "m-dot-position",
                              "dot",
                              Number(p_item.counter) > 99 && "more",
                            ]}
                          >
                            {Number(p_item.counter) <= 99
                              ? p_item.counter
                              : "99+"}
                          </View>
                        )}
                      </View>
                    ) : (
                      <View className="selector">
                        {Number(p_item.counter) > 0 && (
                          <View
                            className="decrease"
                            onClick={(e) => {
                              e.stopPropagation();
                              return(this.decrease({
                                f_category_id: curNavId,
                                s_category_id: `s_${s_item.id}`,
                                product_uuid: p_item.product_uuid,
                                spec_type: p_item.spec_type,
                                product_info: { ...p_item },
                                sku_key: !Number(p_item.spec_type)
                                  ? ""
                                  : p_item.detail.sku_info_new[
                                      p_item.detail.infoTextArr.join("_")
                                    ],
                              }))
                              
                            }}
                          >
                            <Image className="icon" src={dec_icon} />
                          </View>
                        )}
                        {Number(p_item.counter) > 0 && (
                          <View className="counter">{p_item.counter}</View>
                        )}

                        <View
                          className="add"
                          onClick={(e) => {
                            e.stopPropagation();
                            this.add({
                              f_category_id: curNavId,
                              s_category_id: `s_${s_item.id}`,
                              product_uuid: p_item.product_uuid,
                              spec_type: p_item.spec_type,
                              product_info: { ...p_item },
                              sku_key: !Number(p_item.spec_type)
                                ? ""
                                : p_item.detail.sku_info_new[
                                    p_item.detail.infoTextArr.join("_")
                                  ],
                            });
                          }}
                        >
                          <Image className="icon" src={add_icon} />
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
        </View>
      );
    });

    return (
      <View className="catering-goods-container">
        <View
          className="main-content"
          style={{
            top: navHeight + statusBarHeight + "px",
          }}
        >
          <View className="head bottom-line">
            <View className="title">商家推荐</View>
            <View className="reminder">哇 好多热销推荐快来选购吧～</View>
          </View>
          <View className="vertical-box">
            {/* 左侧 */}
            <ScrollView
              className="vertical-nav"
              scroll-y
              scroll-with-animation
              style={{
                height:
                  screenHeight - (navHeight + statusBarHeight + 59) + "px",
              }}
            >
              {navListView}
              <View className="v-nav-bottom" />
            </ScrollView>

            {/* 右侧 */}
            <ScrollView
              className="vertical-main"
              scroll-y
              scroll-with-animation
              style={{
                height:
                  screenHeight - (navHeight + statusBarHeight + 59) + "px",
              }}
            >
              {mainListView}
              <View className="v-main-bottom" />
            </ScrollView>
          </View>
        </View>
        {/* 购物车列表 */}
        <View className="buy-car-popup">
          {isShowBuyCarPopup && (
            <View
              className="mask"
              catchtouchmove="true"
              onClick={this.hideBuyCarPopup.bind(this)}
            ></View>
          )}
          <View
            class="buy-car-popup-content"
            style={{
              bottom: isShowBuyCarPopup ? 0 : `-950rpx`,
            }}
          >
            <View className="title" catchtouchmove="true">
              <Text className="left">已选商品</Text>
              <View
                className="right"
                onClick={this.handleCleanBuyCar.bind(this)}
              >
                <Image className="del-icon" mode="aspectFill" src={del_icon} />
                <Text className="del-text">清空</Text>
              </View>
            </View>
            {cateringCartInfo && cateringCartInfo.info && (
              <ScrollView
                className="scroll-view"
                style={{
                  height:
                    Object.keys(cateringCartInfo.info).length <= 4
                      ? "auto"
                      : "852rpx",
                }}
                scroll-y={true}
              >
                <View className="s-list">
                  {Object.values(cateringCartInfo.info).map(
                    (b_item, b_index) => (
                      <View
                        className={[
                          "item",
                          b_index !==
                            Object.keys(cateringCartInfo.info).length - 1 &&
                            "bottom-line",
                        ]}
                        key={b_item.id}
                      >
                        <View className="main-info">
                          <View
                            className="goods-name line-clamp-2"
                            style="-webkit-box-orient: vertical;"
                          >
                            {b_item.product_name}
                          </View>
                          <View className="goods-price">
                            <Text className="unit">¥</Text>
                            <Text className="amount">
                              {parseFloat(b_item.price_current) / 100}
                            </Text>
                          </View>
                          <View className="selector">
                            <View
                              className="decrease"
                              onClick={(e) => {
                                e.stopPropagation();
                                this.decrease({
                                  f_category_id: b_item.f_category_id,
                                  s_category_id: b_item.s_category_id,
                                  product_uuid: b_item.product_uuid,
                                  spec_type: b_item.spec_type,
                                  product_info: {
                                    ...b_item,
                                  },
                                  sku_key: b_item.sku_name,
                                });
                              }}
                            >
                              <Image className="icon" src={dec_icon} />
                            </View>
                            <View className="counter">{b_item.counter}</View>
                            <View
                              className="add"
                              onClick={(e) =>
                                this.add({
                                  f_category_id: b_item.f_category_id,
                                  s_category_id: b_item.s_category_id,
                                  product_uuid: b_item.product_uuid,
                                  spec_type: b_item.spec_type,
                                  product_info: {
                                    ...b_item,
                                  },
                                  sku_key: b_item.sku_name,
                                })
                              }
                            >
                              <Image className="icon" src={add_icon} />
                            </View>
                          </View>
                        </View>
                        <View className="sku-info">{b_item.sku_name}</View>
                      </View>
                    )
                  )}
                </View>

                <View class="s-bottom" />
              </ScrollView>
            )}
          </View>
        </View>
        {/* 底部 bar */}
        <View className="buy-bar">
          <View className="circle-content" onClick={this.showBuyCarPopup.bind(this)}>
            <Image
              mode="aspectFill"
              className="circle"
              src={
                cateringCartInfo.total_count
                  ? circle_buy_icon
                  : circle_buy_default_icon
              }
            />
            {cateringCartInfo.total_count > 0 && (
              <View
                className={[
                  "c-dot-position",
                  cateringCartInfo.total_count > 99 && "more",
                  "dot",
                ]}
              >
                {cateringCartInfo.total_count <= 99
                  ? cateringCartInfo.total_count
                  : "99+"}
              </View>
            )}
          </View>
          <View className="price-content">
            <Text className="total-price">
              ¥{parseFloat(cateringCartInfo.total_price) / 100}
            </Text>
          </View>
          <View
            className={[
              "buy-btn",
              cateringCartInfo.total_count > 0 && "active",
            ]}
          >
            去结算
          </View>
        </View>

        {/* 商品详情 */}
        <GoodsDetailPopup
          ref={this.goodsDetailNode}
          propData={{
            screenHeight,
            navHeight,
            statusBarHeight
          }}
          add={this.add.bind(this)}
          decrease={this.decrease.bind(this)}
          openSkuSelector={this.openSkuSelector.bind(this)}
        ></GoodsDetailPopup>

        {/* skuSelector */}
        <SkuSelector
          ref={this.skuNode}
          add={this.add.bind(this)}
          decrease={this.decrease.bind(this)}
        />
      </View>
    );
  }
}
