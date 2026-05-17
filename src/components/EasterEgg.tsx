"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from 'next/dynamic';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });
const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export function EasterEgg() {
    const [showConfetti, setShowConfetti] = useState(false);
    const [inputSequence, setInputSequence] = useState<string[]>([]);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        // Set dimensions on client side only
        setDimensions({
            width: window.innerWidth,
            height: window.innerHeight
        });

        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const triggerEasterEgg = useCallback(() => {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key;

            setInputSequence((prev) => {
                const updated = [...prev, key].slice(-KONAMI_CODE.length);

                if (JSON.stringify(updated) === JSON.stringify(KONAMI_CODE)) {
                    triggerEasterEgg();
                    return [];
                }

                return updated;
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [triggerEasterEgg]);

    if (!showConfetti) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[100]">
            <Confetti width={dimensions.width} height={dimensions.height} />
        </div>
    );
}
