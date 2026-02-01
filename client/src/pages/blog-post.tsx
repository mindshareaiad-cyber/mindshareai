import { useRoute } from "wouter";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

const posts: Record<string, {
  title: string;
  date: string;
  readTime: string;
  category: string;
  content: React.ReactNode;
}> = {
  "what-is-aeo": {
    title: "What is Answer Engine Optimization (AEO)?",
    date: "31 January 2026",
    readTime: "5 min read",
    category: "Getting Started",
    content: (
      <>
        <h2>Quick definition</h2>
        <p>
          Answer Engine Optimization (AEO) is the practice of optimizing your brand and content so that AI systems and modern search features choose your answers when users ask questions in natural language. Instead of just chasing blue links, AEO focuses on "being the answer."
        </p>

        <h2>From SEO to AEO</h2>
        <p>Traditional SEO was built around:</p>
        <ul>
          <li>Keywords and backlinks</li>
          <li>Ranking in the top 10 results</li>
          <li>Optimizing pages for clicks</li>
        </ul>

        <p>AEO shifts the focus to:</p>
        <ul>
          <li>Questions and intent, not just keywords</li>
          <li>Getting selected as the direct answer in AI chat, featured snippets, and rich results</li>
          <li>Structuring information so machines can easily understand and trust it</li>
        </ul>

        <p>
          You're no longer only asking, "How do I rank on page one?" but "How do I become the answer an AI gives to this question?"
        </p>

        <h2>Why AEO matters now</h2>
        <p>Modern users type or speak full questions into search and AI tools:</p>
        <ul>
          <li>"Best CRM for small agencies?"</li>
          <li>"What's the easiest way to track VAT invoices?"</li>
          <li>"Which email tool is best for cold outreach?"</li>
        </ul>

        <p>AI systems and answer engines now:</p>
        <ul>
          <li>Synthesize multiple sources into one response</li>
          <li>Make recommendations without always showing the underlying links</li>
          <li>Prioritize clarity, trust, and authority over raw keyword matching</li>
        </ul>

        <p>If you're not optimized for this, you can be invisible even if your SEO is decent.</p>

        <h2>How AEO works in practice</h2>
        <p>A strong AEO approach typically includes:</p>

        <h3>Clear, question-led content</h3>
        <ul>
          <li>FAQ blocks, Q&A sections, and content built around real user questions</li>
          <li>Concise, direct answers high up on the page</li>
        </ul>

        <h3>Structured data and context</h3>
        <ul>
          <li>Schema markup (Organization, Product, FAQ, HowTo, Review)</li>
          <li>Clear info about who you are, what you do, pricing, locations, and use-cases</li>
        </ul>

        <h3>Topical authority</h3>
        <ul>
          <li>Deep, consistent content around your niche rather than thin, scattered posts</li>
          <li>Demonstrating expertise, evidence, and up-to-date information</li>
        </ul>

        <h3>Brand signals and trust</h3>
        <ul>
          <li>Clear "About," team, and contact details</li>
          <li>Third-party mentions, reviews, and case studies that show you're real and reliable</li>
        </ul>

        <h3>Machine-friendly clarity</h3>
        <ul>
          <li>Simple language, clean headings, and logical structure</li>
          <li>Avoiding jargon and ambiguity so models can confidently pull snippets from you</li>
        </ul>

        <h2>AEO vs traditional SEO: key differences</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold">Aspect</th>
                <th className="text-left py-3 px-4 font-semibold">Traditional SEO</th>
                <th className="text-left py-3 px-4 font-semibold">AEO</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-4">Primary goal</td>
                <td className="py-3 px-4 text-muted-foreground">Get clicks to your site</td>
                <td className="py-3 px-4 text-muted-foreground">Get chosen as the direct answer</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">Focus unit</td>
                <td className="py-3 px-4 text-muted-foreground">Keywords & pages</td>
                <td className="py-3 px-4 text-muted-foreground">Questions, entities, and brand visibility</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">Measurement</td>
                <td className="py-3 px-4 text-muted-foreground">Rankings, clicks, traffic</td>
                <td className="py-3 px-4 text-muted-foreground">Inclusion in AI answers, featured spots, recommendations</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">Content style</td>
                <td className="py-3 px-4 text-muted-foreground">Long, keyword-rich, link-driven</td>
                <td className="py-3 px-4 text-muted-foreground">Clear Q&A, concise explanations, context-rich</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">Main "decider"</td>
                <td className="py-3 px-4 text-muted-foreground">Search engine algorithm</td>
                <td className="py-3 px-4 text-muted-foreground">Search + AI models + answer engines</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Simple example</h2>
        <p>
          Imagine a user asks an AI: "What's a good tool to pre-check VAT invoices before sending them to Xero?"
        </p>
        <p>AEO thinking asks:</p>
        <ul>
          <li>Do we have a page that directly answers that question?</li>
          <li>Is our product clearly described as solving that exact use case?</li>
          <li>Is our brand recognized by the AI as associated with "VAT invoice pre-check" and "Xero"?</li>
          <li>Is our content structured so the model can safely lift a 1–2 sentence explanation and a recommendation?</li>
        </ul>
        <p>If the answer to those is "yes," you increase your chances of being named in that response.</p>

        <h2>Getting started with AEO</h2>
        <p>If you're starting from scratch, you can:</p>
        <ol>
          <li>List the top 50–100 questions your ideal customer actually asks</li>
          <li>Turn each into: a dedicated section, FAQ entry, or page with a clear, direct answer</li>
          <li>Add structured data where relevant (FAQ, product, how-to)</li>
          <li>Make your brand's "who we are / what we do / who we serve" brutally clear across the site</li>
        </ol>
        <p>
          Once that foundation is in place, you can layer on more advanced work: tracking when/where you're mentioned in AI answers, refining prompts, and iterating content to increase your "answer share" over time.
        </p>
      </>
    ),
  },
  "how-ai-chooses-brands": {
    title: "How AI Assistants Choose Which Brands to Recommend",
    date: "28 January 2026",
    readTime: "12 min read",
    category: "AI Insights",
    content: (
      <>
        <p>
          AI assistants are quickly becoming the way people discover products, compare tools, and make buying decisions. Ask something like "What's the best CRM for agencies?" or "Which tool is best for pre-checking VAT invoices before Xero?" and the assistant will happily name brands and explain why.
        </p>
        <p>
          But how does it actually choose which brands to recommend?
        </p>
        <p>
          Under the hood, it's not random and it's not magic. It's a mix of training data, ranking systems, safety constraints, and how clearly your brand shows up in that ecosystem.
        </p>
        <p>
          In this article, we'll break down the main layers that influence brand recommendations — and what that means for you.
        </p>

        <h2>1. It starts with the user's intent</h2>
        <p>
          When someone types or speaks a question, the assistant's first job is to understand intent.
        </p>
        <p>
          "Best CRM for agencies" is not just a string of words. The model infers things like:
        </p>
        <ul>
          <li>The user wants specific product recommendations, not just a definition.</li>
          <li>They likely care about features like pipelines, reporting, collaboration, not basic contact storage.</li>
          <li>They probably don't want ultra-enterprise tools designed for thousands of seats.</li>
        </ul>
        <p>
          So the internal representation might look like:
        </p>
        <p>
          <em>"Recommend 3–5 CRM tools that are well suited to small–mid sized agencies, explain pros and cons, and avoid tools that are clearly for huge enterprises or unrelated to CRM."</em>
        </p>
        <p>
          This intent shapes which brands are even eligible to be mentioned. If your positioning doesn't match the inferred intent, you're unlikely to make the cut.
        </p>

        <h2>2. The model's "mental map" of brands</h2>
        <p>
          Modern AI models are trained on huge amounts of text: websites, docs, blogs, comparison articles, Q&A forums, reviews, and more. During training, they build an internal map of associations:
        </p>
        <ul>
          <li>Which tools show up near phrases like "CRM for small business"</li>
          <li>Which brand names co-occur with specific problems: "AP automation", "VAT checking", "cold email outreach"</li>
          <li>Which products are frequently mentioned together in lists and comparisons</li>
        </ul>
        <p>
          Over time, the model forms clusters in its "head":
        </p>
        <ul>
          <li>"CRM for small business" → HubSpot, Pipedrive, Zoho, etc.</li>
          <li>"Cloud accounting in the UK" → Xero, QuickBooks, FreeAgent.</li>
          <li>"Helpdesk for SaaS" → Zendesk, Intercom, Freshdesk.</li>
        </ul>
        <p>
          When you ask for recommendations, it doesn't scan the entire internet from scratch. It mostly draws from that implicit shortlist — brands that are heavily and consistently associated with that category.
        </p>
        <p>
          If your brand has almost no presence in those training-time sources, the model might not "know" you exist at all. If you only describe yourself with vague slogans ("we transform how businesses work"), the association with real problems will be weak.
        </p>

        <h2>3. Relevance, positioning, and clarity</h2>
        <p>
          Once there's a rough shortlist in the model's internal space, relevance and clarity start to matter.
        </p>

        <h3>Relevance to the question</h3>
        <p>
          The assistant prefers brands that obviously fit the narrowly defined use case. Saying:
        </p>
        <p>
          <em>"We're a CRM for B2B agencies and consultancies"</em>
        </p>
        <p>
          is much clearer to the model than:
        </p>
        <p>
          <em>"We help teams collaborate and grow."</em>
        </p>
        <p>
          The first line nails a target customer and category in one sentence. The second could describe a hundred different tools.
        </p>

        <h3>Clarity of positioning</h3>
        <p>
          Models respond well to repeated, consistent signals. If everywhere it "sees" you, the messaging is:
        </p>
        <p>
          <em>"Pre-flight VAT checker for Xero draft bills"</em>
        </p>
        <p>
          the association becomes strong. If half your messaging says "invoice validator", other parts say "accounts payable automation", and your homepage leads with generic productivity claims, the signal is muddy.
        </p>

        <h3>Coverage across surfaces</h3>
        <p>
          Relevance isn't just on your site. It includes:
        </p>
        <ul>
          <li>Comparison posts ("X vs Y")</li>
          <li>"Best tools for [use case]" round-ups</li>
          <li>Product reviews and tutorials</li>
          <li>Community posts and Q&A threads</li>
        </ul>
        <p>
          Each of these reinforces the association between your brand and a specific problem. If you only rely on your own website, you're missing half the picture.
        </p>

        <h2>4. Popularity, authority, and "safe" defaults</h2>
        <p>
          AI assistants are tuned to feel safe to the end user. That biases them toward:
        </p>
        <ul>
          <li>Well-known, established products</li>
          <li>Brands that appear on reputable sites and in well-structured docs</li>
          <li>Tools that have survived multiple cycles of public scrutiny</li>
        </ul>
        <p>
          That doesn't mean smaller brands can't win. But in ambiguous situations, the assistant is more likely to recommend:
        </p>
        <ul>
          <li>A CRM that appears in dozens of comparison articles</li>
          <li>A VAT tool with clear docs, case studies, and reviews</li>
          <li>A helpdesk platform with lots of tutorials and integration guides</li>
        </ul>
        <p>
          From the assistant's perspective, these are low-risk defaults. If you look half-finished, anonymous, or thinly documented, the system will be more cautious about pushing you to the top.
        </p>
        <p>
          This is why things like:
        </p>
        <ul>
          <li>A clear "About" page</li>
          <li>Team and company information</li>
          <li>Privacy/terms pages</li>
          <li>Strong documentation and how-tos</li>
        </ul>
        <p>
          aren't just for humans — they double as trust signals for models and ranking systems.
        </p>

        <h2>5. Retrieval and ranking: the invisible first step</h2>
        <p>
          A lot of modern AI assistants don't just rely on what the model remembers. They also use retrieval systems that pull in relevant documents in real time.
        </p>
        <p>
          Roughly, there are two big stages:
        </p>

        <h3>Retrieval / ranking layer</h3>
        <ul>
          <li>Uses search-like algorithms to fetch pages, docs, and snippets relevant to the user's query.</li>
          <li>Ranks them by relevance, freshness, authority, and sometimes click-through or engagement data.</li>
        </ul>

        <h3>Generation layer (the LLM)</h3>
        <ul>
          <li>Reads those top-ranked documents.</li>
          <li>Synthesizes them into a natural-language answer.</li>
          <li>Picks brands and snippets that best fit the question and the system's policies.</li>
        </ul>
        <p>
          If your site and brand never make it into that retrieved top-N, the language model doesn't even see you. You're invisible at the decision point.
        </p>
        <p>
          That's why Answer Engine Optimization (AEO) is increasingly about being retrievable:
        </p>
        <ul>
          <li>Clean, descriptive titles and headings</li>
          <li>Clear entity names and product descriptions</li>
          <li>Structured data (schemas) where appropriate</li>
          <li>Content aligned to specific, real questions customers ask</li>
        </ul>

        <h2>6. Safety rules and policy constraints</h2>
        <p>
          Even if you're a great fit, AI assistants have to obey policy constraints. These include:
        </p>

        <h3>Content categories</h3>
        <p>
          Extra caution or restrictions around finance, health, legal, adult content, and anything with safety risk. Recommendations here are often more generic, more hedged, or avoided entirely.
        </p>

        <h3>Regional rules</h3>
        <p>
          Some products can't be promoted in certain regions due to local laws, licensing, or compliance requirements. Assistants may avoid recommending tools where availability or legality is unclear.
        </p>

        <h3>Brand neutrality and bias controls</h3>
        <p>
          Many systems are tuned not to be overly promotional or biased toward a single company. They might deliberately offer several options and encourage users to compare.
        </p>
        <p>
          The result: even if you're an excellent match, you might appear as "one of a small set of good options" rather than the only suggestion.
        </p>

        <h2>7. How your own content shapes recommendations</h2>
        <p>
          From the assistant's perspective, your content is either easy to use or hard to use.
        </p>

        <h3>Traits of "assistant-friendly" content</h3>
        <p><strong>Entity clarity</strong></p>
        <p>In the first lines, make it obvious:</p>
        <ul>
          <li>Who you are (company / product)</li>
          <li>What category you're in</li>
          <li>Who it's for</li>
          <li>In which geography, if relevant</li>
        </ul>
        <p>
          Example: <em>"VATMate is a UK-focused pre-flight VAT checker for businesses that use Xero and similar cloud accounting tools."</em>
        </p>

        <p><strong>Question-led structure</strong></p>
        <p>Use headings that match real user questions:</p>
        <ul>
          <li>"What is [Product]?"</li>
          <li>"Who is [Product] for?"</li>
          <li>"How does [Product] compare to [Category] alternatives?"</li>
          <li>"Is [Product] right for agencies / e-commerce / freelancers?"</li>
        </ul>

        <p><strong>Concrete, specific use cases</strong></p>
        <p>Spell out real situations:</p>
        <ul>
          <li>"Pre-check supplier invoices for VAT errors before they hit your ledger."</li>
          <li>"Track all client comms across email, chat, and calls."</li>
          <li>"Automate follow-ups for cold outbound campaigns."</li>
        </ul>

        <p><strong>Clean structure and markup</strong></p>
        <p>Use:</p>
        <ul>
          <li>Descriptive headings</li>
          <li>Short paragraphs</li>
          <li>Bullet lists</li>
          <li>Tables for comparisons</li>
          <li>FAQ and Product schemas where appropriate</li>
        </ul>
        <p>
          Models and retrieval systems find it much easier to lift snippets, form associations, and feel confident recommending you when your content is structured like this.
        </p>

        <h3>Traits that make you harder to recommend</h3>
        <ul>
          <li>Vague, slogan-heavy copy with no clear category or use case.</li>
          <li>Thin content with almost no explanation of what the tool actually does.</li>
          <li>Inconsistent naming or positioning across pages and profiles.</li>
          <li>Lack of basic trust signals (no company details, no policies, no social proof).</li>
        </ul>
        <p>
          The less confident the system is about what you do and who you help, the less likely it is to put its reputation on the line by recommending you.
        </p>

        <h2>8. Sentiment, social proof, and stories</h2>
        <p>
          AI models pick up patterns of sentiment from the text they're trained on:
        </p>
        <ul>
          <li>Reviews and testimonials</li>
          <li>Blog posts describing outcomes</li>
          <li>Case studies and success stories</li>
          <li>Forum threads and social posts</li>
        </ul>
        <p>
          If the visible narrative around your product is:
        </p>
        <p>
          <em>"This tool helped us cut invoice errors by 40%"</em><br />
          <em>"We switched from X to Y and saw fewer VAT issues"</em>
        </p>
        <p>
          those stories become part of the model's internal picture of your brand. Over time, this makes you feel like a "safe bet" for certain problems.
        </p>
        <p>
          On the flip side:
        </p>
        <ul>
          <li>Repeated negative reviews</li>
          <li>Strong, widely-shared complaints</li>
          <li>Public controversies</li>
        </ul>
        <p>
          can all push an assistant to hedge: "Some users report issues with…" or to simply recommend alternative brands with cleaner reputations.
        </p>
        <p>
          The takeaway: credible, repeated, positive stories in your niche matter — not just for humans, but for the systems training on human text.
        </p>

        <h2>9. What this means for your brand</h2>
        <p>
          If you want AI assistants to recommend you more often, think in three layers:
        </p>

        <h3>1. Be on the map</h3>
        <ul>
          <li>Make sure your brand and product are clearly described on your own site and key third-party sites.</li>
          <li>Get yourself into category pages, comparisons, and round-ups that accurately describe your niche.</li>
          <li>Nail your one-line positioning so the association between "problem" and "your brand" is tight.</li>
        </ul>

        <h3>2. Be the obvious fit for specific questions</h3>
        <ul>
          <li>Map out the real questions your ideal customer asks.</li>
          <li>Build content (pages, sections, FAQs) that answer those questions directly and concisely.</li>
          <li>Repeat your positioning consistently so the model sees the same story everywhere.</li>
        </ul>

        <h3>3. Look safe to recommend</h3>
        <ul>
          <li>Invest in trust: social proof, case studies, transparent pricing, docs.</li>
          <li>Keep your site technically clean and professionally presented.</li>
          <li>Align your public claims with what you actually deliver — assistants increasingly cross-check multiple sources.</li>
        </ul>

        <p>
          The era we're entering isn't just about being found in search results. It's about being chosen as the answer when someone asks an AI assistant what to buy, what to use, or which brand they should trust.
        </p>
        <p>
          If you deliberately shape your content, positioning, and presence around that reality, you greatly increase your chances of being the name that shows up in those critical, AI-mediated moments.
        </p>
      </>
    ),
  },
  "content-strategies-ai-visibility": {
    title: "5 Content Strategies to Improve Your AI Visibility",
    date: "25 January 2026",
    readTime: "10 min read",
    category: "Strategy",
    content: (
      <>
        <p>
          AI assistants are quickly becoming the "first touch" for product discovery and research. Instead of scrolling through ten blue links, people now ask:
        </p>
        <ul>
          <li>"What's the best tool for X?"</li>
          <li>"Which platform is good for doing Y?"</li>
          <li>"What should I use if I want Z?"</li>
        </ul>
        <p>
          If you want your brand to show up in those answers, you need to design content not just for humans and search engines, but for AI systems too. That's what AI visibility and Answer Engine Optimization (AEO) are about.
        </p>
        <p>
          Below are five practical content strategies to help you show up more often when AI assistants recommend tools and brands.
        </p>

        <h2>1. Build question-led, not keyword-led, content</h2>
        <p>
          Most sites are still organised around keywords. AI assistants think in questions and intents.
        </p>

        <h3>What to do</h3>
        <p>Collect real questions your audience asks:</p>
        <ul>
          <li>Sales calls and demos</li>
          <li>Support tickets</li>
          <li>Communities, forums, Reddit, niche Slack groups</li>
        </ul>
        <p>Turn them into specific, answerable prompts, for example:</p>
        <ul>
          <li>"How can UK agencies reduce VAT invoice errors before Xero?"</li>
          <li>"What's the best CRM for small creative agencies?"</li>
          <li>"Which tool is best for automating invoice data entry?"</li>
        </ul>

        <h3>How to structure content</h3>
        <p>For each important question:</p>
        <p>Create a dedicated page or section with:</p>
        <ul>
          <li>A clear H1/H2 that closely matches the question</li>
          <li>A direct, 2–3 sentence answer high on the page</li>
          <li>Supporting detail, examples, and visuals underneath</li>
        </ul>
        <p>Add an FAQ block that includes the question verbatim plus a crisp answer.</p>
        <p>This makes it easy for AI assistants to:</p>
        <ul>
          <li>Recognise that your page is a strong match</li>
          <li>Lift concise, self-contained answers</li>
          <li>Confidently attach your brand to that specific problem</li>
        </ul>

        <h2>2. Clarify your entity and niche in the first 50 words</h2>
        <p>
          If a model can't easily answer "Who are you?" and "What do you do?", it's unlikely to risk recommending you.
        </p>

        <h3>Your first 50 words should answer:</h3>
        <ul>
          <li>What is the product? (category)</li>
          <li>Who is it for? (audience)</li>
          <li>What problem does it solve? (use case)</li>
          <li>Where does it mainly operate? (if relevant: country/market)</li>
        </ul>

        <h3>Example</h3>
        <p><strong>Bad opening:</strong></p>
        <p>
          <em>"We help businesses work smarter and grow faster with powerful, intuitive software."</em>
        </p>
        <p><strong>Good opening:</strong></p>
        <p>
          <em>"VATMate is a UK-focused pre-flight VAT checker for small businesses and bookkeepers that use Xero and similar cloud accounting tools. It catches VAT and invoice issues before they hit your ledger."</em>
        </p>
        <p>The second example:</p>
        <ul>
          <li>Nails the category</li>
          <li>Names the audience</li>
          <li>States the core job</li>
          <li>Anchors the geography</li>
        </ul>
        <p>
          Clear entity definitions like this give models a strong reason to connect your brand with specific user intents.
        </p>

        <h2>3. Create comparison and alternatives content (the right way)</h2>
        <p>A huge percentage of AI commerce queries look like:</p>
        <ul>
          <li>"X vs Y — which is better for…?"</li>
          <li>"Best alternatives to [big competitor] for small teams?"</li>
        </ul>
        <p>If you're absent from that conversation, you're missing critical visibility.</p>

        <h3>How to do it well</h3>
        <p>Create honest comparison pages:</p>
        <ul>
          <li>"[Your Product] vs [Competitor]: Which is better for [use case]?"</li>
          <li>Cover where each tool is stronger or weaker.</li>
          <li>Avoid trash-talk; focus on fit.</li>
        </ul>
        <p>Build "best tools for X" content that:</p>
        <ul>
          <li>Genuinely includes other tools in your space</li>
          <li>Explains who each tool is best for</li>
          <li>Positions you clearly for your niche rather than "everyone"</li>
        </ul>

        <h3>Why this helps AI visibility</h3>
        <ul>
          <li>Comparisons and round-ups are heavily used as training and retrieval data.</li>
          <li>Being mentioned alongside category leaders helps anchor you in the right cluster.</li>
          <li>Clear statements like "Best for agencies under 20 staff" are gold for matching to specific queries.</li>
        </ul>
        <p>
          You're effectively teaching models: "Whenever someone asks about this use case, we belong in the shortlist."
        </p>

        <h2>4. Make your content machine-readable: structure, schema, and consistency</h2>
        <p>
          AI systems and their retrieval layers love structure. You're not just writing for people skimming; you're writing for parsers and rankers.
        </p>

        <h3>On-page structure</h3>
        <p>Use clear, descriptive headings (H1–H3) that contain:</p>
        <ul>
          <li>Product category</li>
          <li>Audience</li>
          <li>Use case</li>
        </ul>
        <p>Keep paragraphs short and focused on a single idea.</p>
        <p>Use bullet lists and tables where appropriate (features, plans, pros/cons).</p>

        <h3>Schema and metadata</h3>
        <p>Where it fits your site, add structured data such as:</p>
        <ul>
          <li>Organization</li>
          <li>Product</li>
          <li>FAQPage</li>
          <li>HowTo</li>
          <li>Review/Rating (if appropriate and truthful)</li>
        </ul>
        <p>This doesn't magically guarantee AI recommendations, but it improves:</p>
        <ul>
          <li>How reliably you're understood</li>
          <li>How often you're pulled into retrieval results</li>
          <li>How cleanly your snippets display in search and answer surfaces</li>
        </ul>

        <h3>Consistency</h3>
        <p>Use the same product name and core positioning across:</p>
        <ul>
          <li>Website</li>
          <li>Docs</li>
          <li>Social profiles</li>
          <li>App directories</li>
        </ul>
        <p>
          Avoid constantly rebranding your category ("platform", "OS", "workspace", "hub"). Pick one primary category and reinforce it.
        </p>
        <p>
          Consistency is what turns a one-off mention into a strong, reliable association in the model's "memory."
        </p>

        <h2>5. Publish proof: case studies, outcomes, and real stories</h2>
        <p>
          AI assistants don't feel trust — but they learn trust patterns from text written by humans.
        </p>

        <h3>Types of proof that help</h3>
        <p><strong>Case studies with specific outcomes:</strong></p>
        <ul>
          <li>"Reduced invoice corrections by 35%"</li>
          <li>"Cut weekly reconciliation time from 5 hours to 2"</li>
        </ul>
        <p><strong>Customer quotes that mention:</strong></p>
        <ul>
          <li>Role ("bookkeeper", "agency owner")</li>
          <li>Context ("UK VAT", "B2B cold outreach")</li>
          <li>Measurable impact</li>
        </ul>
        <p><strong>Niche-relevant stories on your blog or partner sites:</strong></p>
        <ul>
          <li>"How [Client] cleaned up their VAT process before moving to Xero"</li>
          <li>"What we learned auditing 10,000 supplier invoices for VAT errors"</li>
        </ul>

        <h3>Why this matters for AI</h3>
        <p>When models and ranking systems repeatedly see:</p>
        <ul>
          <li>Your brand + your niche</li>
          <li>Your brand + positive outcomes</li>
          <li>Your brand + credible customer types</li>
        </ul>
        <p>
          you become a "safe" option to mention for that niche. AI assistants are less likely to hedge and more likely to recommend you assertively.
        </p>

        <h2>Putting it all together: a simple playbook</h2>
        <p>If you want a concrete, starting-from-scratch plan:</p>
        <ol>
          <li><strong>Map 30–50 real questions</strong> your ideal customers ask.</li>
          <li><strong>Turn each into a page/section</strong> with: clear question-style heading, direct answer in 2–3 sentences, supporting explanation and examples.</li>
          <li><strong>Rewrite your home and product pages</strong> so the first 50 words nail category, audience, and use case.</li>
          <li><strong>Add at least:</strong> one honest "X vs Y" comparison page, one "best tools for [niche]" article that includes you fairly.</li>
          <li><strong>Publish 3–5 proof assets</strong> (case studies, outcome-driven blogs, or testimonials) that tie your brand to real results in your niche.</li>
        </ol>
        <p>
          Do this consistently and you're no longer just "on the internet." You're building the kind of structured, unambiguous presence that AI systems can understand, trust, and recommend when users ask for help.
        </p>
      </>
    ),
  },
};

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";
  const post = posts[slug];

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4">Article not found</h1>
              <p className="text-muted-foreground mb-8">
                The article you're looking for doesn't exist.
              </p>
              <Link href="/blog">
                <Button>Back to Blog</Button>
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <Link href="/blog">
              <Button variant="ghost" size="sm" className="gap-2 mb-8" data-testid="button-back-blog">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Button>
            </Link>

            <div className="mb-8">
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                {post.category}
              </span>
            </div>

            <h1 className="text-4xl font-bold mb-4" data-testid="text-blog-post-title">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{post.readTime}</span>
              </div>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mt-8 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3 [&>p]:text-muted-foreground [&>p]:mb-4 [&>ul]:list-disc [&>ul]:list-inside [&>ul]:text-muted-foreground [&>ul]:space-y-2 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:list-inside [&>ol]:text-muted-foreground [&>ol]:space-y-2 [&>ol]:mb-4">
              {post.content}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
