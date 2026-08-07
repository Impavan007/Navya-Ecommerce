"use client";

import SearchProductsPage from "./products/search";
import { Suspense } from "react";


export default function SearchProductsPageWrapper() {
 return(
   <div>
    <Suspense fallback={<div>Loading search results...</div>}>
      <SearchProductsPage/>
    </Suspense>
   </div>
 );
}

