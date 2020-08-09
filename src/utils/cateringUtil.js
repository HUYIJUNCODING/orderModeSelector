import { getState, stateSave } from "../store/storeUtil";
import BaseConstant from "../store/constants/shop";

import mockData from "./mock";

//PS:这里采用的是本地模拟数据，因此接口相关逻辑可以不用理会，为了保持逻辑完整性，笔者没有删减掉。

// import {
//   firstCategoryListAPI,
//   secondCategoryListAPI,
//   goodsDetailAPI,
//   cartInfoAPI,
// } from "/api/shop";

export default class CateringUtil {
  static config = {};

  constructor(config = {}) {
    const baseConfig = CateringUtil.config;
    CateringUtil.config = { ...baseConfig, ...config };
  }

  /**
   * 请求一级类目列表
   */
  static getFirstCategoryList(cb) {
    return new Promise((resolve) => {
      firstCategoryListAPI({
        page: 1,
        page_size: 999,
        type: 1,
        mtoken: CateringUtil.config.mtoken,
      }).then((res) => {
        if (res.error == 0 && res.data && res.data.info) {
          let f_category = [...res.data.info];
          let cateringInfo = {};
          f_category.forEach((f_item) => {
            //构建一级目录数据结构(f_ 前缀的目的是避免使用Object.keys 或者Object.values 时乱序)
            let obj = { counter: 0, s_category: {} };
            obj = { ...obj, ...f_item };
            cateringInfo["f_" + f_item.id] = obj;
          });
          CateringUtil.stateSave({ cateringInfo });
          cb && cb(cateringInfo);
          resolve();
        }
      });
    }).catch((error) => {
      console.log(error);
    });
  }

  /**
   * 请求二级类目列表
   *
   * @param {string} f_category_id 一级类目id
   */
  static getSecondCategoryList(f_category_id) {
    let { cateringInfo } = getState().shop;

    return new Promise((resolve) => {
      if (Object.keys(cateringInfo[f_category_id].s_category).length) {
        resolve(false);
        return;
      }
      secondCategoryListAPI({
        page: 1,
        page_size: 999,
        category_id: f_category_id.split("_")[1],
        mtoken: CateringUtil.config.mtoken,
      }).then((res) => {
        if (res.error == 0 && res.data) {
          let s_category = [...res.data];
          //构建二级目录数据结构(多层循环建议使用普通for循环,效率最高)
          for (let i = 0, len = s_category.length; i < len; i++) {
            let s_product_info = [...s_category[i].product_info];
            let new_product_info = {};
            //构建二级目录中product_info数据结构
            for (let j = 0, len2 = s_product_info.length; j < len2; j++) {
              new_product_info[s_product_info[j].product_uuid] = {
                counter: 0,
                ...s_product_info[j],
              };
            }
            s_category[i].product_info = new_product_info;

            cateringInfo[f_category_id].s_category["s_" + s_category[i].id] = {
              ...s_category[i],
            };
          }
          CateringUtil.stateSave({ cateringInfo });
        }
        resolve(true);
      });
    }).catch((error) => {
      console.log(error);
    });
  }

  /**
   * 获取商品详情
   *
   * @param {object} paramsObj
   *
   * {
   *   f_category_id: 一级类目id,
   *   s_category_id: 二级类目id,
   *   product_uuid: 商品id,
   *   sku_name: 商品名(多规格),
   *   counter: 当前商品对应的已加购数量
   * }
   */
  static getProductDetail({
    f_category_id,
    s_category_id,
    product_uuid,
    sku_name,
    counter,
  }) {
    let { cateringInfo } = getState().shop;
    let cater_product_detail =
      cateringInfo[f_category_id].s_category[s_category_id].product_info[
        product_uuid
      ].detail;

    return new Promise((resolve) => {
      if (cater_product_detail && Object.keys(cater_product_detail).length) {
        resolve();
        return;
      }

      goodsDetailAPI({ product_uuid }).then((res) => {
        if (res.error == 0 && res.data) {
          let product_detail = { ...res.data };

          //多规格商品
          if (
            product_detail.spec_type == 1 &&
            product_detail.attr_value &&
            product_detail.attr_value.length
          ) {
            product_detail = {
              infoTextArr: [], //选中的sku 属性名组合(attributeValue 数组)
              sku_info_new: {},
              ...product_detail,
            };
            //初始化attr_value默认选中项
            const def_skuname_arr = (product_detail.infoTextArr = product_detail.sku_info[0].sku_name.split(
              "_"
            ));

            for (let i = 0, ilen = def_skuname_arr.length; i < ilen; i++) {
              const cur_attr = def_skuname_arr[i];
              for (
                let j = 0, jlen = product_detail.attr_value[i].attr.length;
                j < jlen;
                j++
              ) {
                if (
                  cur_attr !==
                  product_detail.attr_value[i].attr[j].attributeValue
                )
                  continue;
                product_detail.attr_value[i].attr[j].enable = true;
                product_detail.attr_value[i].attr[j].select = true;
                break;
              }
            }

            //sku_info 重新构造 key->value 格式数据结构,初始化 counter
            for (let item of product_detail.sku_info) {
              item.counter = 0;
              product_detail.sku_info_new[item.sku_name] = item;
            }
            if (sku_name) {
              product_detail.sku_info_new[sku_name].counter = counter;
            }

            //初始化执行一次sku核心算法
            product_detail = CateringUtil.skuCore(product_detail);
          }
          cateringInfo[f_category_id].s_category[s_category_id].product_info[
            product_uuid
          ].detail = product_detail;

          CateringUtil.stateSave({ cateringInfo });
        }
        resolve();
      });
    }).catch((error) => {
      console.log(error);
    });
  }

  /**
   * 获取购物车列表
   */
  static getCateringBuycar() {
    let { cateringInfo, cateringCartInfo } = getState().shop;
    const { business_id } = CateringUtil.config;
    return new Promise((resolve) => {
      cartInfoAPI({
        business_id, //店铺id
      }).then(async (res) => {
        if (
          res.error == 0 &&
          res.data &&
          res.data.list &&
          res.data.list.length
        ) {
          const buyCarInfo = [...res.data.list][0];
          cateringCartInfo.info = {};
          //构建购物车列表
          for (let item of buyCarInfo.goods_list) {
            const key = !Number(item.spec_type)
              ? item.product_uuid
              : item.sku_uuid;

            cateringCartInfo.info[key] = {
              counter: Number(item.product_quantity),
              price_current: item.current_price,
              product_name: item.goods_name,
              f_category_id: `f_${item.category_id}`,
              s_category_id: `s_${item.class_id}`,
              ...item,
            };

            //预加载已加购商品对应的二级类目列表
            const s_c_id =
              cateringInfo[`f_${item.category_id}`].s_category[
                `s_${item.class_id}`
              ];

            !s_c_id &&
              (await CateringUtil.getSecondCategoryList(
                `f_${item.category_id}`
              ));

            ///预加载已加购商品对应的详情数据(多规格时)
            Number(item.spec_type) &&
              !s_c_id.product_info.detail &&
              (await CateringUtil.getProductDetail({
                f_category_id: `f_${item.category_id}`,
                s_category_id: `s_${item.class_id}`,
                product_uuid: item.product_uuid,
                sku_name: item.sku_name,
                counter: item.counter,
              }));
          }
          //同步购物车总数量和总金额
          cateringCartInfo.total_price = res.data.total_price;
          cateringCartInfo.total_count = buyCarInfo.goods_list.reduce(
            (preCounts, g_item) => {
              return preCounts + Number(g_item.product_quantity);
            },
            0
          );

          CateringUtil.stateSave({
            cateringCartInfo,
          });

          resolve(cateringCartInfo);
        }
      });
    }).catch((error) => {
      console.log(error);
    });
  }

  /**
   * 购物车列表映射counter给类目列表(同步小红点)
   *
   * @param {object} cart_info 购物车列表
   * @param {string} f_category_id 当前选中的一级类目id
   */
  static async reflectCounter(cart_info, f_category_id) {
    if (!Object.keys(cart_info.info).length) return;

    let { cateringInfo } = getState().shop;
    const cartInfoValues = Object.values(cart_info.info);

    for (let b_item of cartInfoValues) {
      //已加购商品所在一级类目列表同步counter
      !f_category_id &&
        (cateringInfo[b_item.f_category_id].counter += Number(b_item.counter));

      if (f_category_id && b_item.f_category_id !== f_category_id) continue;

      //已加购商品所在二级类目同步counter
      //单规格同步counter
      let p_item =
        cateringInfo[b_item.f_category_id].s_category[b_item.s_category_id]
          .product_info[b_item.product_uuid];

      if (!Number(b_item.spec_type)) {
        p_item.counter = Number(b_item.counter);
      } else {
        //多规格同步counter
        p_item.counter += Number(b_item.counter);

        //同步sku 列表counter
        b_item.sku_name &&
          (p_item.detail.sku_info_new[b_item.sku_name].counter = Number(
            b_item.counter
          ));
      }
    }

    CateringUtil.stateSave({ cateringInfo });
  }

  /**
   * 执行sku运算
   *
   * @param {object} paramsObj
   *
   * {
   *   f_category_id: 一级类目id,
   *   s_category_id: 二级类目id,
   *   product_uuid: 商品id
   *   attr_index: 属性列表索引
   *   attr_idx:   属性索引
   * }
   */
  static doSkuCalc({
    f_category_id,
    s_category_id,
    product_uuid,
    attr_index,
    attr_idx,
  }) {
    let { cateringInfo } = getState().shop;

    let product_detail =
      cateringInfo[f_category_id].s_category[s_category_id].product_info[
        product_uuid
      ].detail;
    let cur_attrs_item = product_detail.attr_value[attr_index];

    let cur_attr_item = cur_attrs_item.attr[attr_idx];

    if (!cur_attr_item.enable || cur_attr_item.select) {
      return;
    }
    let cur_select = !cur_attr_item.select;
    for (let i = 0, ilen = cur_attrs_item.attr.length; i < ilen; i++) {
      cur_attrs_item.attr[i].select = false;
    }
    cur_attr_item.select = cur_select;
    product_detail.infoTextArr[attr_index] = cur_attr_item.attributeValue;

    // 重新执行sku运算
    product_detail = CateringUtil.skuCore(product_detail);

    CateringUtil.stateSave({ cateringInfo });
  }

  /**
   * Sku核心算法
   * 根据所有计算出当前类别之外的选择 判断按钮的enable ？ false or true
   *
   * @param {object} product_detail 商品详情信息
   */
  static skuCore(product_detail) {
    let attrListIn = product_detail.attr_value;
    // 可选列表
    let enableIds = [];
    let skuListIn = product_detail.sku_info;

    for (let i = 0, ilen = attrListIn.length; i < ilen; i++) {
      // 最外层规格
      let attrListBig = attrListIn[i];
      //当前类别之外的选择列表
      let attrsOtherSelect = [];
      for (let j = 0, jlen = attrListIn.length; j < jlen; j++) {
        let attrListSmall = attrListIn[j];
        if (attrListSmall.id != attrListBig.id) {
          for (let k = 0, klen = attrListSmall.attr.length; k < klen; k++) {
            let attrListSmallAttr = attrListSmall.attr[k];
            if (attrListSmallAttr.enable && attrListSmallAttr.select) {
              attrsOtherSelect.push(attrListSmallAttr);
            }
          }
        }
      }

      for (let z = 0, zlen = skuListIn.length; z < zlen; z++) {
        let ism = true;
        let skuBean = skuListIn[z];
        for (let j = 0, jlen = attrsOtherSelect.length; j < jlen; j++) {
          let enable = false;
          for (let k = 0, klen = skuBean.sku_value.length; k < klen; k++) {
            let goodAttrBean = skuBean.sku_value[k];
            if (
              attrsOtherSelect[j].attributeId == goodAttrBean.attributeId &&
              attrsOtherSelect[j].id == goodAttrBean.attributeValId &&
              skuBean.stock > 0
            ) {
              enable = true;
              break;
            }
          }
          ism = enable && ism;
        }
        if (ism) {
          for (let o = 0, olen = skuBean.sku_value.length; o < olen; o++) {
            let goodAttrBean = skuBean.sku_value[o];
            if (attrListBig.id == goodAttrBean.attributeId) {
              enableIds.push(goodAttrBean.attributeValId);
            }
          }
        }
      }

      for (let s = 0, slen = attrListBig.attr.length; s < slen; s++) {
        let attrItem = attrListBig.attr[s];
        attrItem.enable = enableIds.indexOf(attrItem.id) !== -1;
      }
    }
    return product_detail;
  }

  /**
   * stateSave
   */
  static stateSave({ cateringInfo, cateringCartInfo }) {
    cateringInfo &&
      stateSave({
        type: BaseConstant.CATERING_INFO,
        data: { ...cateringInfo },
      });

    cateringCartInfo &&
      stateSave({
        type: BaseConstant.CATERING_CART_INFO,
        data: {
          ...cateringCartInfo,
        },
      });
  }

  /**
   *  数据初始化
   *
   * @param {function} cb 回调函数
   */
  async initCateringInfo(cb) {
    //初始化一级类目
    // await CateringUtil.getFirstCategoryList(cb);
    //初始化默认二级目录
    // await CateringUtil.getSecondCategoryList(
    //   Object.keys(getState().shop.cateringInfo)[0]
    // );
    //初始化购物车
    // let cart_info = await CateringUtil.getCateringBuycar();

    //同步counter
    // CateringUtil.reflectCounter(cart_info);

    //用本地mock数据初始化列表,存入store
    console.log(22)
    cb && cb(mockData)
    CateringUtil.stateSave({ cateringInfo: { ...mockData } });
  }

  /**
   * 切换分类
   *
   * @param {string} f_category_id 一级类目id
   */
  async switchNav(f_category_id) {
    let { cateringCartInfo } = getState().shop;

    const status = await CateringUtil.getSecondCategoryList(f_category_id);

    if (!status) return;

    //同步当前二级分类列表counter
    CateringUtil.reflectCounter(cateringCartInfo, f_category_id);
  }

  /**
   *  获取商品详情(外部调用)
   *
   * @param {object} paramsObj
   * @param {function} cb 回调函数
   *
   * {
   *   f_category_id: 一级类目id,
   *   s_category_id: 二级类目id,
   *   product_uuid: 商品id
   * }
   */
  async getProDetail(paramsObj, cb) {
    await CateringUtil.getProductDetail(paramsObj);
    cb && cb();
  }

  /**
     * 加入购物车
     *
     * @param {object} paramsObj
     *
     * {
     *   cart_id: 加购商品所属购物车id,
     *   f_category_id: 一级类目id,
     *   s_category_id: 二级类目id,
     *   product_uuid: 商品id,
     *   spec_type: 规格类型,
     *   product_info: 商品信息,
         sku_key: sku_uuid(针对对规格商品快速查找标识)
     *  
     * }
     */

  add({
    cart_id,
    f_category_id,
    s_category_id,
    product_uuid,
    spec_type,
    product_info,
    sku_key,
  }) {
    let { cateringInfo, cateringCartInfo } = getState().shop;
    let cater_product_info =
      cateringInfo[f_category_id].s_category[s_category_id].product_info[
        product_uuid
      ];

    let sku_info_item =
      Number(spec_type) && cater_product_info.detail.sku_info_new[sku_key];

    //分类列表同步counter
    cateringInfo[f_category_id].counter++;
    cater_product_info.counter = product_info.counter + 1;

    const info_key = !Number(spec_type) ? product_uuid : sku_info_item.sku_uuid;

    //sku列表同步counter
    if (Number(spec_type)) {
      sku_info_item.counter++;
    }

    //同步购物车
    if (cateringCartInfo.info[info_key]) {
      //如果该商品存在,则直接修改counter
      cateringCartInfo.info[info_key].counter = !Number(spec_type)
        ? product_info.counter + 1
        : sku_info_item.counter;
    } else {
      cateringCartInfo.info[info_key] = {
        id: cart_id,
        f_category_id,
        s_category_id,
        product_uuid,
        product_name: product_info.product_name,
        counter: !Number(spec_type)
          ? product_info.counter + 1
          : sku_info_item.counter,
        price_current: !Number(spec_type)
          ? product_info.price_current
          : sku_info_item.price_current,
        stock: !Number(spec_type) ? product_info.stock : sku_info_item.stock,
        spec_type: product_info.spec_type,
        sku_uuid: sku_info_item.sku_uuid,
        receiving_type: cater_product_info.shipping_id,
        sku_name: !Number(spec_type) ? "" : sku_info_item.sku_name,
      };
    }

    //同步购物车总价格和总数量
    cateringCartInfo.total_price = (
      parseFloat(cateringCartInfo.total_price) +
      parseFloat(
        !Number(spec_type)
          ? product_info.price_current
          : sku_info_item.price_current
      )
    ).toFixed(2);
    cateringCartInfo.total_count += 1;

    CateringUtil.stateSave({ cateringInfo, cateringCartInfo });
  }

  /**
   * 减购物车
   *
   * @param {object} paramsObj
   * @param {function} cb 回调函数
   *
   * {
   *   f_category_id: 一级类目id,
   *   s_category_id: 二级类目id,
   *   product_uuid: 商品id,
   *   spec_type: 规格类型,
   *   product_info: 商品信息
   *   sku_key: sku_uuid(针对对规格商品快速查找标识)
   * }
   */
  decrease(
    {
      f_category_id,
      s_category_id,
      product_uuid,
      spec_type,
      product_info,
      sku_key,
    },
    cb
  ) {
    let { cateringInfo, cateringCartInfo } = getState().shop;
    let cater_product_info =
      cateringInfo[f_category_id].s_category[s_category_id].product_info[
        product_uuid
      ];
    let sku_info_item =
      Number(spec_type) && cater_product_info.detail.sku_info_new[sku_key];

    //分类列表同步counter
    cateringInfo[f_category_id].counter > 0 &&
      cateringInfo[f_category_id].counter--;

    product_info.counter > 0 &&
      (cater_product_info.counter = product_info.counter - 1);

    const info_key = !Number(spec_type) ? product_uuid : sku_info_item.sku_uuid;

    //sku列表同步counter
    if (Number(spec_type)) {
      sku_info_item.counter > 0 && sku_info_item.counter--;
    }

    //购物车列表同步counter
    if (!cateringCartInfo.info[info_key]) return;
    if (product_info.counter == 1) {
      delete cateringCartInfo.info[info_key];
    } else {
      cateringCartInfo.info[info_key].counter = !Number(spec_type)
        ? product_info.counter - 1
        : sku_info_item.counter;
    }
    console.log(cateringCartInfo.total_price, sku_info_item.price_current);
    //购物车同步总价格和总数量
    cateringCartInfo.total_price = (
      parseFloat(cateringCartInfo.total_price) -
      parseFloat(
        !Number(spec_type)
          ? product_info.price_current
          : sku_info_item.price_current
      )
    ).toFixed(2);

    cateringCartInfo.total_count -= 1;

    cb && cb({ cateringCartInfo });
    CateringUtil.stateSave({ cateringInfo, cateringCartInfo });
  }

  /**
   * 计算sku(外部调用)
   * @param {object} paramObj
   *
   * {
   *   f_category_id: 一级类目id,
   *   s_category_id: 二级类目id,
   *   product_uuid: 商品id,
   *   attr_index: 属性列表索引
   *   attr_idx:   属性索引
   * }
   */
  skuCalc(paramObj) {
    CateringUtil.doSkuCalc(paramObj);
  }

  /**
   * 清空购物车
   */
  handleCleanBuyCar() {
    let { cateringInfo, cateringCartInfo } = getState().shop;

    //清除列表记录
    const cartInfo = cateringCartInfo.info;
    Object.keys(cartInfo).forEach((b_key) => {
      let f_category_item = cateringInfo[cartInfo[b_key].f_category_id];
      let product_item =
        cateringInfo[cartInfo[b_key].f_category_id].s_category[
          cartInfo[b_key].s_category_id
        ].product_info[cartInfo[b_key].product_uuid];

      f_category_item.counter = 0;
      product_item.counter = 0;

      if (Number(cartInfo[b_key].spec_type)) {
        //多规格
        product_item.detail.sku_info_new[cartInfo[b_key].sku_name].counter = 0;
      }
    });
    //清空购物车记录
    cateringCartInfo = {
      info: {},
      total_price: 0,
      total_count: 0,
    };

    CateringUtil.stateSave({ cateringInfo, cateringCartInfo });
  }
}
