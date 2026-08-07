'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FAQItem {
  id: number
  question: string
  answer: string
}

interface FAQProps {
  items: FAQItem[]
}

export default function FAQ({ items }: FAQProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  const toggleItem = (id: number) => {
    const newOpenItems = new Set(openItems)

    if (newOpenItems.has(id)) {
      newOpenItems.delete(id)
    } else {
      newOpenItems.add(id)
    }

    setOpenItems(newOpenItems)
  }

  return (
    <div className="mx-auto space-y-5">
      {items.map((item) => {
        const isOpen = openItems.has(item.id)

        return (
          <div
            key={item.id}
            className={`transition-colors duration-300 ${isOpen ? 'bg-[#F3D6DC]' : 'bg-[#F1F1F1]'
              }`}
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="flex justify-between items-center w-full px-8 py-6 text-left focus:outline-none active:bg-transparent focus:bg-transparent"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <h3 className="font-['Poppins'] text-[16px] font-medium text-[#000000] pr-6">
                {item.question}
              </h3>

              {/* Icon Box */}
              <div className="flex items-center justify-center w-10 h-10 bg-[#F3D6DC]">
                <motion.div
                  initial={false}
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {isOpen ? (
                    <X className="w-[24px] h-[24px] text-[#000000]" />
                  ) : (
                    <Plus className="w-[24px] h-[24px] text-[#000000]" />
                  )}
                </motion.div>
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-8 pb-6">
                    <p className="font-['Poppins'] text-[16px] text-[#6D6D6D] leading-relaxed max-w-3xl">
                      {item.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}