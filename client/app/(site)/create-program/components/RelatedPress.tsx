import Image from "next/image";

const RelatedPress = () => {
  const pressArticles = [
    {
      source: "VOGUE",
      title: "How Renting is Revolutionizing the Way We View Luxury",
      description: "Navyaa is leading the transition to a sustainable fashion economy through innovative peer-to-peer sharing.",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1020&auto=format&fit=crop"
    },
    {
      source: "ELLE",
      title: "Sustainability in the Trend World: Why Rental is the Future",
      description: "The platform empowers individuals to monetize their wardrobes while providing access to high-end designer pieces.",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
    },
    {
      source: "BUSINESS INSIDER",
      title: "The New Rule of Empowerment: Designer Fashion for All",
      description: "Technology is bridging the gap between desire and access, creating a seamless experience for lenders and renters.",
      image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=2070&auto=format&fit=crop"
    }
  ];

  return (
    <section className="w-full bg-white py-24 px-[20px] md:px-[60px] lg:px-[100px]">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-canela text-[40px] md:text-[56px] text-[#3D1126] mb-4 font-medium">
            Related Press Coverage
          </h2>
          <p className="font-poppins text-[#3D1126] text-lg">
            Navyaa's latest highlights and features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mx-auto">
          {pressArticles.map((article, index) => (
            <div key={index} className="flex flex-col group cursor-pointer border border-[#E5E5E5] rounded-[4px] overflow-hidden">
              <div className="relative w-full aspect-[4/3] overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-8 flex flex-col gap-4">
                <span className="font-poppins font-bold text-[12px] tracking-[0.1em] text-[#3D1126] uppercase">
                  {article.source}
                </span>
                <h3 className="font-canela text-[24px] md:text-[28px] text-[#3D1126] leading-[1.3] font-medium">
                  {article.title}
                </h3>
                <p className="font-poppins text-[#3D1126] text-[15px] leading-[1.6]">
                  {article.description}
                </p>
                <div className="mt-2 flex items-center gap-2 font-poppins font-bold text-[16px] text-[#3D1126]">
                  Read Article <span>→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedPress;
