import Image from "next/image";

const ArticleContent = () => {
  return (
    <section className="w-full flex justify-center bg-white pb-20">
      <div className=" mx-auto  px-[20px] md:px-[60px] lg:px-[100px]">
        <div className="max-w-[1400px]">
          {/* Section 1 */}
          <div className="mb-12">
            <h2 className="font-canela text-[32px] md:text-[36px] text-[#3D1126] mb-6 font-medium">
              The Rise of Fashion Rental
            </h2>
            <div className="font-poppins text-[#3D1126] text-[16px] leading-[1.8] space-y-6">
              <p>
                In recent years, the fashion industry has seen a massive shift in how consumers interact with luxury brands. The emergence of fashion rental platforms has redefined the concept of ownership, allowing fashion enthusiasts to access premium pieces without the long-term commitment and high price tags.
              </p>
              <p>
                This trend is not just about affordability; it's also about variety and the thrill of wearing something new for every occasion. As the community continues to grow, these platforms are becoming a staple in every fashion-forward individual's wardrobe.
              </p>
              <p>
                As we look to the future, the rise of fashion rental continues to build a more sustainable and accessible ecosystem for fashion lovers everywhere. Platforms like Navyaa are at the forefront of this movement, providing a seamless and high-end experience for both lenders and borrowers alike.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="mb-12">
            <h2 className="font-canela text-[32px] md:text-[36px] text-[#3D1126] mb-6 font-medium">
              Community Powered Wardrobes
            </h2>
            <div className="font-poppins text-[#3D1126] text-[16px] leading-[1.8] space-y-6">
              <p>
                At the heart of the rental revolution is the community. By sharing their own personal collections, individuals are not only earning from their wardrobes but also allowing others to experience the joy of luxury fashion. This circular economy is what powers Navyaa.
              </p>
              <p>
                The platform provides a secure and efficient way for users to list their items and manage rentals, ensuring that every piece is well-cared for and reaches someone who will truly appreciate it. This trust-based system is essential for the long-term success of the peer-to-peer rental model.
              </p>
              <p>
                "We believe that the future of fashion is collaborative. By sharing our collections, we're not only being more conscious of our consumption but also building a community of fashion-forward individuals who value style and sustainability equally."
              </p>
            </div>
          </div>

          {/* Inline Image */}
          <div className="relative w-full aspect-[16/7] rounded-[4px] overflow-hidden my-16">
            <Image
              src="/assets/IMG-59.svg"
              alt="Woman in fashion"
              fill
              className="object-cover"
            />
          </div>

          {/* Section 3 */}
          <div className="mb-12">
            <h2 className="font-canela text-[32px] md:text-[36px] text-[#3D1126] mb-6 font-medium">
              Sustainability in Fashion
            </h2>
            <div className="font-poppins text-[#3D1126] text-[16px] leading-[1.8] space-y-6">
              <p>
                Sustainability is no longer just a buzzword; it's a necessity. The fashion industry is one of the most resource-intensive industries, and the shift towards rental models is a significant step in reducing the environmental impact of our fashion choices.
              </p>
              <p>
                By extending the life of every garment, we're reducing waste and the need for new production. This is at the core of Navyaa's mission: to make luxury fashion accessible in a way that is also kind to our planet.
              </p>
              <p>
                Every rental contributes to a more sustainable future. As more people join the movement, we're seeing a real impact on how fashion is consumed and valued. It's an exciting time to be part of this community-driven change.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArticleContent;
