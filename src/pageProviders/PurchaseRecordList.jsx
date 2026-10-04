import React from 'react';
import PurchaseRecordListPage from 'pages/purchaseRecords';
import PageContainer from './components/PageContainer';

const PurchaseRecordList = (props) => (
    <PageContainer>
        <PurchaseRecordListPage {...props} />
    </PageContainer>
);

export default PurchaseRecordList;