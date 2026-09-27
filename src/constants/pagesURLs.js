import * as pages from './pages';
import config from 'config';

const result = {
  [pages.defaultPage]: `${config.UI_URL_PREFIX}/${pages.defaultPage}`,
  [pages.login]: `${config.UI_URL_PREFIX}/${pages.login}`,
  [pages.secretPage]: `${config.UI_URL_PREFIX}/${pages.secretPage}`,

  [pages.purchaseRecords]: `${config.UI_URL_PREFIX}/purchase-records`,
  [pages.purchaseRecordDetail]: `${config.UI_URL_PREFIX}/purchase-records/:id`,
};

export default result;
