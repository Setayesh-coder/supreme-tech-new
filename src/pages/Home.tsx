import Hero from "./../components/sections/Hero";
import Services from "./../components/sections/Services";

// import Approach from "./../components/sections/Approach";
import Contact from "./../components/sections/Contact";

import Partners from "../components/sections/Partners";

export default function Home() {
  return (
    <div className="min-h-screen ">
      <main>
        <Hero />
        <Services />
        {/* <About /> */}
        {/* <Approach /> */}
        <Partners />
        <Contact />
      </main>
    </div>
  );
}
