import type { Playbook } from "@/engine/types";
import {
  Area,
  ArrowList,
  Cards,
  Columns,
  Contact,
  Cover,
  Definition,
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

export const conversationalAgents: Playbook = {
  id: "conversational-agents",
  number: "03",
  comingSoon: true,
  title: "Conversational Agents",
  product: "Braze Conversational Agents · Beta",
  summary: "Two-way AI chat on web, SMS, RCS and WhatsApp that feeds your journeys and data.",
  slides: [
    slide(
      "cover",
      "Cover",
      [
        "Conversational Agents is a Braze beta feature.",
        "[NOTE] Parts of this playbook draw on Braze's partner onboarding deck, which is marked confidential. Check before sharing its detail with clients.",
      ],
      () => (
        <Cover
          number="03"
          title={["Conversational", "Agents"]}
          subtitle={["Two-way chat that", "gets things done"]}
          status="[ BRAZEAI™ · BETA · WEB, SMS, RCS, WHATSAPP ]"
          ground="catLookingUp"
        />
      ),
    ),

    slide(
      "what",
      "What it is",
      [
        "The agent understands what the customer is asking, replies in the brand's voice, and can complete tasks.",
        "Braze positions it for marketing, conversational commerce and basic support.",
      ],
      () => (
        <Point
          label={WHAT}
          lines={["Customers ask. An agent answers,", "[{acts}], and remembers."]}
          sub="A Braze channel for two-way AI chat on web, SMS, RCS and WhatsApp, in your brand's voice."
        />
      ),
    ),

    slide(
      "workflows",
      "Workflows",
      ["You build it as a set of workflows. Each has a purpose, channels, a target audience and plain-English steps."],
      () => (
        <Definition
          label={WHAT}
          image="/images/phone-hand.webp"
          alt="Collage: a hand holding a phone"
          term="Workflows"
          text="A workflow is one job you want the agent to do, written as plain-English steps. Each step can use tools."
        />
      ),
    ),

    slide(
      "tools",
      "What the agent can do",
      ["Workflow attributes last one session on web, and around 48 hours of inactivity on SMS, RCS and WhatsApp."],
      () => (
        <Page label={WHAT} head={["What the agent can do in a chat"]}>
          <Table
            widths={[4, 6, 5]}
            head={["Tool", "What it does", "Example"]}
            rows={[
              ["Search knowledge", "Looks up a Braze catalogue", "Products, FAQs, policies"],
              ["Get attribute", "Reads a field from the profile", "Plan type, loyalty tier"],
              ["Set attribute", "Saves something to the profile", "Skin type, preferred store"],
              ["Log event", "Records an event in Braze", "Can start a Canvas"],
              ["Call webhook", "Asks another system and reads the reply", "Order status, bookings"],
              ["Workflow attributes", "Remembers values during the chat", "Like Canvas context variables"],
            ]}
          />
        </Page>
      ),
    ),

    slide(
      "value",
      "Why it matters",
      ["The first card is the point. Most chat tools sit apart from CRM. This one lives where the customer data is."],
      () => (
        <Page label={WHY} head={["Why it matters"]}>
          <NumberCards
            items={[
              {
                title: "It lives with the data",
                text: "What a customer says is saved to their profile and used in later campaigns.",
              },
              { title: "Chats start journeys", text: "An event logged mid-chat can enter the customer into a Canvas." },
              { title: "Answers at any hour", text: "Routine questions are handled without a person." },
              { title: "Better data", text: "Customers state preferences in their own words." },
              { title: "One build", text: "The same workflow runs on web, SMS, RCS and WhatsApp." },
            ]}
          />
        </Page>
      ),
    ),

    slide(
      "limits",
      "Limits to be upfront about",
      [
        "The customer has to start the conversation. There is a pattern for that later in the deck.",
        "On SMS and RCS, a reply that matches an existing keyword trigger goes to the keyword, not the agent.",
      ],
      () => (
        <Page label={WHY} head={["Limits to be upfront about"]}>
          <Area top={290}>
            <ArrowList
              items={[
                "It is a beta. Access comes through the Braze account manager.",
                "The customer starts it. It cannot be a Canvas step yet.",
                "Short memory: the current chat on web, the last 48 hours on messaging channels.",
                "It only uses the profile fields written into the workflow.",
                "No built-in handover to a support tool. Braze has this planned.",
                "Speak to your legal team before using it with real customers.",
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
        "Knowledge is usually the largest piece of preparation. It is what stops the agent guessing.",
        "Message or Action Credits are required for any Braze Agents feature.",
      ],
      () => (
        <Page label={NEED} head={["What a client needs in place"]}>
          <Table
            widths={[3, 6, 5]}
            head={["Area", "What is needed", "Notes"]}
            rows={[
              ["Access", "Switched on in Agent Console", "Beta, via the account manager"],
              ["Legal", "Review by the client's legal team", "Before any live use"],
              ["Messaging", "SMS, RCS or WhatsApp live in Braze", "Switched on per subscription group"],
              ["Web", "Web SDK with SDK authentication", "Needs a developer"],
              ["Keywords", "A review of SMS and RCS keyword triggers", "Keywords beat the agent"],
              ["Knowledge", "Products, FAQs and policies as catalogues", "The biggest piece of preparation"],
              ["Other systems", "An API and credentials for each one", "Orders, bookings, refunds"],
              ["Brand voice", "Brand guidelines set in Braze", "Applied in settings"],
            ]}
          />
        </Page>
      ),
    ),

    slide(
      "decisions",
      "Decisions to make first",
      ["The fallback has to be designed: a phone number, a link, or an event that starts a Canvas or alerts a team."],
      () => (
        <Page label={NEED} head={["Decisions to make first"]}>
          <NumberCards
            items={[
              { title: "The jobs", text: "Which jobs the agent does, and which it does not." },
              { title: "The limits", text: "What it must never say or promise." },
              { title: "The fallback", text: "What happens when it cannot help. There is no automatic handover." },
              { title: "The data", text: "What is saved to the profile, and whether consent covers it." },
              { title: "The review", text: "Who reads conversations after launch, and how often." },
            ]}
          />
        </Page>
      ),
    ),

    slide(
      "setup",
      "Eight steps in Braze",
      [
        "Preview does not save attributes or events.",
        "Custom attributes save with a short delay. If the agent reads one straight after setting it, it may see the old value.",
      ],
      () => (
        <Page label={NEED} head={["Eight steps in Braze"]}>
          <Steps
            perRow={4}
            steps={[
              { tab: "Catalogues", text: "Load content and create knowledge sources." },
              { tab: "Web widget", text: "Set up the chat widget in the Web SDK." },
              { tab: "Workflow", text: "Name, purpose, channels and audience." },
              { tab: "Steps", text: "Plain English, each ending with a clear action." },
              { tab: "Tools", text: "Add them by typing / in a step." },
              { tab: "Settings", text: "Brand guidelines and the web opening message." },
              { tab: "Preview", text: "Test as a specific user." },
              { tab: "Launch", text: "Check Conversation history for every tool call." },
            ]}
          />
        </Page>
      ),
    ),

    slide(
      "where-opener",
      "Where it pays off",
      [
        "The strongest cases are ones where a short conversation removes a blocker, and what the customer says is worth keeping in Braze.",
      ],
      () => <Opener label={WHERE} lines={["A short chat that", "removes a [{blocker}]"]} />,
    ),

    slide(
      "use-cases",
      "Where to use it",
      ["These came out of the Braze partner workshop. The first two suit fintech and subscription apps."],
      () => (
        <Page label={WHERE} head={["Where to use it"]}>
          <Table
            widths={[4, 9, 5]}
            head={["Use case", "How it works", "What it needs"]}
            rows={[
              [
                "Onboarding blocker",
                "Asks a stalled customer what is stopping them, and saves the reason",
                "FAQ catalogue",
              ],
              ["Inactivity prompt", '"What can we help you with?" after 7 quiet days', "A Canvas to send the prompt"],
              ["Appointments", "Answers what to expect on the day, and rebooks", "Booking API, legal review"],
              ["Routine building", "Explains how to keep using the product, step by step", "How-to content"],
              ["Shopping assistant", "Asks about needs, then recommends products", "Product catalogue"],
              ["Order status", "Looks up where an order is", "Order system API"],
              ["Call follow-up", "Picks up after a call, using the call log", "Call centre API, legal review"],
            ]}
          />
        </Page>
      ),
    ),

    slide(
      "inbound",
      "Getting round the inbound limit",
      [
        "On SMS, RCS and WhatsApp the agent can see the last 48 hours of messages, so it has the outbound prompt as context.",
      ],
      () => (
        <Page label={WHERE} head={["Getting round “the customer starts it”"]}>
          <Steps
            steps={[
              { tab: "Prompt", text: "A Canvas sends a message that invites a reply." },
              { tab: "Reply", text: "The customer answers. The agent picks up, with the prompt as context." },
              { tab: "Hand on", text: "The agent logs an event, which starts the next Canvas." },
            ]}
          />
        </Page>
      ),
    ),

    slide("fit", "Good fit, poor fit", ["Worth proposing if most of the left column is true."], () => (
      <Page label={WHERE} head={["Good fit, poor fit"]}>
        <Columns
          columns={[
            {
              title: "Good fit",
              lines: [
                "WhatsApp, SMS or RCS already live in Braze, or the Web SDK.",
                "A clear, narrow job for the agent.",
                "The answers already exist in writing.",
                "Any system it needs to reach has an API.",
              ],
              close: "And legal are open to customer-facing AI.",
            },
            {
              title: "Poor fit for now",
              lines: [
                "Complex support that needs a person.",
                "Chats that depend on history older than 48 hours.",
                "Regulated advice.",
                "Heavy SMS keyword use on the same numbers.",
              ],
            },
          ]}
        />
      </Page>
    )),

    slide(
      "way-opener",
      "The SCHMACK way",
      [
        "The work is choosing the right job, preparing the content, connecting the systems, writing workflows that behave, and testing hard.",
        "We join it to the wider Braze programme so conversations feed journeys and data.",
      ],
      () => <Opener label={OURS} lines={["Quick to switch on.", "Harder to make [{useful}]."]} />,
    ),

    slide(
      "delivery",
      "How we deliver it",
      [
        "Four to six weeks to a pilot for a content-only use case. Longer if another system needs connecting.",
        "The structure and durations are a first draft, not agreed figures.",
        "[NOTE] Open with Braze: what happens when a customer hits a frequency cap then starts a new WhatsApp chat, and whether the agent can search URLs and terms and conditions.",
      ],
      () => (
        <Page label={OURS} head={["How we deliver it"]}>
          <Steps
            perRow={3}
            steps={[
              {
                tab: "Choose the job",
                text: "Pick one or two use cases. Check channels, content, systems and legal.",
                meta: "1 week",
              },
              {
                tab: "Prepare",
                text: "Load catalogues, define attributes and events, specify API calls.",
                meta: "1 to 3 weeks",
              },
              {
                tab: "Build",
                text: "Write workflows and tools, set brand voice, build the Canvases around it.",
                meta: "1 week",
              },
              { tab: "Test", text: "Run scripted and awkward conversations. Client and legal review.", meta: "1 week" },
              {
                tab: "Launch small",
                text: "Limit to a segment and review conversations daily at first.",
                meta: "2 to 4 weeks",
              },
              {
                tab: "Review",
                text: "Report volumes, outcomes and data captured. Recommend next steps.",
                meta: "Ongoing",
              },
            ]}
          />
        </Page>
      ),
    ),

    slide(
      "questions",
      "The questions clients ask",
      [
        "A chatty agent means more billable messages on WhatsApp.",
        "Braze has not set pricing for after general release.",
      ],
      () => (
        <Page label={OURS} head={["The questions clients ask"]}>
          <Table
            widths={[4, 10]}
            head={["Question", "Answer today"]}
            rows={[
              [
                "How much does it cost?",
                "No charge per conversation during the beta. Outbound SMS and WhatsApp still use credits, and Meta charges for WhatsApp replies.",
              ],
              [
                "How long does it take?",
                "Four to six weeks from kick-off to a pilot for a content-only use case. Longer with integrations.",
              ],
              [
                "What do you need from us?",
                "A CRM owner, the content owner, legal, a developer for web or APIs, and the Braze account manager.",
              ],
              [
                "What content do we need?",
                "The answers in writing: products, FAQs, policies and how-to guides, plus brand guidelines.",
              ],
              [
                "What data do we need?",
                "The profile attributes it should use, and API access to any system it looks things up in.",
              ],
              ["Can it hand over to a person?", "Not automatically. We design a fallback."],
              ["Is it safe?", "It answers only from what it is given, and every conversation and tool call is logged."],
            ]}
          />
        </Page>
      ),
    ),

    slide(
      "why-schmack",
      "Why SCHMACK",
      ["[NOTE] Build a demo agent in our own workspace. Braze asks that demos carry a beta caveat."],
      () => (
        <Page label={OURS} head={["Why SCHMACK"]}>
          <Cards
            items={[
              { title: "Braze specialists", lede: "Catalogues, webhooks and Canvas are most of the build." },
              { title: "In the beta", lede: "A direct line to Braze's product team for feedback and fixes." },
              { title: "Joined up", lede: "The chat feeds your journeys and data. It is not a standalone chatbot." },
            ]}
          />
        </Page>
      ),
    ),

    slide(
      "contact",
      "Get in touch",
      ["[NOTE] Team names, certifications and contact details still need adding."],
      () => (
        <Contact
          lines={["Tell us where your", "customers get [{stuck}]"]}
          bring={[
            "The job you would want the agent to do",
            "The channels you use in Braze today",
            "Where the answers live now",
            "Your legal team's view on customer-facing AI",
          ]}
        />
      ),
    ),
  ],
};
