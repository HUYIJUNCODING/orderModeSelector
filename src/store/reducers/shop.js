import constants from "../constants/shop";

const INITIAL_STATE = {
    cateringInfo: {}, //商品列表
    cateringCartInfo: { //购物车列表
        info: {},
        total_price: 0,
        total_count: 0,
    }
};

export default function shop(state = INITIAL_STATE, action) {
    switch (action.type) {
        case constants.CATERING_INFO:
            state.cateringInfo = {...action.data};
            return {...state};
        case constants.CATERING_CART_INFO:
            state.cateringCartInfo = {...action.data};
            return {...state};
        default:
            return state;
    }
}
