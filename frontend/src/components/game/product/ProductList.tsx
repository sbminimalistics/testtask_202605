import { useAppDispatch, useAppSelector } from "../../../store/store.ts";
import { Product } from "../../../types/types.ts";
import { useCallback, useEffect, useState } from "react";
import ProductCard from "./ProductCard.tsx";
import styles from "./ProductList.module.css";
import { hideSpinner, showSpinner } from "../../../store/spinnerSlice.ts";
import useApiUrl from "../../../etc/useApiUrl.ts";

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const gameId = useAppSelector((state) => state.gameInstance.gameId);
    const apiUrl = useApiUrl();

    // const [loading, setLoading] = useState<boolean>(true);
    const dispatch = useAppDispatch();

    function onRefreshShopClick() {
        fetchProducts(gameId!);
    }

    const fetchProducts = useCallback(
        (gameId: string) => {
            // setLoading(true);
            dispatch(showSpinner());

            fetch(`${apiUrl}/${gameId}/shop`)
                .then((response) => response.json())
                .then((data) => setProducts(data as Product[]))
                .finally(() => {
                    // setLoading(false);
                    dispatch(hideSpinner());
                });
        },
        [dispatch]
    );

    useEffect(() => {
        if (gameId == null) {
            return;
        }
        fetchProducts(gameId!);
    }, [fetchProducts, gameId]);

    return (
        <section className={styles["product-list"]}>
            <h5>
                Shop{" "}
                <button
                    onClick={() => onRefreshShopClick()}
                    className="content_button"
                >
                    refresh
                </button>
            </h5>
            {/*{loading && <div>loading</div>}*/}
            {products.map((product) => (
                <ProductCard key={`product-${product.id}`} product={product} />
            ))}
        </section>
    );
}
