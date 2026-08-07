'use client';

export default function ItemUploadCriteria() {
  return (
      <div className="max-w-4xl w-full bg-white border border-gray-200 shadow-sm p-8 sm:p-12">
        <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-8 border-b border-gray-200 pb-4">
          Item Upload Criteria
        </h1>

        <div className="space-y-8 text-gray-800 font-poppins text-[15px] leading-relaxed">
          {/* 1. Item Condition */}
          <section>
            <h2 className="text-xl font-semibold font-playfair text-gray-900 mb-3">1. Item Condition</h2>
            <ul className="space-y-3 list-disc list-inside">
              <li>
                <span className="font-semibold">Must Be In Good Condition:</span><br />
                List items that are clean, well-maintained, and free from damage. Only list items that are wearable and in good condition.
              </li>
              <li>
                <span className="font-semibold">No Visible Damage:</span><br />
                Items with tears, stains, or excessive wear are not allowed. Please ensure the item is free of any noticeable defects.
              </li>
            </ul>
          </section>

          {/* 2. Authenticity */}
          <section>
            <h2 className="text-xl font-semibold font-playfair text-gray-900 mb-3">2. Authenticity</h2>
            <ul className="space-y-3 list-disc list-inside">
              <li>
                <span className="font-semibold">Authenticity Required For High-Value Items:</span><br />
                If you're listing a designer item, luxury brand, or high-value product, you must provide proof of authenticity (e.g., receipts, tags, or authenticity certificates).
              </li>
              <li>
                <span className="font-semibold">No Counterfeit Items:</span><br />
                Counterfeit items are strictly prohibited. Make sure your items are genuine and come with proper verification if applicable.
              </li>
            </ul>
          </section>

          {/* 3. Item Information */}
          <section>
            <h2 className="text-xl font-semibold font-playfair text-gray-900 mb-3">3. Item Information</h2>
            <ul className="space-y-3 list-disc list-inside">
              <li>
                <span className="font-semibold">Title</span><br />
                Provide a Clear Title — Use a simple, descriptive title that highlights the item’s key features (e.g., ‘Black Velvet Evening Dress’, ‘Men’s Leather Jacket’).
              </li>
              <li>
                <span className="font-semibold">Description</span><br />
                Include essential details like material, fit, brand, occasion, and any other relevant information. The more detailed your description, the easier it will be for Borrowers to make a decision.
              </li>
              <li>
                <span className="font-semibold">Size Information:</span><br />
                List the available sizes for your item (e.g., EU34, EU36 etc.). Provide size details to help Borrowers select the right fit.
              </li>
              <li>
                <span className="font-semibold">Fit Description:</span><br />
                Let Borrowers know how the item fits (e.g., runs small, true to size, oversized).
              </li>
            </ul>
          </section>

          {/* 4. Availability */}
          <section>
            <h2 className="text-xl font-semibold font-playfair text-gray-900 mb-3">4. Availability</h2>
            <ul className="space-y-3 list-disc list-inside">
              <li>
                <span className="font-semibold">Rental Period:</span><br />
                You can offer your item for different rental periods: 4 days, 7 days, 14 days, or 30 days. Choose the rental duration that fits your item and your schedule.
              </li>
              <li>
                <span className="font-semibold">Blocked Dates:</span><br />
                If your item is unavailable for specific dates (e.g., personal use, out for maintenance), you can block those dates in the calendar.
              </li>
            </ul>
          </section>

          {/* 5. Shipping And Returns */}
          <section>
            <h2 className="text-xl font-semibold font-playfair text-gray-900 mb-3">5. Shipping And Returns</h2>
            <ul className="space-y-3 list-disc list-inside">
              <li>
                <span className="font-semibold">Shipping Time:</span><br />
                Ensure the item can be shipped within 2–3 days after a booking is confirmed. Make sure to include this in the availability.
              </li>
              <li>
                <span className="font-semibold">Return Instructions:</span><br />
                Provide clear instructions for Borrowers on how to return the item after the rental period ends. You can include a return label to simplify the process.
              </li>
            </ul>
          </section>

          {/* 6. Supplier Profile Completeness */}
          <div>
            <h2 className="text-xl font-semibold font-playfair text-gray-900 mb-3">6. Supplier Profile Completeness</h2>
            <ul className="list-disc pl-5 text-gray-600 font-sans space-y-2">
              <li>
                Make sure your Supplier profile is complete, including contact details and payment information, to enable smooth transactions.
              </li>
            </ul>
          </div>
        </div>
      </div>
 
  );
}
