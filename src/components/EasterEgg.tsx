"use client";

import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

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

    // Konami Code: Up, Up, Down, Down, Left, Right, Left, Right, B, A
    const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key;

            setInputSequence((prev) => {
                const updated = [...prev, key];

                // Check if updated sequence matches the end of Konami Code
                if (updated.length > KONAMI_CODE.length) {
                    updated.shift();
                }

                if (JSON.stringify(updated) === JSON.stringify(KONAMI_CODE)) {
                    triggerEasterEgg();
                    return [];
                }

                return updated;
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const triggerEasterEgg = () => {
        setShowConfetti(true);
        // Play sound if you have one, or just confetti
        setTimeout(() => setShowConfetti(false), 5000);
    };

    if (!showConfetti) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[100]">
            <Confetti width={dimensions.width} height={dimensions.height} />
        </div>
    );
}
