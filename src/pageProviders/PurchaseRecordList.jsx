import PurchaseRecordListPage from 'pages/purchaseRecords';
import React from 'react';

import PageContainer from './components/PageContainer';

const PurchaseRecordList = (props) => {
    return (
        <PageContainer>
            <PurchaseRecordListPage {...props} />
        </PageContainer>
    );
};

export default PurchaseRecordList;
