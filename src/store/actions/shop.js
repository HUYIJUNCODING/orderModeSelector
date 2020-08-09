import constants from "../constants/shop";

export const updateCateringInfo = options=> ({
    type: constants.CATERING_INFO,
    data: {
        ...options
    }
})

export const updateCateringCartInfo = options=> ({
    type: constants.CATERING_BUYCAR_INFO,
    data: {
        ...options
    }
})