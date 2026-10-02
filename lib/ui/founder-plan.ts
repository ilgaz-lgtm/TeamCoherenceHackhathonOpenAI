import { founderFamily } from "./personas";
import type { FounderAnswers } from "./personas";
import { localTask } from "./scope";
import type { ScopedTask } from "./scope";

export function buildFounderTasks(answers: FounderAnswers): ScopedTask[] {
  const coffee = /coffee|roaster|café|cafe/i.test(answers.businessType);
  const food = coffee || /food|beverage|restaurant|bakery|catering/i.test(answers.businessType);
  const hasPremises = answers.premisesNeed !== "none";
  const hasFamily = answers.movingWithSpouse || answers.movingWithChild;
  const spouseName = answers.spouseName ?? founderFamily.spouse;
  const childName = answers.childName ?? founderFamily.child;
  const childAge = answers.childAge ?? founderFamily.childAge;
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
      "Choose a legal form and licence route that fit your customers, ownership and intended Abu Dhabi activity.",
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
        coffee
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
      "Obtain establishment card",
      "Apply to ICP for the establishment card using the valid company licence.",
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
      "Confirm founder residence clearance",
      "Use the licensed company record to apply for the owner residence route with ICP and track clearance before arrival.",
      "visa",
      "self",
      ["establishment-card"],
    ));

    if (hasFamily) {
      const familyNames = [
        ...(answers.movingWithSpouse ? [spouseName] : []),
        ...(answers.movingWithChild ? [childName] : []),
      ].join(" and ");
      tasks.push({
        ...localTask(
          "family-documents",
          "Gather family residence records",
          `Gather identity and relationship records for ${familyNames} while your own residence route is being set.`,
          "visa",
          "self",
        ),
        rationale: "Your family records can be gathered while ICP processes your own route; gathering them does not grant entry clearance.",
      });
      tasks.push(localTask(
        "family-sponsorship",
        "Complete family residence files",
        `Submit residence applications for ${familyNames} after your own status is confirmed; track each family member's clearance before arrival.`,
        "visa",
        "self",
        ["founder-residence", "family-documents"],
      ));
    }

    if (answers.movingWithChild) {
      tasks.push(localTask(
        "family-school",
        "Secure school placement",
        `Request school places for ${childAge}-year-old ${childName} before choosing a home area.`,
        "school",
        "self",
      ));
    }

    tasks.push(
      localTask(
        "family-home",
        "Secure family home",
        answers.movingWithChild
          ? `Choose and secure a residential lease that works for ${childName}'s school and the business site.`
          : "Choose and secure a residential lease that works for the business location.",
        "housing",
        "self",
        answers.movingWithChild ? ["family-school"] : [],
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
        "Book arrival against the confirmed residence or entry permissions for each traveller.",
        "travel",
        "self",
        hasFamily ? ["family-sponsorship"] : ["founder-residence"],
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

  const peopleTasks = tasks.filter((task) => task.layer !== "company");
  const peopleIds = new Set(peopleTasks.map((task) => task.id));
  return peopleTasks.map((task) => ({
    ...task,
    dependsOn: task.dependsOn.filter((id) => peopleIds.has(id)),
  }));
}
