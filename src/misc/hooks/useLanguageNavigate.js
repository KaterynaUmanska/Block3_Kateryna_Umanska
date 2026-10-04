import { useLocation, useNavigate } from 'react-router-dom';

function useLanguageNavigate() {
    const navigate = useNavigate();
    const location = useLocation();

    const navigateWithLanguage = (to, options = {}) => {
        const currentParams = new URLSearchParams(
            location.search
        );

        const lang = currentParams.get('lang');

        if (lang) {
            const [path, search = ''] = to.split('?');

            const params = new URLSearchParams(search);

            params.set('lang', lang);

            to = `${path}?${params.toString()}`;
        }

        navigate(to, options);
    };

    return navigateWithLanguage;
}

export default useLanguageNavigate;