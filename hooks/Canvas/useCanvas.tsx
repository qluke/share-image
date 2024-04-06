"use client";

import { RefObject, useEffect, useRef, useState } from "react";

interface InitialProps {
  animate: (ctx: CanvasRenderingContext2D) => void;
}

function useCanvas({ animate }: InitialProps) {
  const canvasRef: RefObject<HTMLCanvasElement> =
    useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  // 设置上下文
  useEffect(() => {
    if (canvasRef?.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      setCtx(context);
    }
  }, []);

  // 动画处理
  useEffect(() => {
    let requestId: number;

    const RequestAnimation = (ctx: CanvasRenderingContext2D | null) => () => {
      if (ctx) {
        animate(ctx);
      }
      // 重复动画回调
      requestId = window.requestAnimationFrame(RequestAnimation(ctx));
    };

    // 初始化动画
    requestId = window.requestAnimationFrame(RequestAnimation(ctx));

    return () => {
      window.cancelAnimationFrame(requestId);
    };
  }, [ctx, animate]);

  return {
    canvasRef,
  };
}

export default useCanvas;
