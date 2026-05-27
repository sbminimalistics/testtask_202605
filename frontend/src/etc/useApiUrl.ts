import { useAppSelector } from "../store/store";

function useApiUrl() {
    // const [apiUrl, setApiUrl] = useState<string|null>(null);
    const url = useAppSelector((state) => state.api.apiURL);

    // useEffect(() => {
    //     setApiUrl(url);
    // }, [setApiUrl]);
    return url;
}

export default useApiUrl;
