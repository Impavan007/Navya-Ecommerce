import FeaturedPress from "./components/FeaturedPress";
import MediaMentions from "./components/MediaMentions";
import PressEnquiries from "./components/PressEnquiries";
import PressHero from "./components/PressHero";
import PressResources from "./components/PressResources";

const PressPage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-white overflow-x-hidden">

            <main className="flex-grow">
                <PressHero />
                <FeaturedPress />
                <MediaMentions />
                <PressResources />
                <PressEnquiries />
            </main>

        </div>
    );
};

export default PressPage;
