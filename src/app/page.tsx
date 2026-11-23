import About from "@/components/About";
import Also from "@/components/Also";
import Connect from "@/components/Connect";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import Work from "@/components/Work";
import { listWriteups } from "@/lib/writer";

/** The outline: Hero, Brief About, Work, Connect. "Also" is the short list that used to be cards. */
export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Projects />
        <Also />
        <Connect />
      </main>
      <Footer />
    </>
  );
}

/** From the Writer, cached and refreshed every 10 seconds (src/lib/writer.ts). */
async function Projects() {
  const cards = await listWriteups("project");
  return <Work cards={cards} />;
}
