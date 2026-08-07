interface Props {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: Props) {
  return (
    <div className="w-full pt-8 md:pt-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">

        <div className="relative flex justify-between items-center">


          {/* Line (centered through circles) */}
          <div className="absolute bottom-2.5 left-0 w-full h-[2px] bg-[#D8D8D8] translate-y-1/2" />

          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex flex-col-reverse relative z-10 
                ${step === 1 ? 'items-start' : step === 3 ? 'items-end' : 'items-center'}`}
            >

              {/* Circle */}
              <div
                className={`w-5 h-5 rounded-full border-2
                  ${currentStep >= step
                    ? "bg-[#1A1A1A] border-[#3D1126]"
                    : "bg-[#C7C7C7] border-[#C7C7C7]"
                  }`}
              />

              {/* Label */}
              <span className="text-xs mb-2 text-[#3D1126]">
                {step} Step
              </span>
            </div>
          ))}

        </div>
      </div>
    </div >
  );
}
