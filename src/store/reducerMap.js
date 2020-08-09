import {applyMiddleware, combineReducers, compose, createStore} from 'redux'
import thunkMiddleware from 'redux-thunk'

const composeEnhancers =
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
            // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
        }) : compose;

const middlewares = [
    thunkMiddleware
];

if (process.env.NODE_ENV === 'development') {
    middlewares.push(require('redux-logger').createLogger())
}

const enhancer = composeEnhancers(
    applyMiddleware(...middlewares),
    // other store enhancers if any
);

export default reducerMap => {

    const injectAsyncReducers = (store, name, reducers) =>  {
        // add our new reducers under the name we provide
        store.asyncReducers[name] = combineReducers(reducers);
        // replace all of the reducers in the store, including our new ones
        store.replaceReducer(
            combineReducers({
                ...reducerMap,
                ...store.asyncReducers
            })
        );
    };

    const store = createStore(reducerMap,enhancer);
    store.asyncReducers = {};
    // add the method that will allow us to add new reducers under a given namespace
    store.registerDynamicModule = ({ name, reducers }) => {
        console.info(`Registering module reducers for ${name}`);
        injectAsyncReducers(store, name, reducers);
    };
    // add a method to unhook our reducers. This stops our reducer state from updating any more.
    store.unRegisterDynamicModule = name => {
        console.info(`Unregistering module reducers for ${name}`);
        const noopReducer = (state = {}) => state;
        injectAsyncReducers(store, name, noopReducer);
    };

    return store;
}
