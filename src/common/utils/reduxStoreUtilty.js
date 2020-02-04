import { createStore } from 'redux';
import {setDataReduxSate} from '../../common/store/commonReduxStoreReducer'

export const store = createStore(setDataReduxSate);