import { socialImgs } from "../constants";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="flex flex-col justify-center">
          <p className="text-center md:text-end">
            © {new Date().getFullYear()} Waliul Alam. All rights reserved.
          </p>
        </div>

        <div className="socials">
          {socialImgs.map((socialImg) => (
            <div key={socialImg.id || socialImg.url} className="icon">
              <a
                href={socialImg.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Link to ${socialImg.name || "social media"}`}
              >
                <img
                  src={socialImg.imgPath}
                  alt={socialImg.name || "social icon"}
                />
              </a>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
