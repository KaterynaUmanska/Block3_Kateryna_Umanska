import axios from './index';

const getPurchaseRecord = (id) =>
    axios.get(`/api/purchases/${id}`);

const createPurchaseRecord = (data) =>
    axios.post('/api/purchases', data);

const updatePurchaseRecord = (id, data) =>
    axios.put(`/api/purchases/${id}`, data);

const deletePurchaseRecord = (id) =>
    axios.delete(`/api/purchases/${id}`);

const getPurchaseRecords = (data) =>
    axios.post('/api/purchases/_list', data);

const getMaterials = () =>
    axios.get('/api/materials');


export {
    getPurchaseRecord,
    createPurchaseRecord,
    updatePurchaseRecord,
    deletePurchaseRecord,
    getPurchaseRecords,
    getMaterials,
};