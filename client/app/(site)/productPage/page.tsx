import { Suspense } from "react";
import ProductsPageFile from "./ProductPageFile";
import { ShimmerProductGrid } from "../components/Shimmer";

export default function ProductsPage() {
  return (
    <Suspense fallback={<ShimmerProductGrid count={6} />}>
      <ProductsPageFile />
    </Suspense>
  );
}
