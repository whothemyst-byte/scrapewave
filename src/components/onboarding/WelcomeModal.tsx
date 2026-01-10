import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Zap, Map, Download, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

interface WelcomeModalProps {
    credits: number;
    userName?: string;
}

const steps = [
    {
        icon: Zap,
        title: 'Your Credits',
        description: 'You have 500 free credits to start. Use them to scrape business data.',
        color: 'text-yellow-500',
    },
    {
        icon: Map,
        title: 'Start Scraping',
        description: 'Enter a category and location to find verified business listings.',
        color: 'text-blue-500',
    },
    {
        icon: Download,
        title: 'Export Data',
        description: 'Download your results as CSV or JSON for your projects.',
        color: 'text-emerald-500',
    },
];

export function WelcomeModal({ credits, userName }: WelcomeModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        // Check if user has seen the welcome modal
        const hasSeenWelcome = localStorage.getItem('veriLead_welcome_seen');
        if (!hasSeenWelcome) {
            // Show modal after a short delay
            const timer = setTimeout(() => setIsOpen(true), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem('veriLead_welcome_seen', 'true');
        setIsOpen(false);
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleClose();
        }
    };

    const isLastStep = currentStep === steps.length - 1;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <DialogTitle className="text-xl">
                            {userName ? `Welcome, ${userName}!` : 'Welcome to VeriLead!'}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="py-4">
                    {/* Progress dots */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all ${i === currentStep
                                    ? 'w-8 bg-primary'
                                    : i < currentStep
                                        ? 'bg-primary/50'
                                        : 'bg-muted'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Step content */}
                    <div className="text-center animate-in" key={currentStep}>
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4`}>
                            {(() => {
                                const StepIcon = steps[currentStep].icon;
                                return <StepIcon className={`w-8 h-8 ${steps[currentStep].color}`} />;
                            })()}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{steps[currentStep].title}</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            {steps[currentStep].description}
                        </p>

                        {currentStep === 0 && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold">
                                <Zap className="w-4 h-4" />
                                {credits.toLocaleString()} credits available
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                    <Button variant="ghost" size="sm" onClick={handleClose}>
                        Skip tour
                    </Button>
                    {isLastStep ? (
                        <Link to="/modules/maps" onClick={handleClose}>
                            <Button className="group">
                                Start Scraping
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    ) : (
                        <Button onClick={handleNext}>
                            Next
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                {/* Checklist preview (show on last step) */}
                {isLastStep && (
                    <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-3">Quick start checklist:</p>
                        <div className="space-y-2">
                            {[
                                'Run your first scrape',
                                'Export results to CSV',
                                'Check your credit balance',
                            ].map((item) => (
                                <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <div className="w-4 h-4 rounded-full border border-border" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
