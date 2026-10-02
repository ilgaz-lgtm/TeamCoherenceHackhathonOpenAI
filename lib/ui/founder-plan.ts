import { childLabel } from "./personas";
import type { FounderAnswers } from "./personas";
import { localTask } from "./scope";
import type { ScopedTask } from "./scope";

export function buildFounderTasks(answers: FounderAnswers): ScopedTask[] {
  const coffee = /coffee|roaster|café|cafe/i.test(answers.businessType);
  const food = coffee || /food|beverage|restaurant|bakery|catering/i.test(answers.businessType);
  const hasPremises = answers.premisesNeed !== "none";
  const hasFamily = answers.movingWithSpouse || answers.movingWithChild;
  const sponsoredPartner = answers.movingWithSpouse && answers.partnerSponsorship === "spouse";
  const separatePartner = answers.movingWithSpouse && !sponsoredPartner;
  const spouseName = answers.spouseName?.trim() || (sponsoredPartner ? "your spouse" : "your partner");
  const childName = answers.childName?.trim() || ((answers.childAges?.length ?? 0) > 1 ? "your children" : "your child");
  const schoolChild = childLabel(childName, answers.childAge, answers.childAges);
  const cardReady = answers.isEstablishedInUAE && answers.establishmentCardReady === true;
  const householdMembers = [
    answers.name,
    ...(answers.movingWithSpouse ? [spouseName] : []),
    ...(answers.movingWithChild ? [childName] : []),
  ];
  const household = householdMembers.length > 1
    ? `${householdMembers.slice(0, -1).join(", ")} and ${householdMembers[householdMembers.length - 1]}`
    : householdMembers[0];

  const tasks: ScopedTask[] = [
    localTask(
      "activity-scope",
      "Select business activities",
      coffee
        ? "Select ADDED activity codes for coffee roasting and on-site café sales."
        : `Select ADDED activity codes that cover ${answers.businessType.trim()}.`,
      "licensing",
      "company",
    ),
    localTask(
      "legal-form",
      "Choose legal form and route",
      answers.customerMarket === "mixed"
        ? "Choose a legal form and licence route that cover both UAE domestic and international customers, ownership and intended Abu Dhabi activity."
        : "Choose a legal form and licence route that fit your customers, ownership and intended Abu Dhabi activity.",
      "licensing",
      "company",
      ["activity-scope"],
    ),
    localTask(
      "trade-name",
      "Reserve trade name",
      `Reserve ${answers.businessName.trim()} through ADDED before using it in formation documents.`,
      "licensing",
      "company",
      ["activity-scope"],
    ),
    localTask(
      "initial-approval",
      "Obtain initial approval",
      "Submit the activities, legal form and ownership details for ADDED initial approval.",
      "licensing",
      "company",
      ["legal-form", "trade-name"],
    ),
  ];

  if (hasPremises) {
    tasks.push(
      localTask(
        "premises-spec",
        "Set premises specification",
        answers.premisesNeed === "office"
          ? "Document office workstations, meeting space and access needs before searching sites."
          : answers.premisesNeed === "warehouse"
            ? "Document storage capacity, loading access and the intended goods before searching warehouse sites."
            : answers.premisesNeed === "mixed"
              ? "Document the separate office, storage, production and customer areas your operations need before searching sites."
              : coffee
                ? "Document the roasting footprint, food preparation and customer seating before searching sites."
                : "Document the space, equipment and customer access your operations require before searching sites.",
        "premises",
        "company",
        ["activity-scope"],
      ),
      localTask(
        "site-review",
        "Verify the candidate site",
        "Check the candidate address against the chosen activities and fit-out requirements before signing.",
        "premises",
        "company",
        ["premises-spec"],
      ),
      localTask(
        "lease",
        "Secure business tenancy",
        "Secure the accepted tenancy evidence for the chosen business site.",
        "premises",
        "company",
        ["site-review"],
      ),
    );
  }

  if (food) {
    tasks.push(localTask(
      "food-approvals",
      "Map food-operation approvals",
      "Use the activity and location record to identify the food-operation reviews required before opening.",
      "licensing",
      "company",
      hasPremises ? ["site-review"] : ["activity-scope"],
    ));
  }

  tasks.push(
    localTask(
      "licence",
      "Issue economic licence",
      "Submit the final formation documents and fees for the Abu Dhabi economic licence.",
      "licensing",
      "company",
      ["initial-approval", ...(hasPremises ? ["lease"] : []), ...(food ? ["food-approvals"] : [])],
    ),
    localTask(
      "establishment-card",
      answers.isEstablishedInUAE && answers.establishmentCardReady !== false ? "Verify establishment card" : "Obtain establishment card",
      answers.isEstablishedInUAE
        ? "Check the company establishment-card record and validity with ICP; obtain or renew it if needed before proceeding with company sponsorship."
        : "Apply to ICP for the establishment card using the valid company licence.",
      "licensing",
      "company",
      ["licence"],
    ),
    {
      ...localTask(
        "corporate-tax-review",
        "Review corporate tax registration",
        "Check FTA corporate tax registration requirements and timing for your licensed company; register if applicable.",
        "tax",
        "company",
        ["establishment-card"],
      ),
      rationale: "Your company needs an FTA registration review after setup; confirm whether registration applies and the deadline before filing.",
    },
    localTask(
      "business-bank",
      "Open business account",
      "Submit the issued company documents and open the operating bank account.",
      "banking",
      "company",
      ["licence"],
    ),
  );

  if (answers.headcountYearOne > 0) {
    tasks.push(localTask(
      "payroll",
      "Set payroll funding",
      `Set salary dates and fund payroll for the first ${answers.headcountYearOne} hires.`,
      "banking",
      "company",
      ["business-bank"],
    ));
  }

  if (answers.relocatingSelf) {
    tasks.push(localTask(
      "founder-residence",
      "Confirm founder residence and entry route",
      "Confirm the founder residence route with ICP and obtain the entry permission it requires before travel. This task completes on issued entry clearance; medical and final residence steps follow arrival.",
      "visa",
      "self",
      ["establishment-card"],
    ));
    tasks.push({
      ...localTask(
        "founder-entry",
        "Arrange your own entry and arrival",
        hasFamily
          ? "Use your issued entry permission to arrange and record your own arrival. Confirm whether sponsored family must follow after your residence is completed."
          : "After arranging travel, use your issued entry permission to enter and record your arrival before completing residence steps.",
        "travel",
        "self",
        hasFamily ? ["founder-residence"] : ["founder-residence", "family-travel"],
      ),
      rationale: "ICP entry permission does not record your physical arrival; enter on the confirmed route before you complete the later residence steps.",
    }, {
      ...localTask(
        "residency-completion",
        "Complete founder residence steps",
        "After your own arrival, confirm and complete the medical, Emirates ID and final residence steps applicable to your founder route with ICP.",
        "visa",
        "self",
        ["founder-entry"],
      ),
      rationale: "ICP entry permission is separate from your final founder residence status; confirm and complete the applicable steps after arrival.",
    });

    if (hasFamily) {
      const familyNames = [
        ...(sponsoredPartner ? [spouseName] : []),
        ...(answers.movingWithChild ? [childName] : []),
      ].join(" and ");
      tasks.push({
        ...localTask(
          "family-documents",
          "Gather family residence records",
          `Gather identity records for your accompanying household${answers.movingWithChild ? ` and parent-child relationship records for ${childName}` : ""}${sponsoredPartner ? ` and spouse relationship records for ${spouseName}` : ""}. Confirm the accepted document checklist with ICP.`,
          "visa",
          "self",
        ),
        rationale: "Prepare your family records while ICP processes your own route; gathering them does not grant entry clearance.",
      });
      if (familyNames) tasks.push(localTask(
        "family-sponsorship",
        "Confirm family sponsorship and entry permissions",
        `After your own residence is completed, confirm the eligible sponsorship route for ${familyNames} with ICP and record each person's issued entry permission before their travel.`,
        "visa",
        "self",
        ["residency-completion", "family-documents"],
      ));
      if (separatePartner) {
        tasks.push({
          ...localTask(
            "partner-route",
            answers.partnerSponsorship === "independent" ? "Confirm partner independent entry route" : "Resolve partner eligibility and entry route",
            answers.partnerSponsorship === "independent"
              ? `Confirm ${spouseName}'s independent entry route and record their issued entry permission with ICP before booking their travel.`
              : `Review ${spouseName}'s identity and relationship documents with ICP, resolve sponsorship eligibility or an independent route, and record their entry permission before booking travel.`,
            "visa",
            "self",
            ["family-documents", ...(answers.partnerSponsorship === "independent" ? [] : ["residency-completion"])],
          ),
          rationale: "Resolve your partner's eligible ICP route and entry permission; a partner answer alone does not establish spouse sponsorship.",
        });
      }
    }

    if (answers.movingWithChild) {
      tasks.push(localTask(
        "family-school",
        "Secure school placement",
        `Request school places for ${schoolChild}; confirm each child's admission eligibility from their records before committing to a home lease.`,
        "school",
        "self",
      ));
    }

    tasks.push(
      {
        ...localTask(
          "family-home-shortlist",
          "Shortlist residential areas and homes",
          "Compare available areas and homes against your business commute, household budget and any school options while placement is being resolved.",
          "housing",
          "self",
        ),
        rationale: answers.movingWithChild
          ? "The 'Secure school placement' decision gates your 'Secure family home' task; the shortlist can run while school enquiries are open."
          : "A residential shortlist prepares your 'Secure family home' task around the business commute and household budget.",
      },
      localTask(
        "family-home",
        "Secure family home",
        answers.movingWithChild
          ? `Choose and secure a residential lease that works for ${childName}'s school and the business site.`
          : "Choose and secure a residential lease that works for the business location.",
        "housing",
        "self",
        ["family-home-shortlist", ...(answers.movingWithChild ? ["family-school"] : [])],
      ),
      localTask(
        "family-insurance",
        "Set household health cover",
        `Set effective health-cover dates for ${household}.`,
        "insurance",
        "self",
      ),
      localTask(
        "family-travel",
        "Sequence household arrival",
        hasFamily
          ? "Arrange the remaining household arrivals against each person's confirmed entry permission; your own arrival can precede sponsored family travel."
          : "Book arrival against your confirmed entry permission, then record physical entry before completing residence steps.",
        "travel",
        "self",
        ["founder-residence", ...(sponsoredPartner || answers.movingWithChild ? ["family-sponsorship"] : []), ...(separatePartner ? ["partner-route"] : [])],
      ),
      localTask(
        "home-utilities",
        "Activate home services",
        "Open household utility accounts at the residential address after signing the home lease.",
        "settling",
        "self",
        ["family-home"],
      ),
    );
    if (sponsoredPartner || answers.movingWithChild) {
      tasks.push({
        ...localTask(
          "family-residence",
          "Complete family residence files",
          "After sponsored family members arrive, complete each person's remaining residence steps with ICP under their confirmed route.",
          "visa",
          "self",
          ["residency-completion", "family-sponsorship", "family-travel"],
        ),
        rationale: "ICP entry permissions clear your family's travel; their remaining residence steps follow arrival under each confirmed route.",
      });
    }
    if (separatePartner) {
      tasks.push({
        ...localTask(
          "partner-residence",
          "Complete partner residence route",
          `After ${spouseName} arrives, confirm and complete the remaining residence steps for their resolved route with ICP.`,
          "visa",
          "self",
          ["partner-route", "family-travel"],
        ),
        rationale: "ICP entry clearance and the later residence outcome are separate decisions under your partner's confirmed route.",
      });
    }
  }

  if (answers.headcountYearOne > 0) {
    tasks.push(
      localTask(
        "first-hire-roles",
        "Define first hires",
        `Choose the first roles from the ${answers.headcountYearOne}-person staffing plan.`,
        "workforce",
        "team",
        [],
      ),
      localTask(
        "work-permit-quota",
        "Check work-permit capacity",
        "Check work-permit capacity with MOHRE or the applicable authority for the first cohort.",
        "workforce",
        "team",
        ["establishment-card"],
      ),
      localTask(
        "offers-contracts",
        "Issue role-specific offers",
        "Prepare offers and contract terms for the first roles in the staffing plan.",
        "workforce",
        "team",
        ["first-hire-roles"],
      ),
      localTask(
        "employee-permits",
        "Submit first work permits",
        "Submit applications through the applicable authority using the registered employer file.",
        "visa",
        "team",
        ["work-permit-quota", "offers-contracts", "establishment-card"],
      ),
      localTask(
        "employee-arrivals",
        "Sequence first staff arrivals",
        "Set arrival dates against each approved work-permit path and the opening roster.",
        "travel",
        "team",
        ["employee-permits"],
      ),
      localTask(
        "employee-coverage",
        "Set staff health cover",
        "Choose and fund health cover effective from each hire's start.",
        "insurance",
        "team",
        ["offers-contracts"],
      ),
    );
  }

  if (!answers.isEstablishedInUAE) return tasks;

  const retainedTasks = tasks.filter((task) => task.layer !== "company" || (task.id === "establishment-card" && !cardReady));
  const retainedIds = new Set(retainedTasks.map((task) => task.id));
  return retainedTasks.map((task) => ({
    ...task,
    dependsOn: task.dependsOn.filter((id) => retainedIds.has(id)),
  }));
}
