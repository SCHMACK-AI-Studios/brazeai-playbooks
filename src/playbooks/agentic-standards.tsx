import type { Playbook } from "@/engine/types";
import {
  Area,
  ArrowList,
  Cards,
  Contact,
  Cover,
  Definition,
  Footnote,
  NumberCards,
  Opener,
  Page,
  Point,
  Steps,
  slide,
  Table,
} from "@/playbooks/kit";

const WHAT = "[ WHAT IT IS ]";
const WHY = "[ WHY IT MATTERS ]";
const NEED = "[ WHAT YOU NEED ]";
const WHERE = "[ WHERE IT PAYS OFF ]";
const OURS = "[ THE SCHMACK STANDARD ]";

export const agenticStandards: Playbook = {
  id: "agentic-standards",
  number: "02",
  comingSoon: true,
  title: "Agentic Standards",
  product: "Braze Agentic Standards · Beta",
  summary: "Automated QA for every campaign and Canvas.",
  slides: [
    slide("cover", "Cover", () => (
      <Cover
        number="02"
        title={["Agentic", "Standards"]}
        subtitle={["Automated QA for", "every Braze launch"]}
        status="[ BRAZEAI™ · BETA ]"
        ground="catProfile"
      />
    )),

    slide("definition", "What it is", () => (
      <Definition
        label={WHAT}
        image="/images/ai-infrastructure.webp"
        alt="Collage: a figure in a box-shaped suit, connected by dashed lines to robotic hands, a signal, and a cog"
        term="Agentic Standards"
        text="Rules, written in plain English, that Braze checks every campaign and Canvas against before it launches."
      />
    )),

    slide("how-it-works", "How it works", () => (
      <Page label={WHAT} head={["How it works"]}>
        <Steps
          steps={[
            { tab: "Write rules", text: "Plain-English rules, grouped into rulesets." },
            { tab: "Run evaluation", text: "The builder picks a standard at the review step." },
            { tab: "Read results", text: "Each rule comes back Pass, Warning or Fail, with a reason." },
            { tab: "Resolve", text: "Fix it, ignore it for this run, or ask Braze Operator to fix it." },
          ]}
        />
      </Page>
    )),

    slide("two-types", "Two types of standard", () => (
      <Page label={WHAT} head={["Two types of standard"]}>
        <Table
          widths={[3, 5, 6]}
          head={["", "Campaign Standards", "Canvas Standards"]}
          rows={[
            ["Used for", "One-off and recurring campaigns", "Multi-step journeys"],
            ["Checks", "The campaign as a whole", "The whole Canvas, then every message step and Audience Paths step"],
            ["Run from", "The Review Summary step", "The Summary step, or a single step while editing"],
            ["Can run", "All rulesets or one", "Configuration only, steps only, or both"],
          ]}
        />
      </Page>
    )),

    slide("what-it-checks", "What it can check", () => (
      <Page label={WHAT} head={["What it can check"]}>
        <Table
          widths={[3, 9]}
          head={["Area", "Examples"]}
          rows={[
            ["Set-up", "Naming, tags, conversion events, entry schedule, re-entry rules"],
            ["Structure", "Connected flow, branching, delays, exit criteria"],
            ["Audience", "Segments, exclusions, entry limits, audience size"],
            ["Content", "Spelling, placeholder text, character limits, brand guidelines"],
            ["Links", "Empty buttons, broken URLs, UTMs, deep links, staging domains"],
            ["Personalisation", "Liquid logic and fallback values"],
            ["Compliance", "Unsubscribe links, disclaimers, accessibility"],
            ["Audience Paths", "Path order, dead ends, timing, consent downstream"],
          ]}
        />
      </Page>
    )),

    slide("value", "Why it matters", () => (
      <Page label={WHY} head={["Why it matters"]}>
        <NumberCards
          items={[
            {
              title: "Fewer mistakes",
              text: "Broken links, placeholder copy and missing opt-outs are caught before launch.",
            },
            {
              title: "Faster QA",
              text: "Routine checks take minutes. People review judgement calls, not checklists.",
            },
            { title: "One standard", text: "Every builder, team, market and agency is held to the same rules." },
            { title: "An audit trail", text: "Logs and version history show what was checked and when." },
            {
              title: "Rules that keep up",
              text: "Change a guideline once and every future build is checked against it.",
            },
          ]}
        />
      </Page>
    )),

    slide("limits", "Limits to be upfront about", () => (
      <Page label={WHY} head={["Limits to be upfront about"]}>
        <Area top={300}>
          <ArrowList
            items={[
              "It is a beta. Access comes through the Braze account manager.",
              "It reviews. It does not block a launch, and issues can be ignored.",
              "It reads the build. It sends no test messages and checks no inbox rendering.",
              "Vague rules give unreliable results. Rule wording matters a great deal.",
              "Limits are 15 rulesets per standard and 20 rules per ruleset.",
            ]}
          />
        </Area>
      </Page>
    )),

    slide("prerequisites", "What a client needs in place", () => (
      <Page label={NEED} head={["What a client needs in place"]}>
        <Table
          widths={[3, 6, 5]}
          head={["Area", "What is needed", "Why"]}
          rows={[
            ["Access", "Agentic Standards switched on in Agent Console", "Beta, via the account manager"],
            [
              "Naming and tags",
              "The agreed pattern with examples, and required tags",
              "Vague conventions make vague rules",
            ],
            ["Tracking", "UTM pattern, link domains, deep link format", "So links can be checked"],
            ["Brand", "Tone of voice, spelling variant, banned words", "Attached to the content ruleset"],
            ["Legal", "Disclaimers, opt-out wording, rules by market", "Email, SMS and markets differ"],
            ["Safeguards", "Audience size limits, minimum delays", "Stops the large mistakes"],
            ["Test cases", "One build that should pass, one that should fail", "Proves the standard works"],
          ]}
        />
      </Page>
    )),

    slide("decisions", "Decisions to make first", () => (
      <Page label={NEED} head={["Decisions to make first"]}>
        <NumberCards
          items={[
            {
              title: "How many standards",
              text: "One for everything, or separate ones by team, market or journey type.",
            },
            { title: "Fail or warning", text: "Fails are the things that must be fixed before launch." },
            { title: "Who owns the rules", text: "Someone has to update them when guidelines change." },
            { title: "Where it sits", text: "Before human QA, after it, or both. And who may ignore a failure." },
          ]}
        />
      </Page>
    )),

    slide("where-opener", "Where it pays off", () => (
      <Opener label={WHERE} lines={["Many builders, frequent", "launches, [{costly}] mistakes"]} />
    )),

    slide("use-cases", "Where to use it", () => (
      <Page label={WHERE} head={["Where to use it"]}>
        <Table
          widths={[4, 6, 5]}
          head={["Situation", "Why it is valuable", "Rules that matter most"]}
          rows={[
            ["High campaign volume", "QA is a bottleneck and checks get skipped", "Set-up, content, links"],
            ["Many builders or markets", "Conventions drift and reporting suffers", "Naming, tags, UTMs, spelling"],
            ["Regulated sectors", "A missing disclaimer carries legal risk", "Compliance, consent by channel"],
            ["Complex Canvases", "Dead ends and wrong path order are hard to spot", "Structure, Audience Paths"],
            ["Agency or offshore teams", "The client needs proof house rules are followed", "Full standard, plus logs"],
            ["Large sends", "One error reaches millions", "Audience limits, exclusions"],
            ["Migrations", "Hundreds of rebuilt journeys need checking fast", "Structure, links, fallbacks"],
          ]}
        />
      </Page>
    )),

    slide("qualify", "Quick qualification", () => (
      <Page label={WHERE} head={["Worth proposing if two or more are true"]}>
        <Area top={300}>
          <ArrowList
            items={[
              "More than a handful of people build campaigns or Canvases.",
              "A send has gone out wrong in the last year.",
              "QA runs from a spreadsheet, or relies on one or two people.",
              "Reporting is unreliable because naming and tagging drift.",
              "Legal or brand sign-off slows launches.",
            ]}
          />
        </Area>
      </Page>
    )),

    slide("standard-opener", "The SCHMACK Standard", () => (
      <Opener label={OURS} lines={["The [{SCHMACK Standard}]", "raises the bar on Braze QA"]} />
    )),

    slide("standard-point", "A tested rulebook", () => (
      <Point
        label={OURS}
        lines={["A tested rulebook, ready on day one:", "one for [{campaigns}], one for [{Canvases}]"]}
        sub="We tailor it to your conventions, so you never start from a blank page."
      />
    )),

    slide("standard-inside", "Inside the SCHMACK Standard for Canvas", () => (
      <Page label={OURS} head={["Inside the SCHMACK Standard for Canvas"]}>
        <Table
          widths={[3, 4, 9]}
          head={["Level", "Ruleset", "What it checks"]}
          rows={[
            ["Whole Canvas", "Canvas setup", "Naming, tags, entry schedule, conversion events, re-entry"],
            ["Whole Canvas", "Canvas structure", "Flow, branching, delays, exit criteria"],
            ["Whole Canvas", "Audience and targeting", "Segments, exclusions, entry limits"],
            ["Whole Canvas", "SCHMACK QA additions", "Our own checks, such as Connected Content in any step"],
            ["Message steps", "Content and copy", "Subject line, placeholders, spelling, limits, cultural sensitivity"],
            ["Message steps", "Links and tracking", "Button destinations, UTMs, malformed URLs, staging domains"],
            ["Message steps", "Compliance", "Unsubscribe route, disclaimers, spam triggers, WCAG 2.1 AA"],
            ["Audience Paths", "Delivery readiness", "Channel match, consent, conversion exclusions, frequency caps"],
          ]}
        />
      </Page>
    )),

    slide("delivery", "How we deliver it", () => (
      <Page label={OURS} head={["How we deliver it"]}>
        <Steps
          steps={[
            {
              tab: "Discover",
              text: "Collect naming, tagging, tracking, brand and legal rules. Review recent QA misses.",
              meta: "1 week",
            },
            { tab: "Tailor", text: "Load the SCHMACK Standard and rewrite it to your conventions.", meta: "1 week" },
            {
              tab: "Prove",
              text: "Test against known good and bad builds until results are reliable.",
              meta: "A few days",
            },
            {
              tab: "Roll out",
              text: "Train builders and agree where it sits in the launch process.",
              meta: "A few days",
            },
            { tab: "Maintain", text: "Review logs and update rules as guidelines change.", meta: "Ongoing" },
          ]}
        />
        <Footnote>Durations are estimates.</Footnote>
      </Page>
    )),

    slide("questions", "The questions clients ask", () => (
      <Page label={OURS} head={["The questions clients ask"]}>
        <Table
          widths={[4, 10]}
          head={["Question", "Answer today"]}
          rows={[
            [
              "How much does it cost?",
              "It is a Braze beta, requested through the account manager. Whether evaluations use credits is still to confirm.",
            ],
            [
              "How long does it take?",
              "An estimated 2 to 3 weeks to a tailored, tested set, starting from the SCHMACK Standard.",
            ],
            [
              "What do you need from us?",
              "A CRM lead to agree the rules, plus input from brand and legal. No data or engineering time.",
            ],
            [
              "What content do we need?",
              "Written conventions: naming, tags, UTMs, brand guidelines, disclaimers. We help write any that are missing.",
            ],
            ["What data do we need?", "None. It reads the campaign or Canvas build."],
            [
              "Does it replace human QA?",
              "No. It takes the routine checks. People still do test sends and judgement calls.",
            ],
          ]}
        />
      </Page>
    )),

    slide("why-schmack", "Why SCHMACK", () => (
      <Page label={OURS} head={["Why SCHMACK"]}>
        <Cards
          items={[
            { title: "Ready-made", lede: "Tested standards, so nobody starts from a blank page." },
            { title: "Written by builders", lede: "Rules from people who build and QA in Braze every day." },
            {
              title: "Built around your rules",
              lede: "Naming, tracking, brand and legal conventions in one standard.",
            },
          ]}
        />
      </Page>
    )),

    slide("contact", "Get in touch", () => (
      <Contact
        lines={["See it run on one of", "[{your own}] Canvases"]}
        bring={[
          "How QA is done today and who does it",
          "Any written naming, tagging or brand rules",
          "An example of a send that went wrong",
        ]}
      />
    )),
  ],
};
