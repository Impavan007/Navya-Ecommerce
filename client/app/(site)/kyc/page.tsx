"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StepIndicator from "./components/stepIndicator";
import Step1Intro from "./components/Step1Intro";
import Step2Document from "./components/Step2DocumentUpload";
import Step3SelfieIntro from "./components/Step3SelfieIntro";
import Step4SelfieCapture from "./components/Step4CameraCapture";
import Step5Success from "./components/Step5Success";

export default function KYCPage() {
  const [step, setStep] = useState(1);

  const next = () => setStep((prev) => prev + 1);

  return (
    <div className="min-h-screen w-full bg-[#F6F3F1] flex flex-col overflow-x-hidden">

      <div className="w-full bg-white shadow-sm pb-8 border-b border-gray-100">
        <StepIndicator currentStep={step} />
      </div>

      <main className="flex-1 flex items-start sm:items-center justify-center p-4 sm:p-6 md:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full max-w-4xl flex justify-center bg-white sm:bg-transparent rounded-3xl p-4 sm:p-0 shadow-xl sm:shadow-none"
          >
            {step === 1 && <Step1Intro onNext={next} />}
            {step === 2 && <Step2Document onNext={next} />}
            {step === 3 && <Step3SelfieIntro onNext={next} />}
            {step === 4 && <Step4SelfieCapture onNext={next} />}
            {step === 5 && <Step5Success />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
