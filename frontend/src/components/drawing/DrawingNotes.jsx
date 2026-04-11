import { useRef, useEffect, useState, useImperativeHandle, forwardRef } from "react";

const CanvasCircles = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const [circles, setCircles] = useState([]);

  // рисуем все кружки
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    circles.forEach((circle) => {
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
      ctx.fillStyle = circle.color;
      ctx.fill();
    });
  }, [circles]);

  // наружу отдадим функцию addCircle
  useImperativeHandle(ref, () => ({
    addCircle() {
      const newCircle = {
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        r: 20,
        color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      };
      setCircles((prev) => [...prev, newCircle]);
    }
  }));

  return (
    <canvas
      ref={canvasRef}
      width={1920}
      height={1080}
    />
  );
});

export default CanvasCircles;
