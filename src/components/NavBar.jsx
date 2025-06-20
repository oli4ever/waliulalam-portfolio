import { useState, useEffect } from "react";
import { disablePageScroll, enablePageScroll } from "scroll-lock";
import { navLinks } from "../constants";
import MenuSvg from "./MenuSvg";

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [openNavigation, setOpenNavigation] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleNavigation = () => {
    if (openNavigation) {
      setOpenNavigation(false);
      enablePageScroll();
    } else {
      setOpenNavigation(true);
      disablePageScroll();
    }
  };

  const handleClick = () => {
    if (!openNavigation) return;
    enablePageScroll();
    setOpenNavigation(false);
  };

  return (
    <header
      className={`navbar fixed w-full left-1/2 py-2 px-5 md:px-20 -translate-x-1/2 z-[100] transition-all duration-300 ease-in-out ${
        scrolled ? "scrolled top-0 bg-black" : "md:top-5 top-0 bg-transparent"
      }`}
    >
      <div className="inner mx-auto flex items-center justify-between">
        <a
          href="#hero"
          className="logo text-white-50 text-xl md:text-2xl font-semibold transition-transform duration-300 hover:text-blue-50 hover:scale-110"
        >
          Waliul Alam
        </a>

        <nav
          className={`${
            openNavigation ? "flex" : "hidden"
          } fixed py-6 top-16 left-0 right-0 bottom-0 bg-black lg:static lg:flex lg:mx-auto lg:bg-transparent`}
        >
          <div className="relative z-2 flex flex-col items-center justify-center m-auto lg:flex-row w-full">
            <div className="flex flex-col items-center justify-center w-full lg:flex-row lg:justify-end max-lg:bg-black max-lg:py-20">
              {navLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.link}
                  onClick={handleClick}
                  className="block relative font-code text-xl uppercase text-white-50 transition-colors px-6 py-4 md:py-6 lg:-mr-0.25 lg:text-sm lg:font-semibold lg:leading-5 hover:text-white xl:px-8 w-full text-center lg:w-auto lg:text-left hover:bg-black-200 lg:hover:bg-transparent"
                >
                  <span className="group-hover:text-white transition-colors duration-300">
                    {item.name}
                  </span>
                  <span className="underline absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full" />
                </a>
              ))}

              {/* Mobile Contact Button */}
              <a
                href="mailto:oli.cste10@gmail.com"
                onClick={handleClick}
                className="lg:hidden flex mt-8 items-center gap-2 px-5 py-3 rounded-lg bg-white text-black hover:bg-gray-200 transition-colors duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:stroke-white transition-colors duration-300"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span className="group-hover:text-white transition-colors duration-300">
                  Contact me
                </span>
              </a>
            </div>
          </div>
        </nav>

        {/* Desktop Contact Button */}
        <a href="mailto:oli.cste10@gmail.com" className="contact-btn group">
          <div className="hidden lg:flex items-center gap-2 px-5 py-3 rounded-lg bg-white text-black group-hover:bg-black-50 transition-colors duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:stroke-white transition-colors duration-300"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span className="group-hover:text-white transition-colors duration-300">
              Contact me
            </span>
          </div>
        </a>

        <button
          className="lg:hidden p-2"
          onClick={toggleNavigation}
          aria-label="Toggle menu"
        >
          <MenuSvg openNavigation={openNavigation} />
        </button>
      </div>
    </header>
  );
};

export default NavBar;
