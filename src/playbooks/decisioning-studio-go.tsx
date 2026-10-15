import type { Playbook } from "@/engine/types";
import {
  Area,
  ArrowList,
  Cards,
  Contact,
  Cover,
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
const OURS = "[ THE SCHMACK WAY ]";

export const decisioningStudioGo: Playbook = {
  id: "decisioning-studio-go",
  number: "01",
  title: "Decisioning Studio Go",
  product: "Braze Decisioning Studio Go · Beta",
  summary: "The best email for each person, chosen by a self-serve decisioning agent.",
  slides: [
    slide(
      "cover",
      "Cover",
      ["Decisioning Studio Go, DS Go for short, is in beta. It is email only and optimises for clicks."],
      () => (
        <Cover
          number="01"
          title={["Decisioning", "Studio Go"]}
          subtitle={["The best email", "for each person"]}
          status="[ BRAZEAI™ · BETA · EMAIL ONLY ]"
          ground="cat"
        />
      ),
    ),

    slide(
      "what",
      "What it is",
      [
        "A/B testing picks one winner for everyone. DS Go picks for each individual.",
        "It does not write content. Every element it sends is one the client has approved.",
      ],
      () => (
        <Point
          label={WHAT}
          lines={["Not one winner for everyone.", "The best email for [{each person}]."]}
          sub="A self-serve Braze tool that picks the subject line, button, image and send time most likely to get a click, then learns from what happens."
        />
      ),
    ),

    slide(
      "how-it-works",
      "How it works",
      [
        "You give it a menu. It chooses a combination and a send time for each person.",
        "A random control group, at least 5% of the audience, gets random combinations of the same content. That is the baseline.",
      ],
      () => (
        <Page label={WHAT} head={["How it works"]}>
          <Steps
            steps={[
              {
                tab: "Give it a menu",
                text: "Templates, subject lines, button text, hero images and allowed send days.",
              },
              { tab: "It chooses", text: "For each person, the combination and send time most likely to get a click." },
              { tab: "It learns", text: "Every send teaches it what works for whom." },
              { tab: "You can prove it", text: "At least 5% get random combinations, so uplift has a fair baseline." },
            ]}
          />
          <Footnote>It does not write content. Every element it sends is one you approved.</Footnote>
        </Page>
      ),
    ),

    slide(
      "compare",
      "How it differs",
      ["Go is the entry tier. Pro optimises for any business metric, across channels, with Braze's services team."],
      () => (
        <Page label={WHAT} head={["How it differs from what you have"]}>
          <Table
            widths={[4, 4, 5, 5]}
            head={["", "A/B testing", "DS Go", "Decisioning Studio Pro"]}
            rows={[
              ["Picks a winner for", "The whole audience", "Each individual", "Each individual"],
              ["Optimises for", "A chosen conversion", "Clicks only", "Any business metric"],
              ["Channels", "Any", "Email only", "Several"],
              ["Data used", "Braze", "Braze profile and engagement", "Any first-party source"],
              ["Set-up", "Self-serve", "Self-serve", "Braze services team"],
            ]}
          />
        </Page>
      ),
    ),

    slide(
      "value",
      "Why it matters",
      [
        "We do not yet have our own uplift figures. Do not quote a percentage until the first client build has reported.",
      ],
      () => (
        <Page label={WHY} head={["Why it matters"]}>
          <NumberCards
            items={[
              {
                title: "Replaces manual testing",
                text: "No more test, pick a winner, start again. The agent tests all the time.",
              },
              { title: "No data team needed", text: "A marketer sets it up in the Braze dashboard." },
              { title: "Built-in proof", text: "Reporting shows uplift against the random control group." },
              { title: "A route to Pro", text: "A good result is the evidence for Decisioning Studio Pro." },
              { title: "Insight either way", text: "See which subject lines, buttons and images it favours." },
            ]}
          />
        </Page>
      ),
    ),

    slide(
      "limits",
      "Limits to be upfront about",
      [
        "Clicks only is the big one. If clicks are not a good sign of value for the programme, it is the wrong tool.",
        "[NOTE] Braze enablement notes mention the agent optimising frequency. The public docs say it does not. Treat frequency as fixed.",
      ],
      () => (
        <Page label={WHY} head={["Limits to be upfront about"]}>
          <Area top={300}>
            <ArrowList
              items={[
                "Email only. Other channels follow in separate betas.",
                "Clicks only. If a click is not a sign of value, it is the wrong tool.",
                "It varies subject line, button text and hero image. Not body copy or preheader.",
                "It chooses the day and time, not how often. You set one frequency.",
                "It does not send in a fixed order, so it does not suit onboarding series.",
              ]}
            />
          </Area>
        </Page>
      ),
    ),

    slide(
      "prerequisites",
      "What a client needs in place",
      [
        "No new data feeds are needed.",
        "Click volume is the first thing to check: 200 or more clicks a day across the audience.",
        "Braze's enablement notes ask for 5 to 10 variants per element. The public docs give 2 to 3 as the bare minimum.",
      ],
      () => (
        <Page label={NEED} head={["What a client needs in place"]}>
          <Table
            widths={[3, 6, 5]}
            head={["Area", "What is needed", "Notes"]}
            rows={[
              ["Access", "DS Go switched on for the workspace", "Beta, via the Braze CSM"],
              ["Commercial", "Action Credits on the contract", "Used each time DS Go sends"],
              ["Audience", "One segment used only by this agent", "Other sends blur what caused a click"],
              ["Size", "Tens of thousands of users", "Smaller works, but learns slower"],
              ["Click volume", "200 or more clicks a day", "The first thing to check"],
              ["Cadence", "Weekly or more, for a month or longer", "Needs about 10 send-days"],
              ["Variants", "5 to 10 distinct options per element", "Subject line, button, hero image"],
              ["Data", "Braze profile and email engagement only", "Nothing new to connect"],
            ]}
          />
        </Page>
      ),
    ),

    slide(
      "decisions",
      "Decisions to make first",
      ["The control group still receives emails. It gets random combinations, not nothing."],
      () => (
        <Page label={NEED} head={["Decisions to make first"]}>
          <NumberCards
            items={[
              { title: "Frequency", text: "One setting, such as three emails a week." },
              {
                title: "Days and quiet hours",
                text: "More days gives the agent more room. Quiet hours follow local time.",
              },
              { title: "Frequency caps", text: "Whether the workspace cap applies, and whether these sends count." },
              { title: "Repetition", text: "How long before a template or subject line can repeat." },
              { title: "Control group", text: "5% minimum. They still get emails, with random combinations." },
            ]}
          />
        </Page>
      ),
    ),

    slide(
      "setup",
      "Six steps in Braze",
      [
        "Configuration takes a day or less. The preparation before it is the real effort.",
        "Variants can be added later without resetting what the agent has learned.",
      ],
      () => (
        <Page label={NEED} head={["Six steps in Braze"]}>
          <Steps
            steps={[
              { tab: "Create", text: "Name the agent in the AI Decisioning tab." },
              { tab: "Segment", text: "Pick the dedicated segment." },
              { tab: "Schedule", text: "Set frequency, days, quiet hours and caps." },
              { tab: "Content", text: "Add templates, tag the elements, add variants." },
              { tab: "Rules", text: "Set how soon content can repeat." },
              { tab: "Launch", text: "Preview, test, review warnings, launch." },
            ]}
          />
          <Footnote>Emails send from day one. Reporting shows when the agent leaves training.</Footnote>
        </Page>
      ),
    ),

    slide("where-opener", "Where it pays off", ["Start with one of the two best-fit programme types."], () => (
      <Opener label={WHERE} lines={["Recurring email, a stable", "audience, clicks that [{count}]"]} />
    )),

    slide(
      "use-cases",
      "Where to use it",
      [
        "Always-on calendars and evergreen programmes are the best fit.",
        "Fixed-order series and one-off sends are not. Point those to Canvas and A/B testing.",
      ],
      () => (
        <Page label={WHERE} head={["Where to use it"]}>
          <Table
            widths={[4, 2, 6, 4]}
            head={["Programme", "Fit", "Examples", "Watch out for"]}
            rows={[
              ["Always-on calendar", "Best", "Newsletters, loyalty updates, weekly offers", "Content going stale"],
              ["Evergreen programme", "Best", "Winback, re-engagement, cross-sell", "Audience size once split out"],
              ["Multi-week promotion", "Supported", "Back-to-school, a month-long push", "Needs about 10 send-days"],
              ["Triggered journey", "Supported", "Basket or browse abandonment", "The agent picks the send time"],
              ["Fixed-order series", "Avoid", "Onboarding tutorials", "Use Canvas"],
              ["One-off send", "Avoid", "Black Friday, a product launch", "Use A/B testing"],
            ]}
          />
        </Page>
      ),
    ),

    slide(
      "qualify",
      "Quick qualification",
      [
        "Frame the case as uplift on an existing programme, time saved on manual tests, and evidence for a bigger investment.",
      ],
      () => (
        <Page label={WHERE} head={["Worth proposing if all five are true"]}>
          <Area top={300}>
            <ArrowList
              items={[
                "The audience gets this email at least weekly, for a month or more.",
                "The audience is in the tens of thousands, with around 200 clicks a day.",
                "There are 5 or more clearly different subject lines, buttons or images.",
                "A click matters commercially for this programme.",
                "These people can be taken out of other email sends while it runs.",
              ]}
            />
          </Area>
        </Page>
      ),
    ),

    slide(
      "way-opener",
      "The SCHMACK way",
      [
        "Braze says an agent can be deployed in minutes. That is true of the clicks in the dashboard.",
        "The real work is choosing the programme, preparing a clean segment, producing good variants and reading the results.",
      ],
      () => <Opener label={OURS} lines={["The clicks take minutes.", "The [{thinking}] is the work."]} />,
    ),

    slide(
      "delivery",
      "How we deliver it",
      [
        "[NOTE] We have no hands-on access yet. Braze grants it only with a live client project, so the first client build is also our learning build.",
        "[NOTE] Commercial model still to agree: fixed-fee pilot, or part of an existing retainer.",
      ],
      () => (
        <Page label={OURS} head={["How we deliver it"]}>
          <Steps
            steps={[
              { tab: "Fit check", text: "Review programmes, pull click volumes, estimate credit use.", meta: "1 week" },
              {
                tab: "Prepare",
                text: "Build the segment, adapt templates, write the variants, agree the settings.",
                meta: "1 to 2 weeks",
              },
              { tab: "Launch", text: "Request access, configure, test and launch.", meta: "A few days" },
              {
                tab: "Run and report",
                text: "Monitor training, refresh variants, report uplift at 4 and 8 weeks.",
                meta: "Ongoing",
              },
            ]}
          />
          <Footnote>Durations are estimates until we have run a client build.</Footnote>
        </Page>
      ),
    ),

    slide(
      "questions",
      "The questions clients ask",
      ["The credit rate per send comes from the client's Braze account team. We can estimate volume, not price."],
      () => (
        <Page label={OURS} head={["The questions clients ask"]}>
          <Table
            widths={[4, 10]}
            head={["Question", "Answer today"]}
            rows={[
              [
                "How much does it cost?",
                "Braze charges Action Credits per send. A 50,000 audience at 3 emails a week is 150,000 sends a week. The rate comes from Braze.",
              ],
              [
                "How long does it take?",
                "Configuration takes a day or less. Allow 2 to 4 weeks from kick-off to launch.",
              ],
              [
                "What do you need from us?",
                "A CRM owner, someone to approve copy and images, and the Braze CSM. No data or engineering time.",
              ],
              [
                "What content do we need?",
                "One HTML email template, and 5 to 10 options each for subject line, button and hero image.",
              ],
              ["What data do we need?", "Only what is already in Braze. No new feeds."],
              ["When will we see results?", "Emails send from day one. Judge it once the agent leaves training."],
            ]}
          />
        </Page>
      ),
    ),

    slide("why-schmack", "Why SCHMACK", ["If the programme is not a fit, we say so."], () => (
      <Page label={OURS} head={["Why SCHMACK"]}>
        <Cards
          items={[
            { title: "Braze specialists", lede: "Segment, Canvas and template work done properly first time." },
            { title: "Content and testing", lede: "The agent is only as good as the options it is given." },
            { title: "Straight answers", lede: "If it is not a fit, we say so and point to A/B testing or Canvas." },
          ]}
        />
      </Page>
    )),

    slide(
      "contact",
      "Get in touch",
      ["[NOTE] Team names, certifications and contact details still need adding."],
      () => (
        <Contact
          lines={["Find out in a week if", "DS Go would [{lift}] your email"]}
          bring={[
            "The email programme and how often it sends",
            "Rough audience size and typical click rate",
            "Whether Action Credits are on your Braze contract",
          ]}
        />
      ),
    ),
  ],
};
