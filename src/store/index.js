import createStore from './reducerMap'

import rootReducer from './reducers'

export default function configStore (){
    return createStore(rootReducer);
}
