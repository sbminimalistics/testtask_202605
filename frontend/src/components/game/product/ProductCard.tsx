import { Product } from "../../../types/types.ts";
import { useState } from "react";
import { hideSpinner, showSpinner } from "../../../store/spinnerSlice.ts";
import { useAppDispatch, useAppSelector } from "../../../store/store.ts";
import { fetchQuests, purchaseItem } from "../../../store/thunks.ts";
import styles from "./ProductList.module.css";

type ProductCardProps = {
    product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
    const dispatch = useAppDispatch();
    const gameId = useAppSelector((state) => state.gameInstance.gameId);
    // const [isPurchasing, setIsPurchasing] = useState(false);

    function buyProduct() {
        if (gameId == null) {
            return;
        }
        dispatch(showSpinner());

        dispatch(purchaseItem({ gameId: gameId, itemId: product.id, product }))
            .unwrap()
            .finally(() => {
                dispatch(hideSpinner());
                dispatch(fetchQuests({ gameId: gameId }));
            });
    }

    return (
        <div
            className={
                "content_box box_border " +
                styles["product-card-wrapper"]
                // (isPurchasing ? " opacity-40" : "")
            }
        >
            <div className={styles["product-card"]}>
                <div className="text-xs">{`${product.name}`}</div>
                <div className="text-xs">{`price: ${product.cost}`}</div>
            </div>

            <button
                onClick={() => {
                    buyProduct();
                    // setIsPurchasing(true);
                }}
                className="content_button"
                // disabled={isPurchasing}
            >
                buy
            </button>
        </div>
    );
}
