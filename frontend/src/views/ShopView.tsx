import ProductList from "../components/game/product/ProductList";
import ViewHeader from "./ViewHeader";

export default function ShopView() {
    return (
        <section
            className={
                "content_box justify-items-start flex flex-col items-start gap-2"
            }
        >
            <ViewHeader title="shop" />
            <ProductList />
        </section>
    );
}
