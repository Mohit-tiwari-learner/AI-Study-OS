import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  Target,
  Calendar as CalendarIcon,
  Brain,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

const steps = [
  {
    id: "education",
    title: "Where are you in your journey?",
    description: "This helps us tailor the AI's complexity to your level.",
    icon: GraduationCap,
  },
  {
    id: "details",
    title: "What are you studying?",
    description: "Tell us your current class and primary subjects.",
    icon: BookOpen,
  },
  {
    id: "goals",
    title: "What's your main objective?",
    description: "We'll prioritize tools that match your study style.",
    icon: Target,
  },
  {
    id: "style",
    title: "Preferred learning style?",
    description: "How should the AI explain things to you?",
    icon: Brain,
  },
];

export function OnboardingFlow() {
  const { user, completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    education: "",
    class: "",
    subjects: "",
    goal: "",
    examDate: undefined as Date | undefined,
    learningStyle: "detailed",
  });

  if (!user || user.onboardingCompleted) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding(formData);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl nm-flat p-8 sm:p-12 relative overflow-hidden"
      >
        {/* Background Accents */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-violet/5 blur-3xl" />

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 nm-inset rounded-lg text-primary">
                {React.createElement(steps[currentStep].icon, { className: "h-5 w-5" })}
              </div>
              <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <button
              onClick={() => completeOnboarding(formData)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              Skip for now
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl font-display font-black tracking-tight mb-3">
                {steps[currentStep].title}
              </h2>
              <p className="text-muted-foreground mb-8">{steps[currentStep].description}</p>

              {/* Step Content */}
              <div className="min-h-[280px]">
                {currentStep === 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {["School", "College", "Graduate", "Professional"].map((level) => (
                      <button
                        key={level}
                        onClick={() => updateField("education", level)}
                        className={cn(
                          "nm-button p-6 text-left group transition-all",
                          formData.education === level &&
                            "nm-inset text-primary ring-2 ring-primary/20",
                        )}
                      >
                        <CheckCircle2
                          className={cn(
                            "h-4 w-4 mb-3 transition-opacity",
                            formData.education === level ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span className="font-bold">{level}</span>
                      </button>
                    ))}
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                        Current Class / Year
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Class 10, 2nd Year B.Tech"
                        value={formData.class}
                        onChange={(e) => updateField("class", e.target.value)}
                        className="w-full nm-inset p-4 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                        Subjects / Field of Study
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Science, Engineering, Arts"
                        value={formData.subjects}
                        onChange={(e) => updateField("subjects", e.target.value)}
                        className="w-full nm-inset p-4 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-xl"
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {["Exam Prep", "Concept Learning", "Daily Study"].map((goal) => (
                        <button
                          key={goal}
                          onClick={() => updateField("goal", goal)}
                          className={cn(
                            "nm-button p-4 text-sm font-bold transition-all",
                            formData.goal === goal && "nm-inset text-primary",
                          )}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>

                    <div className="pt-4 space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                        Upcoming Exam Date (Optional)
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal nm-inset h-14 rounded-xl border-none",
                              !formData.examDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.examDate ? (
                              format(formData.examDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.examDate}
                            onSelect={(date) => updateField("examDate", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      {
                        id: "simple",
                        title: "Simple Explanations",
                        desc: "Break things down like I'm 5.",
                      },
                      {
                        id: "detailed",
                        title: "Detailed & Academic",
                        desc: "Give me all the depth and complexity.",
                      },
                      {
                        id: "hinglish",
                        title: "Hinglish Mode",
                        desc: "Mix Hindi and English for better understanding.",
                      },
                    ].map((style) => (
                      <button
                        key={style.id}
                        onClick={() => updateField("learningStyle", style.id)}
                        className={cn(
                          "nm-button p-5 text-left flex items-center justify-between group transition-all",
                          formData.learningStyle === style.id && "nm-inset border-primary/20",
                        )}
                      >
                        <div>
                          <p
                            className={cn(
                              "font-bold",
                              formData.learningStyle === style.id && "text-primary",
                            )}
                          >
                            {style.title}
                          </p>
                          <p className="text-xs text-muted-foreground">{style.desc}</p>
                        </div>
                        {formData.learningStyle === style.id && (
                          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-12 flex items-center justify-between">
                <button
                  onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
                  disabled={currentStep === 0}
                  className={cn(
                    "text-sm font-bold text-muted-foreground hover:text-foreground transition-colors",
                    currentStep === 0 && "opacity-0 pointer-events-none",
                  )}
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  className="nm-button px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl flex items-center gap-2 group hover:scale-[1.02] active:scale-[0.98] transition-all"
                  style={{ background: "var(--gradient-primary)", color: "white" }}
                >
                  {currentStep === steps.length - 1 ? "Complete Setup" : "Next Step"}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
