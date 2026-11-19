import { Hero } from "@/components/home/Hero";
import { Brands } from "@/components/home/Showcase";
import { Closing, NameUnfold, Panchtatva, Revival, TrustMarquee, ValuesMarquee, VayuReveal, VisionReveal } from "@/components/home/Immersive";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustMarquee />
      <NameUnfold />
      <Revival />
      <Panchtatva />
      <Brands />
      <VayuReveal />
      <ValuesMarquee />
      <VisionReveal />
      <Closing />
    </>
  );
}
