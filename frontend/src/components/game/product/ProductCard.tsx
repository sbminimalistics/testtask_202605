import { Product, PurchaseResponse } from "../../../types/types.ts";
import { useState } from "react";
import ProductDetailsDialog from "./ProductDetailsDialog.tsx";
import { hideSpinner, showSpinner } from "../../../store/spinnerSlice.ts";
import { useAppDispatch, useAppSelector } from "../../../store/store.ts";
import { fetchQuests, purchaseItem } from "../../../store/thunks.ts";
import PurchaseResponseDialog from "./PurchaseResponseDialog.tsx";
import styles from "./ProductList.module.css";

type ProductCardProps = {
    product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
    const [productPopup, setProductPopup] = useState<boolean>(false);
    const [purchaseResponse, setPurchaseResponse] =
        useState<PurchaseResponse | null>(null);
    const dispatch = useAppDispatch();
    const gameId = useAppSelector((state) => state.gameInstance.gameId);

    function onViewClick() {
        setProductPopup(true);
    }

    function buyProduct() {
        dispatch(showSpinner());

        dispatch(purchaseItem({ gameId: gameId!, itemId: product.id, product }))
            .unwrap()
            .then((purchaseResponse) => {
                setProductPopup(false);
                setPurchaseResponse(purchaseResponse);
            })
            .finally(() => {
                dispatch(hideSpinner());
                dispatch(fetchQuests(gameId!));
            });
    }

    function onPurchaseResponseClose() {
        setPurchaseResponse(null);
    }

    return (
        <div
            className={
                "content_box box_border " + styles["product-card-wrapper"]
            }
        >
            <div className={styles["product-card"]}>
                {/* <button
                    onClick={() => onViewClick()}
                    className={styles["task-button"]}
                >
                    <span className={styles["product-name"]}>
                        {product.name}
                    </span>
                    <span className={styles["product-price"]}>
                        {product.cost}
                    </span>
                </button> */}
                <div className="text-xs">{`${product.name}`}</div>
                <div className="text-xs">{`price: ${product.cost}`}</div>
            </div>

            <button
                onClick={() => {
                    onViewClick();
                }}
                className="content_button"
            >
                buy
            </button>

            {productPopup && (
                <ProductDetailsDialog
                    product={product}
                    onCancel={() => setProductPopup(false)}
                    onAccept={() => buyProduct()}
                />
            )}

            {purchaseResponse && (
                <PurchaseResponseDialog
                    purchaseResponse={purchaseResponse}
                    onClose={() => onPurchaseResponseClose()}
                />
            )}
        </div>
    );
}
