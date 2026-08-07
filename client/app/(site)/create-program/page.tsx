'use client'
import React from "react";
import HeroSection from "./components/HeroSection";
import ArticleContent from "./components/ArticleContent";
import QuoteSection from "./components/QuoteSection";
import RelatedPress from "./components/RelatedPress";
import ContactForm from "./components/ContactForm";

const CreateProgramMakePage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-white overflow-x-hidden">
            <main className="flex-grow">
                <HeroSection />
                <ArticleContent />
                <QuoteSection />
                <RelatedPress />
                <ContactForm />
            </main>
        </div>
    );
};

export default CreateProgramMakePage;
