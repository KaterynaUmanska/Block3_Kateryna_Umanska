import { combineReducers } from 'redux';

import user from './user';
import purchaseRecords from './purchaseRecords';

export default combineReducers({
  user,
  purchaseRecords,
});