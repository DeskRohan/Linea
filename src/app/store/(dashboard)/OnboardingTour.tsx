
"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import {
  LayoutDashboard,
  Boxes,
  BarChart3,
  Users,
} from "lucide-react";

const tourSteps = [
  {
    icon: LayoutDashboard,
    title: "Welcome to Your Dashboard!",
    description: "This is your main hub. Here, you'll see a quick overview of your total revenue, recent sales, and new customers in real-time.",
    highlight: "Dashboard"
  },
  {
    icon: Boxes,
    title: "Manage Your Inventory",
    description: "The Inventory tab is where you can add new products, update prices and stock levels, and delete items. This is the backbone of your store.",
    highlight: "Inventory"
  },
  {
    icon: BarChart3,
    title: "Track Your Analytics",
    description: "Dive deep into your sales data. The Analytics page shows you monthly sales trends, your top-performing products, and your busiest days.",
    highlight: "Analytics"
  },
  {
    icon: Users,
    title: "Know Your Customers",
    description: "The Customers page lists everyone who has made a purchase, showing you who your most valuable customers are based on their total spending.",
    highlight: "Customers"
  },
];

interface OnboardingTourProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export default function OnboardingTour({ open, onOpenChange, onComplete }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const CurrentIcon = tourSteps[step].icon;

  const handleNext = () => {
    if (step < tourSteps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <CurrentIcon className="h-12 w-12 text-primary" />
          </div>
          <SheetTitle className="text-2xl font-bold">{tourSteps[step].title}</SheetTitle>
          <SheetDescription className="text-base text-muted-foreground max-w-xl mx-auto">
            {tourSteps[step].description}
          </SheetDescription>
        </SheetHeader>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 my-8">
            {tourSteps.map((_, index) => (
                <div key={index} className={`h-2 w-2 rounded-full transition-all ${step === index ? 'w-6 bg-primary' : 'bg-muted'}`} />
            ))}
        </div>

        <SheetFooter className="flex-row sm:justify-between items-center">
            <Button variant="ghost" onClick={onComplete}>
                Skip Tour
            </Button>
            <div className="flex gap-4">
                <Button variant="outline" onClick={handlePrev} disabled={step === 0}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                </Button>
                <Button onClick={handleNext}>
                    {step === tourSteps.length - 1 ? (
                        <>
                        Finish <CheckCircle className="ml-2 h-4 w-4" />
                        </>
                    ) : (
                       <>
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                       </>
                    )}
                </Button>
            </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
