import { useEffect, useState } from 'react';

export function useIsMobile(breakpoint: number = 640) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const verificarTamanho = () => {
            if (typeof window !== 'undefined') {
                setIsMobile(window.innerWidth < breakpoint);
            }
        };

        verificarTamanho();
        window.addEventListener('resize', verificarTamanho);
        return () => window.removeEventListener('resize', verificarTamanho);
    }, [breakpoint]);

    return isMobile;
}
