// src/hooks/useScrollAnimation.js
import { useState, useEffect } from 'react';

/**
 * A custom React hook that calculates the user's scroll progress as a percentage of the total page height.
 * @returns {number} The scroll progress percentage (0-100).
 */
export const useScrollProgress = () => {
    const [scrollProgress, setScrollProgress] = useState(0);

    const handleScroll = () => {
        // Total scrollable height of the document
        const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        
        // Current scroll position
        const scrollTop = window.scrollY;

        if (totalHeight > 0) {
            const progress = (scrollTop / totalHeight) * 100;
            setScrollProgress(progress);
        } else {
            // If the page is not scrollable, progress is 0
            setScrollProgress(0);
        }
    };

    useEffect(() => {
        // Add scroll event listener when the component mounts
        window.addEventListener('scroll', handleScroll);

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []); // Empty dependency array ensures this effect runs only once

    return scrollProgress;
};