 const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      className="bg-emerald-700 text-white"
      aria-label="Site footer"
    >
      {/* Top section: links/info */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold">AgriTech Hub</h3>
            <p className="mt-2 text-emerald-50/90 leading-relaxed">
              Empowering modern agriculture with data-driven insights, community support,
              and practical tools for better farm decisions.
            </p>
          </div>

          {/* Quick links (optional: replace with actual routes) */}
          <nav aria-label="Footer navigation">
            <h4 className="text-base font-semibold">Quick Links</h4>
            <ul className="mt-3 space-y-2 text-emerald-50/90">
              <li>
                <a className="hover:text-white transition-colors" href="/crop-recommendation">
                  Crop Recommendation
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors" href="/disease-detection">
                  Disease Detection
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors" href="/weather-updates">
                  Weather Updates
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors" href="/government-schemes">
                  Government Schemes
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors" href="/forum">
                  Open Forum
                </a>
              </li>
            </ul>
          </nav>

          {/* Contact / Social (placeholders) */}
          <div>
            <h4 className="text-base font-semibold">Connect</h4>
            <ul className="mt-3 space-y-2 text-emerald-50/90">
              <li>
                <a className="hover:text-white transition-colors" href="mailto:debasmita12b@gmail.com">
                  agritechhub@gmail.com
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors" href="tel:+10000000000">
                  +1 000 000 0000
                </a>
              </li>
              <li className="flex gap-4 pt-1">
                {/* Replace # with actual profiles */}
                <a className="hover:text-white transition-colors" href="#" aria-label="Twitter">
                  X
                </a>
                <a className="hover:text-white transition-colors" href="#" aria-label="LinkedIn">
                  in
                </a>
                <a className="hover:text-white transition-colors" href="#" aria-label="YouTube">
                  yt
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-emerald-500/40">
        <div className="container mx-auto px-4 py-4 text-center text-emerald-50/90">
          <p>
            © {year} AgriTech Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
