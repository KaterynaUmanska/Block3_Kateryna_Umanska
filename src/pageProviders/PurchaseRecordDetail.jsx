import React from 'react';
import PurchaseRecordDetailPage from 'pages/purchaseRecords/Detail';
import PageContainer from './components/PageContainer';

const PurchaseRecordDetail = (props) => (
    <PageContainer>
        <PurchaseRecordDetailPage {...props} />
    </PageContainer>
);

export default PurchaseRecordDetail;