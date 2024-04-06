"use client";

import { NextPage } from "next";
import Canvas from "@/components/Canvas";
import useCanvas from "@/hooks/Canvas/useCanvas";
import { SiteFooter } from "@/components/footer/site-footer";
import dynamic from "next/dynamic";
const ModeToggle = dynamic(() => import("@/components/mode-toggle"), {
  ssr: false,
});

const Home: NextPage = () => {
  const onAnimation = (ctx: CanvasRenderingContext2D) => {};

  const { canvasRef } = useCanvas({
    animate: onAnimation,
  });

  return (
    <>
      <Canvas canvasRef={canvasRef} />
      <div>
        <SiteFooter />
      </div>
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 absolute top-0 right-0">
        <ModeToggle />
      </div>
    </>
  );
};

export default Home;
