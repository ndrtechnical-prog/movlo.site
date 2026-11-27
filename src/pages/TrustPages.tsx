import React, { useState } from "react";
import { submitContactMessage } from "../lib/firestoreRepo";

export type TrustRoute =
  | "/about"
  | "/contact"
  | "/privacy-policy"
  | "/terms"
  | "/disclaimer"
  | "/editorial-policy"
  | "/cookie-policy";

interface TrustPagesProps {
  route: TrustRoute;
  onNavigate: (path: string) => void;
}

export const TrustPages: React.FC<TrustPagesProps> = ({ route, onNavigate }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (name.trim().length < 2 || email.trim().length < 5 || subject.trim().length < 3 || message.trim().length < 10) {
      setErrorMsg("Please fill out all fields completely before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      await submitContactMessage({ name, email, subject, message });
      setSubmitted(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setErrorMsg(err?.message || "Unable to send message right now.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderBody = () => {
    switch (route) {
      case "/about":
        return (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-2">
              About MOVLO
            </p>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-6">
              What&apos;s Trending. What&apos;s Worth Knowing.
            </h1>
            <div className="editorial-prose space-y-5">
              <p>
                MOVLO (https://movlo.site) is an independent digital editorial publication built to explain fast-moving topics across technology, artificial intelligence, entertainment, gaming, mobile apps, and digital culture without clickbait or filler.
              </p>
              <h2>Our Mission</h2>
              <p>
                Every day, thousands of search spikes happen around new software releases, hardware shifts, platform updates, and entertainment news. Readers often land on thin pages that repeat a headline without answering why the topic matters. MOVLO focuses on clarity: concise context, practical takeaways, and honest sourcing.
              </p>
              <h2>How We Work</h2>
              <p>
                Our editors monitor legitimate public trend feeds, official announcements, and verified documentation, pairing structured editorial workflows with strict human review before anything is published.
              </p>
            </div>
          </>
        );

      case "/editorial-policy":
        return (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-2">
              Editorial Standards
            </p>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-6">
              MOVLO Editorial Policy
            </h1>
            <div className="editorial-prose space-y-5">
              <p>
                Accuracy, originality, and reader utility guide every article published on MOVLO.site.
              </p>
              <h2>Source Verification &amp; Human Review</h2>
              <p>
                Automated drafting tools are used strictly to organize research and produce initial internal drafts. Every article requires human editorial inspection, verification against primary or reputable secondary sources, and manual approval prior to publication.
              </p>
              <h2>Corrections &amp; Updates</h2>
              <p>
                When facts change or a factual error is identified, we update the article promptly and reflect the genuine update date rather than artificially refreshing timestamps.
              </p>
              <h2>Advertising Separation</h2>
              <p>
                Display advertising served via Google AdSense is visually separated from editorial headlines, body copy, and interactive navigation. Advertisers do not influence coverage or conclusions.
              </p>
            </div>
          </>
        );

      case "/privacy-policy":
        return (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-2">
              Legal &amp; Privacy
            </p>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-6">
              Privacy Policy
            </h1>
            <div className="editorial-prose space-y-5">
              <p>
                This Privacy Policy explains how MOVLO (https://movlo.site) collects, uses, and protects information when you visit our website.
              </p>
              <h2>Information You Provide</h2>
              <p>
                If you submit a message via our Contact page, we store the name, email address, subject, and message you provide solely to respond to your inquiry. We do not sell or rent contact submissions to third parties.
              </p>
              <h2>Google AdSense &amp; Third-Party Advertising</h2>
              <p>
                MOVLO uses Google AdSense to display advertisements. Google and its partners may use cookies or device identifiers to serve ads based on prior visits to this site or other websites on the Internet. Visitors may opt out of personalized advertising by visiting Google Ads Settings.
              </p>
              <h2>Log Data &amp; Metrics</h2>
              <p>
                We track aggregate article view counts to understand which topics readers find helpful. Public view counters do not collect personally identifiable profiles.
              </p>
            </div>
          </>
        );

      case "/cookie-policy":
        return (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-2">
              Legal &amp; Privacy
            </p>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-6">
              Cookie Policy
            </h1>
            <div className="editorial-prose space-y-5">
              <p>
                Cookies are small text files stored in your browser to remember preferences, support authentication in the editorial studio, and deliver relevant advertising.
              </p>
              <h2>Types of Cookies We Use</h2>
              <ul>
                <li><strong>Essential cookies:</strong> Required for core navigation and administrator sign-in security.</li>
                <li><strong>Advertising cookies:</strong> Placed by Google AdSense to measure ad impressions, prevent fraud, and support ad personalization settings.</li>
              </ul>
              <p>
                You can control or clear cookies anytime through your browser settings.
              </p>
            </div>
          </>
        );

      case "/terms":
        return (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-2">
              Legal
            </p>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-6">
              Terms &amp; Conditions
            </h1>
            <div className="editorial-prose space-y-5">
              <p>
                By accessing MOVLO.site, you agree to these Terms and Conditions. All original articles, summaries, and editorial assets published on MOVLO remain protected under applicable copyright law.
              </p>
              <h2>Acceptable Use</h2>
              <p>
                You may read, share links to, and quote brief excerpts of MOVLO articles with attribution. Automated scraping, bulk republication without permission, or interference with site infrastructure is prohibited.
              </p>
            </div>
          </>
        );

      case "/disclaimer":
        return (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-2">
              Legal
            </p>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-6">
              Disclaimer
            </h1>
            <div className="editorial-prose space-y-5">
              <p>
                Content published on MOVLO.site is provided for general informational and educational purposes only. While our team strives to verify facts at the time of publication, technology specifications, release dates, pricing, and policies evolve rapidly.
              </p>
              <p>
                MOVLO does not provide legal, financial, or medical advice. External links are provided for reference and remain under the editorial control of their respective publishers.
              </p>
            </div>
          </>
        );

      case "/contact":
        return (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-2">
              Get In Touch
            </p>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-4">
              Contact the Editorial Desk
            </h1>
            <p className="text-sm text-neutral-600 mb-8 max-w-xl leading-relaxed">
              Have a news tip, factual correction, partnership inquiry, or feedback on a MOVLO guide? Send a note directly to our editorial team below.
            </p>

            {submitted ? (
              <div className="border border-[#0A0A0A] p-6 bg-neutral-50">
                <h2 className="font-editorial text-xl font-bold text-[#0A0A0A] mb-2">
                  Message Received
                </h2>
                <p className="text-sm text-neutral-700 mb-4">
                  Thank you for contacting MOVLO. Our editorial desk will review your message shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 bg-[#0A0A0A] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-5 max-w-xl">
                {errorMsg && (
                  <p className="text-xs font-medium text-red-700 border border-red-300 bg-red-50 px-3 py-2">
                    {errorMsg}
                  </p>
                )}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-3.5 py-2.5 border border-neutral-300 text-sm focus:outline-none focus:border-[#0A0A0A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 border border-neutral-300 text-sm focus:outline-none focus:border-[#0A0A0A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Editorial tip, correction, or inquiry"
                    className="w-full px-3.5 py-2.5 border border-neutral-300 text-sm focus:outline-none focus:border-[#0A0A0A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message here..."
                    className="w-full px-3.5 py-2.5 border border-neutral-300 text-sm focus:outline-none focus:border-[#0A0A0A]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#0A0A0A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {submitting ? "Sending..." : "Submit Message"}
                </button>
              </form>
            )}
          </>
        );
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <nav aria-label="Breadcrumb" className="text-xs text-neutral-500 mb-8 flex items-center gap-2">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate("/");
          }}
          className="hover:text-[#0A0A0A]"
        >
          Home
        </a>
        <span>/</span>
        <span className="text-[#0A0A0A] capitalize">
          {route.replace("/", "").replace("-", " ")}
        </span>
      </nav>
      {renderBody()}
    </main>
  );
};
