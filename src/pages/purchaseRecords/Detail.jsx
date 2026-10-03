import React, { useMemo } from 'react';
import IntlProvider from 'misc/providers/IntlProvider';
import useLocationSearch from 'misc/hooks/useLocationSearch';

import getMessages from './intl';
import PurchaseRecordDetail from "./containers/PurchaseRecordDetail";

function Detail(props) {
    const {
        lang,
    } = useLocationSearch();
    const messages = useMemo(() => getMessages(lang), [lang]);
    return (
        <IntlProvider messages={messages}>
            <PurchaseRecordDetail {...props} />
        </IntlProvider>
    );
}

export default Detail;