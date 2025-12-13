/**
 * Cross-site global footer component
 */
function Footer() {
  return (
    <footer className="w-full mt-6 border-t border-[#cc0000]">
      <div className="max-w-[75em] mx-auto text-center">
        <div className="mt-4 flex gap-6 justify-center">
          <a href="/disclaimer" className="text-(--title-color)! no-underline 
                                            transition-all duration-300 ease-in-out 
                                            hover:text-[#cc0000] px-4 py-2 rounded-lg 
                                            hover:bg-[rgba(0,0,0,0.1)] 
                                            dark-theme:hover:bg-[rgba(255,255,255,0.1)]">Disclaimer</a>
          <a href="/terms" className="text-(--title-color)! no-underline 
                                      transition-all duration-300 ease-in-out 
                                      hover:text-[#cc0000] px-4 py-2 rounded-lg 
                                      hover:bg-[rgba(0,0,0,0.1)] 
                                      dark-theme:hover:bg-[rgba(255,255,255,0.1)]">Terms of Use</a>
          <a href="/contact" className="text-(--title-color)! no-underline 
                                         transition-all duration-300 ease-in-out 
                                         hover:text-[#cc0000] px-4 py-2 rounded-lg 
                                         hover:bg-[rgba(0,0,0,0.1)] 
                                         dark-theme:hover:bg-[rgba(255,255,255,0.1)]">Contact</a>
        </div>
        <p className="text-(--title-color)">© 2025 Real Fake News - Satirical AI-generated content.</p>
        <p className="text-(--title-color)">All rights reserved. Real Fake News is not responsible for the content of external sites.</p>
      </div>
      <a href='https://github.com/JonathanMiroshnik/Real-Fake-News' 
         className="text-(--title-color)! no-underline 
                    transition-colors duration-300 ease-in-out 
                    hover:text-[#cc0000] block mt-4">Check out the project on GitHub!</a>
    </footer>
  );
};

export default Footer;