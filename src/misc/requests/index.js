import axios from 'axios';
import storage, { keys } from '../storage';

axios.interceptors.request.use((params) => {
    const token = storage.getItem(keys.TOKEN);
    if (token) {
        params.headers.setAuthorization(`Bearer ${token}`);
    }
    return params;
});

const addAxiosInterceptors = ({
                                  onSignOut,
                              }) => {
    axios.interceptors.response.use(
        (response) => response.data,
        (error) => {
            const errorData = error.response?.data;
            if (
                Array.isArray(errorData) &&
                errorData.some(beError => beError?.code === 'INVALID_TOKEN')
            ) {
                onSignOut();
            }
            throw errorData;
        }
    );
};

export {
    addAxiosInterceptors,
};

export default axios;