import React, { useEffect, useRef } from 'react';

export const BinaryRain: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const setup = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        setup();

        const characters = '01';
        const fontSize = 16;
        let columns = Math.ceil(canvas.width / fontSize);
        const drops: number[] = [];

        const initializeDrops = () => {
            drops.length = 0;
            for (let x = 0; x < columns; x++) {
                drops[x] = Math.floor(Math.random() * (canvas.height / fontSize));
            }
        };
        
        initializeDrops();


        const draw = () => {
            if (!ctx) return;
            // A semi-transparent black background to create the fading trail effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#FFF'; // White color for the binary digits
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = characters.charAt(Math.floor(Math.random() * characters.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                // Resetting a drop when it reaches the bottom of the screen
                // Randomly reset to make the rain effect look more natural
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }

                drops[i]++;
            }
        };

        const animate = () => {
            draw();
            animationFrameId.current = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            setup();
            columns = Math.ceil(canvas.width / fontSize);
            initializeDrops();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId.current);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
            aria-hidden="true"
        />
    );
};
