import { SYS_INFO } from "../constants/app.js";

const INITIAL_STATE = {
  sysInfo: {}, //设备信息
};

export default function app(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SYS_INFO:
      state.sysInfo = { ...action.data };
      return state;
    default:
      return state;
  }
}
