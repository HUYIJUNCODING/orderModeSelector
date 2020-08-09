import configStore from "./index";

const store = configStore();

/**
 * 获取store实例
 */
export function getStore() {
  return store;
}

/**
 * 获取state
 */
export function getState() {
  return store.getState();
}

/**
 * 快速存储state
 * @param {object} action action
 */
export function stateSave(action) {
  store.dispatch({
    type: action.type,
    data: action.data,
  });
}
