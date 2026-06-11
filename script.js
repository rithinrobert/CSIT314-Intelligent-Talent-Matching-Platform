let isLoggedIn = false;
let API_ONLINE = false;
const API_BASE = "";

async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(API_BASE + endpoint, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "API request failed");
    API_ONLINE = true;
    return data;
  } catch (error) {
    API_ONLINE = false;
    console.warn("Backend unavailable, using browser storage fallback:", error.message);
    throw error;
  }
}

let currentRole = null;

const roleHomePages = {
  candidate: "dashboard",
  employer: "employerDashboard",
  admin: "adminDashboard"
};

const rolePages = {
  candidate: ["dashboard", "profile", "membership", "search", "recommendations", "applications"],
  employer: ["employerDashboard", "employerProfile", "postJob", "postedJobs", "candidateSearch", "candidateRecommendations"],
  admin: ["adminDashboard", "manageUsers", "manageJobs"]
};

function updateRoleView(role) {
  document.body.classList.remove("logged-in", "role-candidate", "role-employer", "role-admin");

  if (role) {
    document.body.classList.add("logged-in", `role-${role}`);
  }

  const portalLabel = document.getElementById("portalLabel");
  if (portalLabel) {
    if (role === "candidate") portalLabel.textContent = "Candidate Portal";
    else if (role === "employer") portalLabel.textContent = "Employer Portal";
    else if (role === "admin") portalLabel.textContent = "Admin Portal";
    else portalLabel.textContent = "Select Portal";
  }
}

function canAccessPage(pageId) {
  if (pageId === "login") return true;
  if (!currentRole) return false;
  return rolePages[currentRole].includes(pageId);
}


const jobs = [
  {
    title: "Software Engineer",
    company: "TechNova Solutions",
    location: "Sydney",
    mode: "Hybrid",
    level: "Entry Level",
    description: "Develop web applications, maintain software features, and work with JavaScript, Python and database systems.",
    skills: "javascript python html css software database",
    match: 92
  },
  {
    title: "Frontend Developer",
    company: "BrightApps",
    location: "Sydney",
    mode: "Remote",
    level: "Entry Level",
    description: "Build responsive user interfaces using HTML, CSS, JavaScript and React for customer-facing applications.",
    skills: "html css javascript react frontend ui",
    match: 89
  },
  {
    title: "Data Analyst",
    company: "InsightWorks",
    location: "Wollongong",
    mode: "On-site",
    level: "Entry Level",
    description: "Analyse business data, prepare dashboards, write SQL queries and support reporting decisions.",
    skills: "python sql data analytics dashboard",
    match: 86
  },
  {
    title: "Junior Web Developer",
    company: "CloudPath",
    location: "Sydney",
    mode: "Hybrid",
    level: "Entry Level",
    description: "Assist in developing websites, fixing bugs and implementing small web features using HTML, CSS and JavaScript.",
    skills: "html css javascript web developer",
    match: 84
  },
  {
    title: "IT Support Officer",
    company: "Metro Systems",
    location: "Melbourne",
    mode: "On-site",
    level: "Entry Level",
    description: "Provide technical support, troubleshoot hardware and software issues, and assist users with system problems.",
    skills: "support networking troubleshooting hardware software",
    match: 80
  },
  {
    title: "Systems Analyst",
    company: "BlueCore Digital",
    location: "Sydney",
    mode: "Hybrid",
    level: "Mid Level",
    description: "Analyse business requirements, document system needs and support database-driven software solutions.",
    skills: "analysis database sql business requirements",
    match: 78
  },
  {
    title: "Database Administrator",
    company: "DataStack",
    location: "Melbourne",
    mode: "Remote",
    level: "Mid Level",
    description: "Maintain databases, optimise SQL queries, manage backups and improve database performance.",
    skills: "sql database python backup performance",
    match: 76
  },
  {
    title: "QA Tester",
    company: "QualitySoft",
    location: "Wollongong",
    mode: "Hybrid",
    level: "Entry Level",
    description: "Test web applications, report bugs, write test cases and support software quality assurance.",
    skills: "testing debugging automation qa test cases",
    match: 74
  },
  {
    title: "Network Engineer",
    company: "NetSecure",
    location: "Sydney",
    mode: "On-site",
    level: "Mid Level",
    description: "Manage network infrastructure, monitor security, configure devices and support connectivity issues.",
    skills: "network security support infrastructure",
    match: 72
  },
  {
    title: "Backend Developer",
    company: "ServerLab",
    location: "Melbourne",
    mode: "Hybrid",
    level: "Mid Level",
    description: "Develop APIs, manage server-side logic, connect database services and maintain backend systems.",
    skills: "python api database sql backend server",
    match: 70
  },
  {
    title: "Cloud Support Associate",
    company: "CloudBridge",
    location: "Sydney",
    mode: "Remote",
    level: "Entry Level",
    description: "Support cloud users, troubleshoot cloud service issues and assist with basic infrastructure tasks.",
    skills: "cloud support networking infrastructure",
    match: 68
  },
  {
    title: "Graduate Developer",
    company: "NextHire",
    location: "Wollongong",
    mode: "Hybrid",
    level: "Entry Level",
    description: "Graduate role focused on learning software development, web systems and basic programming practices.",
    skills: "javascript python html css graduate software",
    match: 66
  }
];

window.onload = function () {
  isLoggedIn = false;
  currentRole = null;
  updateRoleView(null);
  showPage("login");
};

function getUser() {
  return JSON.parse(localStorage.getItem("talentUser"));
}

function saveUser(user) {
  localStorage.setItem("talentUser", JSON.stringify(user));
}

function showPage(pageId) {
  if (pageId !== "login" && !isLoggedIn) {
    alert("Please login first to access this page.");
    pageId = "login";
  }

  if (isLoggedIn && !canAccessPage(pageId)) {
    alert("This page is not available for your selected account type.");
    pageId = roleHomePages[currentRole] || "login";
  }

  document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(button => button.classList.remove("active-nav"));

  document.getElementById(pageId).classList.add("active");

  const activeButton = Array.from(document.querySelectorAll(".nav-btn")).find(btn =>
    btn.getAttribute("onclick") === `showPage('${pageId}')`
  );

  if (activeButton) activeButton.classList.add("active-nav");

  if (pageId === "dashboard" && isLoggedIn) updateDashboard();
  if (pageId === "membership" && isLoggedIn) updateMembershipUI();
  if (pageId === "recommendations" && isLoggedIn) generateRecommendations();
  if (pageId === "applications" && isLoggedIn) loadApplications();
  if (pageId === "employerDashboard" && isLoggedIn) updateEmployerDashboard();
  if (pageId === "employerProfile" && isLoggedIn) { loadEmployerProfile(); updateEmployerMembershipUI(); }
  if (pageId === "postedJobs" && isLoggedIn) loadPostedJobs();
  if (pageId === "candidateSearch" && isLoggedIn) searchCandidates();
  if (pageId === "candidateRecommendations" && isLoggedIn) generateCandidateRecommendations();
  if (pageId === "adminDashboard" && isLoggedIn) updateAdminDashboard();
  if (pageId === "manageUsers" && isLoggedIn) loadManageUsers();
  if (pageId === "manageJobs" && isLoggedIn) loadManageJobs();
}

async function createAccount() {
  const name = document.getElementById("authName").value.trim();
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value.trim();
  const role = document.getElementById("authRole").value;

  if (!name || !email || !password) {
    alert("Please fill in full name, email and password to create an account.");
    return;
  }

  if (!email.includes("@")) {
    alert("Please enter a valid email address.");
    return;
  }

  const user = {
    name,
    email,
    password,
    contact: "",
    education: "",
    major: "",
    experience: "",
    skills: "",
    workMode: "",
    location: "",
    membership: "Free",
    role
  };

  try {
    const result = await apiRequest("/api/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role })
    });
    saveUser({ ...user, id: result.user.id });
    alert("Account created successfully in backend. Now login using the same email and password.");
  } catch (error) {
    saveUser(user);
    alert("Account created locally. Backend was not available, but the frontend prototype still works.");
  }
}

async function loginUser() {
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value.trim();
  const selectedRole = document.getElementById("authRole").value;
  const user = getUser();

  if (!user) {
    alert("No account found. Please create an account first.");
    return;
  }

  if (!email || !password) {
    alert("Please enter your email and password.");
    return;
  }

  let loginAccount = user;

  try {
    const result = await apiRequest("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role: selectedRole })
    });
    loginAccount = { ...user, ...result.user, password };
    saveUser(loginAccount);
  } catch (error) {
    loginAccount = user;
  }

  if (email === loginAccount.email && password === loginAccount.password && selectedRole === (loginAccount.role || "candidate")) {
    isLoggedIn = true;
    currentRole = loginAccount.role || "candidate";
    updateRoleView(currentRole);
    alert("Login successful.");

    if (currentRole === "candidate") {
      loadProfile();
      updateDashboard();
    } else if (currentRole === "employer") {
      loadEmployerProfile();
      updateEmployerDashboard();
    } else if (currentRole === "admin") {
      updateAdminDashboard();
    }

    showPage(roleHomePages[currentRole]);
  } else {
    alert("Incorrect email, password, or account type.");
  }
}

function logoutUser() {
  isLoggedIn = false;
  currentRole = null;
  updateRoleView(null);
  alert("Logged out successfully.");
  showPage("login");
}

async function saveProfile() {
  if (!isLoggedIn) {
    alert("Please login first.");
    return;
  }

  const user = getUser();

  user.name = document.getElementById("profileName").value.trim();
  user.contact = document.getElementById("profileContact").value.trim();
  user.education = document.getElementById("profileEducation").value.trim();
  user.major = document.getElementById("profileMajor").value.trim();
  user.experience = document.getElementById("profileExperience").value.trim();
  user.skills = document.getElementById("profileSkills").value.trim();
  user.workMode = document.getElementById("profileWorkMode").value;
  user.location = document.getElementById("profileLocation").value.trim();

  if (
    !user.name ||
    !user.contact ||
    !user.education ||
    !user.major ||
    !user.experience ||
    !user.skills ||
    !user.workMode ||
    !user.location
  ) {
    alert("Please complete all profile fields before saving.");
    return;
  }

  saveUser(user);

  if (user.id) {
    try {
      await apiRequest(`/api/candidates/${user.id}`, {
        method: "PUT",
        body: JSON.stringify(user)
      });
    } catch (error) {
      // localStorage fallback is already saved
    }
  }

  alert("Candidate profile saved successfully.");
  updateDashboard();
}

function loadProfile() {
  const user = getUser();
  if (!user) return;

  document.getElementById("profileName").value = user.name || "";
  document.getElementById("profileContact").value = user.contact || "";
  document.getElementById("profileEducation").value = user.education || "";
  document.getElementById("profileMajor").value = user.major || "";
  document.getElementById("profileExperience").value = user.experience || "";
  document.getElementById("profileSkills").value = user.skills || "";
  document.getElementById("profileWorkMode").value = user.workMode || "";
  document.getElementById("profileLocation").value = user.location || "";
}

function updateDashboard() {
  const user = getUser();
  if (!user) return;

  document.getElementById("dashName").textContent = user.name || "Candidate";
  document.getElementById("dashMembership").textContent = user.membership || "Free";
  document.getElementById("dashWorkMode").textContent = user.workMode || "Not selected";
  document.getElementById("dashLocation").textContent = user.location || "Not added";
  document.getElementById("dashSkills").textContent = user.skills || "No skills added";
  document.getElementById("dashEducation").textContent = user.education || "Not added";
  document.getElementById("dashExperience").textContent = user.experience || "Not added";
  document.getElementById("dashContact").textContent = user.contact || "Not added";
  document.getElementById("dashMajor").textContent = user.major || "Not added";

  const fields = [
    user.name,
    user.contact,
    user.education,
    user.major,
    user.experience,
    user.skills,
    user.workMode,
    user.location
  ];

  const completed = fields.filter(field => field && field.trim() !== "").length;
  const percentage = Math.round((completed / fields.length) * 100);

  document.getElementById("dashProfileCompletion").textContent = percentage + "%";
  document.getElementById("dashRecommendedJobs").textContent = user.membership === "Premium" ? "Unlimited" : "10";
  document.getElementById("membershipNote").textContent =
    user.membership === "Premium" ? "Premium access activated" : "Upgrade for unlimited results";
}

function openPaymentModal() {
  if (!isLoggedIn) {
    alert("Please login first.");
    return;
  }

  const user = getUser();

  if (user.membership === "Premium") {
    alert("You are already a Premium member.");
    return;
  }

  document.getElementById("paymentModal").style.display = "flex";
}

function closePaymentModal() {
  document.getElementById("paymentModal").style.display = "none";
}

async function processPayment() {
  const cardName = document.getElementById("cardName").value.trim();
  const cardNumber = document.getElementById("cardNumber").value.trim();
  const expiryDate = document.getElementById("expiryDate").value.trim();
  const cvv = document.getElementById("cvv").value.trim();

  if (!cardName || !cardNumber || !expiryDate || !cvv) {
    alert("Please complete all payment fields.");
    return;
  }

  if (!/^\d{16}$/.test(cardNumber)) {
    alert("Card number must contain exactly 16 digits.");
    return;
  }

  if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
    alert("Expiry date must be in MM/YY format.");
    return;
  }

  if (!/^\d{3}$/.test(cvv)) {
    alert("CVV must contain exactly 3 digits.");
    return;
  }

  const user = getUser();
  user.membership = "Premium";
  saveUser(user);

  if (user.id) {
    try {
      await apiRequest(`/api/membership/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({ membership: "Premium" })
      });
    } catch (error) {
      // localStorage fallback is already saved
    }
  }

  closePaymentModal();
  clearPaymentFields();
  updateDashboard();
  updateMembershipUI();

  alert("Payment successful. Premium membership activated.");
}

function clearPaymentFields() {
  document.getElementById("cardName").value = "";
  document.getElementById("cardNumber").value = "";
  document.getElementById("expiryDate").value = "";
  document.getElementById("cvv").value = "";
}

function downgradeMembership() {
  if (!isLoggedIn) {
    alert("Please login first.");
    return;
  }

  const user = getUser();
  user.membership = "Free";
  saveUser(user);

  alert("Membership changed back to Free Plan.");
  updateDashboard();
  updateMembershipUI();
}

function updateMembershipUI() {
  const user = getUser();
  if (!user) return;

  const premiumCard = document.getElementById("premiumPlanCard");
  const premiumButton = document.getElementById("premiumButton");

  if (user.membership === "Premium") {
    premiumCard.classList.add("active-premium");
    premiumButton.textContent = "Premium Activated";
    premiumButton.disabled = true;
  } else {
    premiumCard.classList.remove("active-premium");
    premiumButton.textContent = "Upgrade to Premium";
    premiumButton.disabled = false;
  }
}

function generateRecommendations() {
  const user = getUser();
  if (!user) return;

  let recommendedJobs = getAllJobs();

  recommendedJobs = recommendedJobs.map(job => {
    let score = job.match;

    if (user.location && job.location.toLowerCase().includes(user.location.toLowerCase().split("/")[0].trim())) {
      score += 5;
    }

    if (user.workMode && job.mode === user.workMode) {
      score += 5;
    }

    if (user.major && job.description.toLowerCase().includes(user.major.toLowerCase())) {
      score += 3;
    }

    if (user.skills) {
      const userSkills = user.skills.toLowerCase().split(",").map(skill => skill.trim());
      userSkills.forEach(skill => {
        if (job.skills.includes(skill) || job.description.toLowerCase().includes(skill)) {
          score += 3;
        }
      });
    }

    return { ...job, finalMatch: Math.min(score, 99) };
  });

  recommendedJobs.sort((a, b) => b.finalMatch - a.finalMatch);

  if (user.membership !== "Premium") {
    recommendedJobs = recommendedJobs.slice(0, 10);
    document.getElementById("recommendationText").textContent =
      "Free membership active: showing Top 10 recommended jobs only.";
  } else {
    document.getElementById("recommendationText").textContent =
      "Premium membership active: showing unlimited recommended jobs.";
  }

  displayJobs(recommendedJobs, "recommendationList");
}

function searchJobs() {
  if (!isLoggedIn) {
    alert("Please login first.");
    return;
  }

  const keyword = document.getElementById("searchKeyword").value.toLowerCase().trim();
  const location = document.getElementById("searchLocation").value;
  const mode = document.getElementById("searchWorkMode").value;
  const level = document.getElementById("searchExperience").value;

  let results = getAllJobs().filter(job => {
    const combinedText = `
      ${job.title}
      ${job.company}
      ${job.description}
      ${job.skills}
      ${job.location}
      ${job.mode}
      ${job.level}
    `.toLowerCase();

    const keywordMatch =
      !keyword ||
      combinedText.includes(keyword) ||
      fuzzyMatch(keyword, combinedText);

    const locationMatch = !location || job.location === location;
    const modeMatch = !mode || job.mode === mode;
    const levelMatch = !level || job.level === level;

    return keywordMatch && locationMatch && modeMatch && levelMatch;
  });

  document.getElementById("searchMessage").textContent =
    results.length > 0 ? `${results.length} matching job(s) found.` : "No matching jobs found.";

  displayJobs(results, "searchResults");
}

function fuzzyMatch(keyword, text) {
  const typoMap = {
    "sofware enginer": "software engineer",
    "software enginer": "software engineer",
    "programmer": "developer",
    "coder": "developer",
    "js": "javascript",
    "web dev": "web developer"
  };

  if (typoMap[keyword] && text.includes(typoMap[keyword])) {
    return true;
  }

  return false;
}

function displayJobs(jobArray, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (jobArray.length === 0) {
    container.innerHTML = `<p class="muted">No jobs available.</p>`;
    return;
  }

  jobArray.forEach(job => {
    const matchScore = job.finalMatch || job.match;

  container.innerHTML += `
    <div class="job-card">
      <div>
        <h3>${job.title}</h3>
        <p>${job.company} · ${job.location} · ${job.mode} · ${job.level}</p>
        <p>${job.description}</p>

        <button
          class="primary"
          onclick="applyForJob('${job.title}')"
          style="margin-top:10px;">
          Apply Now
        </button>
      </div>

      <span>${matchScore}% Match</span>
    </div>
  `;})
}
async function applyForJob(jobTitle) {
  const user = getUser();

  if (!user) {
    alert("Please login first.");
    return;
  }

  let applications =
    JSON.parse(localStorage.getItem("applications")) || [];

  const alreadyApplied = applications.some(
    job => job.title === jobTitle
  );

  if (alreadyApplied) {
    alert("You have already applied for this job.");
    return;
  }

  const application = {
    title: jobTitle,
    date: new Date().toLocaleDateString(),
    status: "Submitted"
  };

  applications.push(application);

  if (user.id) {
    try {
      await apiRequest("/api/applications", {
        method: "POST",
        body: JSON.stringify({ candidateId: user.id, jobTitle })
      });
    } catch (error) {
      // localStorage fallback is already saved
    }
  }

  localStorage.setItem(
    "applications",
    JSON.stringify(applications)
  );

  alert("Application submitted successfully.");
}

function loadApplications() {
  const container =
    document.getElementById("applicationsList");

  if (!container) return;

  const applications =
    JSON.parse(localStorage.getItem("applications")) || [];

  if (applications.length === 0) {
    container.innerHTML =
      "<p class='muted'>No applications submitted yet.</p>";
    return;
  }

  container.innerHTML = "";

  applications.forEach(app => {
    container.innerHTML += `
      <div class="job-card">
        <div>
          <h3>${app.title}</h3>
          <p>Applied: ${app.date}</p>
        </div>
        <span>${app.status}</span>
      </div>
    `;
  });
}

function getStoredJobs() {
  return JSON.parse(localStorage.getItem("employerJobs")) || [];
}

function saveStoredJobs(jobArray) {
  localStorage.setItem("employerJobs", JSON.stringify(jobArray));
}

function getAllJobs() {
  return [...jobs, ...getStoredJobs()];
}

function getEmployerProfile() {
  const stored = JSON.parse(localStorage.getItem("employerProfile"));
  return stored || {
    companyName: "",
    industry: "",
    contact: "",
    location: "",
    membership: "Free"
  };
}

function saveEmployer(profile) {
  localStorage.setItem("employerProfile", JSON.stringify(profile));
}

async function saveEmployerProfile() {
  const profile = getEmployerProfile();
  profile.companyName = document.getElementById("empCompanyName").value.trim();
  profile.industry = document.getElementById("empIndustry").value.trim();
  profile.contact = document.getElementById("empContact").value.trim();
  profile.location = document.getElementById("empLocation").value.trim();

  if (!profile.companyName || !profile.industry || !profile.contact || !profile.location) {
    alert("Please complete all employer profile fields before saving.");
    return;
  }

  saveEmployer(profile);

  const user = getUser();
  if (user && user.id) {
    try {
      await apiRequest(`/api/employers/${user.id}`, {
        method: "PUT",
        body: JSON.stringify(profile)
      });
    } catch (error) {
      // localStorage fallback is already saved
    }
  }

  document.getElementById("jobCompany").value = profile.companyName;
  alert("Employer profile saved successfully.");
  updateEmployerDashboard();
}

function loadEmployerProfile() {
  const profile = getEmployerProfile();
  document.getElementById("empCompanyName").value = profile.companyName || "";
  document.getElementById("empIndustry").value = profile.industry || "";
  document.getElementById("empContact").value = profile.contact || "";
  document.getElementById("empLocation").value = profile.location || "";

  if (document.getElementById("jobCompany") && profile.companyName) {
    document.getElementById("jobCompany").value = profile.companyName;
  }
}

function updateEmployerDashboard() {
  const profile = getEmployerProfile();
  const postedJobs = getStoredJobs();
  const fields = [profile.companyName, profile.industry, profile.contact, profile.location];
  const completed = fields.filter(field => field && field.trim() !== "").length;
  const percentage = Math.round((completed / fields.length) * 100);

  document.getElementById("empProfileStatus").textContent = percentage + "%";
  document.getElementById("empPostedCount").textContent = postedJobs.length;
  document.getElementById("empRecommendationLimit").textContent = profile.membership === "Premium" ? "Unlimited" : "10";
  document.getElementById("empMembershipStatus").textContent = profile.membership || "Free";
  document.getElementById("empMembershipNote").textContent =
    profile.membership === "Premium" ? "Premium access activated" : "Upgrade for unlimited candidates";

  document.getElementById("empDashCompany").textContent = profile.companyName || "Not added";
  document.getElementById("empDashIndustry").textContent = profile.industry || "Not added";
  document.getElementById("empDashContact").textContent = profile.contact || "Not added";
  document.getElementById("empDashLocation").textContent = profile.location || "Not added";
}

function upgradeEmployerMembership() {
  const profile = getEmployerProfile();
  profile.membership = "Premium";
  saveEmployer(profile);
  alert("Employer Premium membership activated.");
  updateEmployerMembershipUI();
  updateEmployerDashboard();
}

function downgradeEmployerMembership() {
  const profile = getEmployerProfile();
  profile.membership = "Free";
  saveEmployer(profile);
  alert("Employer membership changed back to Free Plan.");
  updateEmployerMembershipUI();
  updateEmployerDashboard();
}

function updateEmployerMembershipUI() {
  const profile = getEmployerProfile();
  const premiumCard = document.getElementById("empPremiumPlanCard");
  const premiumButton = document.getElementById("empPremiumButton");
  if (!premiumCard || !premiumButton) return;

  if (profile.membership === "Premium") {
    premiumCard.classList.add("active-premium");
    premiumButton.textContent = "Employer Premium Activated";
    premiumButton.disabled = true;
  } else {
    premiumCard.classList.remove("active-premium");
    premiumButton.textContent = "Activate Employer Premium";
    premiumButton.disabled = false;
  }
}

async function saveJobPosting() {
  const title = document.getElementById("jobTitle").value.trim();
  const company = document.getElementById("jobCompany").value.trim();
  const education = document.getElementById("jobEducation").value.trim();
  const skills = document.getElementById("jobSkills").value.trim();
  const experience = document.getElementById("jobExperience").value.trim();
  const mode = document.getElementById("jobMode").value;
  const location = document.getElementById("jobLocation").value;
  const level = document.getElementById("jobLevel").value;
  const description = document.getElementById("jobDescription").value.trim();

  if (!title || !company || !education || !skills || !experience || !mode || !location || !level || !description) {
    alert("Please complete all job posting fields before publishing.");
    return;
  }

  const newJob = {
    id: "job-" + Date.now(),
    title,
    company,
    location,
    mode,
    level,
    description: `${description} Required education: ${education}. Experience: ${experience}.`,
    skills: skills.toLowerCase(),
    education,
    experience,
    match: 75,
    source: "Employer Posted"
  };

  const postedJobs = getStoredJobs();
  postedJobs.push(newJob);
  saveStoredJobs(postedJobs);

  try {
    const user = getUser();
    await apiRequest("/api/jobs", {
      method: "POST",
      body: JSON.stringify({ ...newJob, employerId: user ? user.id : "" })
    });
  } catch (error) {
    // localStorage fallback is already saved
  }

  document.getElementById("jobTitle").value = "";
  document.getElementById("jobEducation").value = "";
  document.getElementById("jobSkills").value = "";
  document.getElementById("jobExperience").value = "";
  document.getElementById("jobMode").value = "";
  document.getElementById("jobLocation").value = "";
  document.getElementById("jobLevel").value = "";
  document.getElementById("jobDescription").value = "";

  alert("Job posting published successfully.");
  updateEmployerDashboard();
}

function loadPostedJobs() {
  const container = document.getElementById("postedJobsList");
  const postedJobs = getStoredJobs();

  if (postedJobs.length === 0) {
    container.innerHTML = "<p class='muted'>No employer job posts created yet.</p>";
    return;
  }

  container.innerHTML = "";
  postedJobs.forEach(job => {
    container.innerHTML += `
      <div class="job-card">
        <div>
          <h3>${job.title}</h3>
          <p>${job.company} · ${job.location} · ${job.mode} · ${job.level}</p>
          <p>${job.description}</p>
        </div>
        <button class="secondary" onclick="deletePostedJob('${job.id}')">Delete</button>
      </div>
    `;
  });
}

function deletePostedJob(jobId) {
  let postedJobs = getStoredJobs();
  postedJobs = postedJobs.filter(job => job.id !== jobId);
  saveStoredJobs(postedJobs);
  loadPostedJobs();
  updateEmployerDashboard();
}

const sampleCandidates = [
  {
    id: "sample-1",
    name: "Amelia Chen",
    contact: "amelia@example.com",
    education: "Bachelor of Computer Science",
    major: "Software Development",
    experience: "1 year internship",
    skills: "HTML, CSS, JavaScript, Python",
    workMode: "Hybrid",
    location: "Sydney",
    match: 94
  },
  {
    id: "sample-2",
    name: "Ryan Kumar",
    contact: "ryan@example.com",
    education: "Bachelor of Information Technology",
    major: "Data Analytics",
    experience: "Entry level",
    skills: "Python, SQL, Dashboard, Data Analytics",
    workMode: "Remote",
    location: "Wollongong",
    match: 88
  },
  {
    id: "sample-3",
    name: "Sophie Miller",
    contact: "sophie@example.com",
    education: "Diploma of IT",
    major: "Networking",
    experience: "2 years IT support",
    skills: "Networking, Troubleshooting, Support, Security",
    workMode: "On-site",
    location: "Melbourne",
    match: 82
  },
  {
    id: "sample-4",
    name: "Noah Wilson",
    contact: "noah@example.com",
    education: "Bachelor of Computer Science",
    major: "Backend Development",
    experience: "2 years development",
    skills: "Python, API, SQL, Database, Backend",
    workMode: "Hybrid",
    location: "Sydney",
    match: 79
  },
  {
    id: "sample-5",
    name: "Mia Thompson",
    contact: "mia@example.com",
    education: "Bachelor of Software Engineering",
    major: "Frontend Development",
    experience: "Graduate",
    skills: "HTML, CSS, JavaScript, React, UI Design",
    workMode: "Remote",
    location: "Sydney",
    match: 77
  },
  {
    id: "sample-6",
    name: "Liam Brown",
    contact: "liam@example.com",
    education: "Bachelor of IT",
    major: "Cloud Computing",
    experience: "Entry level",
    skills: "Cloud, Support, Networking, Infrastructure",
    workMode: "Remote",
    location: "Wollongong",
    match: 74
  },
  {
    id: "sample-7",
    name: "Ella Johnson",
    contact: "ella@example.com",
    education: "Bachelor of Computer Science",
    major: "Quality Assurance",
    experience: "1 year testing",
    skills: "Testing, Debugging, Automation, Test Cases",
    workMode: "Hybrid",
    location: "Wollongong",
    match: 71
  },
  {
    id: "sample-8",
    name: "Oliver Smith",
    contact: "oliver@example.com",
    education: "Diploma of Software Development",
    major: "Web Development",
    experience: "Entry level",
    skills: "HTML, CSS, JavaScript, Web Developer",
    workMode: "On-site",
    location: "Sydney",
    match: 69
  },
  {
    id: "sample-9",
    name: "Ava Davis",
    contact: "ava@example.com",
    education: "Bachelor of Data Science",
    major: "Business Analytics",
    experience: "1 year analytics",
    skills: "SQL, Python, Reporting, Dashboard",
    workMode: "Hybrid",
    location: "Melbourne",
    match: 66
  },
  {
    id: "sample-10",
    name: "Lucas Martin",
    contact: "lucas@example.com",
    education: "Bachelor of Cyber Security",
    major: "Security",
    experience: "Entry level",
    skills: "Security, Networking, Support, Infrastructure",
    workMode: "On-site",
    location: "Sydney",
    match: 64
  },
  {
    id: "sample-11",
    name: "Grace Lee",
    contact: "grace@example.com",
    education: "Bachelor of IT",
    major: "Systems Analysis",
    experience: "2 years analysis",
    skills: "Business Requirements, SQL, Analysis, Database",
    workMode: "Hybrid",
    location: "Melbourne",
    match: 61
  },
  {
    id: "sample-12",
    name: "Henry Clark",
    contact: "henry@example.com",
    education: "Diploma of IT",
    major: "Technical Support",
    experience: "1 year helpdesk",
    skills: "Support, Hardware, Software, Troubleshooting",
    workMode: "On-site",
    location: "Wollongong",
    match: 58
  }
];

function getAllCandidates() {
  const user = getUser();
  const candidates = [...sampleCandidates];

  if (user && user.name && user.skills) {
    candidates.unshift({
      id: "current-candidate",
      name: user.name,
      contact: user.contact || user.email,
      education: user.education,
      major: user.major,
      experience: user.experience,
      skills: user.skills,
      workMode: user.workMode,
      location: user.location,
      match: 90
    });
  }

  return candidates;
}

function searchCandidates() {
  const keyword = document.getElementById("candidateKeyword").value.toLowerCase().trim();
  const location = document.getElementById("candidateLocation").value;
  const mode = document.getElementById("candidateMode").value;
  const education = document.getElementById("candidateEducation").value.toLowerCase().trim();

  const results = getAllCandidates().filter(candidate => {
    const combinedText = `
      ${candidate.name}
      ${candidate.education}
      ${candidate.major}
      ${candidate.experience}
      ${candidate.skills}
      ${candidate.workMode}
      ${candidate.location}
    `.toLowerCase();

    const keywordMatch = !keyword || combinedText.includes(keyword) || fuzzyMatch(keyword, combinedText);
    const locationMatch = !location || candidate.location === location;
    const modeMatch = !mode || candidate.workMode === mode;
    const educationMatch = !education || combinedText.includes(education);

    return keywordMatch && locationMatch && modeMatch && educationMatch;
  });

  document.getElementById("candidateSearchMessage").textContent =
    results.length > 0 ? `${results.length} matching candidate(s) found.` : "No matching candidates found.";

  displayCandidates(results, "candidateSearchResults");
}

function generateCandidateRecommendations() {
  const profile = getEmployerProfile();
  const employerJobs = getStoredJobs();
  let candidates = getAllCandidates().map(candidate => {
    let score = candidate.match;
    const candidateText = `${candidate.skills} ${candidate.major} ${candidate.education} ${candidate.experience}`.toLowerCase();

    employerJobs.forEach(job => {
      const jobSkills = job.skills.toLowerCase().split(",").map(skill => skill.trim());
      jobSkills.forEach(skill => {
        if (skill && candidateText.includes(skill)) score += 3;
      });
      if (job.location === candidate.location) score += 4;
      if (job.mode === candidate.workMode) score += 4;
    });

    return { ...candidate, finalMatch: Math.min(score, 99) };
  });

  candidates.sort((a, b) => (b.finalMatch || b.match) - (a.finalMatch || a.match));

  if (profile.membership !== "Premium") {
    candidates = candidates.slice(0, 10);
    document.getElementById("candidateRecommendationText").textContent =
      "Employer Free membership active: showing Top 10 recommended candidates only.";
  } else {
    document.getElementById("candidateRecommendationText").textContent =
      "Employer Premium membership active: showing unlimited recommended candidates.";
  }

  displayCandidates(candidates, "candidateRecommendationList");
}

function displayCandidates(candidateArray, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (candidateArray.length === 0) {
    container.innerHTML = "<p class='muted'>No candidates available.</p>";
    return;
  }

  candidateArray.forEach(candidate => {
    const matchScore = candidate.finalMatch || candidate.match;
    container.innerHTML += `
      <div class="job-card">
        <div>
          <h3>${candidate.name}</h3>
          <p>${candidate.education} · ${candidate.major} · ${candidate.location} · ${candidate.workMode}</p>
          <p><strong>Experience:</strong> ${candidate.experience}</p>
          <p><strong>Skills:</strong> ${candidate.skills}</p>
          <p><strong>Contact:</strong> ${candidate.contact}</p>
        </div>
        <span>${matchScore}% Match</span>
      </div>
    `;
  });
}

function updateAdminDashboard() {
  const user = getUser();
  const employer = getEmployerProfile();
  const allJobs = getAllJobs();
  const applications = JSON.parse(localStorage.getItem("applications")) || [];
  const candidateCount = getAllCandidates().length;
  const employerCount = employer.companyName ? 1 : 0;

  document.getElementById("adminCandidateCount").textContent = candidateCount;
  document.getElementById("adminEmployerCount").textContent = employerCount;
  document.getElementById("adminJobCount").textContent = allJobs.length;
  document.getElementById("adminApplicationCount").textContent = applications.length;

  document.getElementById("adminSummaryList").innerHTML = `
    <div class="activity-item"><strong>Logged Candidate:</strong> ${user ? user.name : "No candidate logged"}</div>
    <div class="activity-item"><strong>Candidate Membership:</strong> ${user ? user.membership : "Not available"}</div>
    <div class="activity-item"><strong>Employer:</strong> ${employer.companyName || "No employer profile saved"}</div>
    <div class="activity-item"><strong>Employer Membership:</strong> ${employer.membership || "Free"}</div>
  `;
}

function loadManageUsers() {
  const container = document.getElementById("manageUsersList");
  const user = getUser();
  const employer = getEmployerProfile();
  const candidates = getAllCandidates();
  container.innerHTML = "";

  if (user) {
    container.innerHTML += `
      <div class="job-card">
        <div>
          <h3>Candidate: ${user.name}</h3>
          <p>${user.email} · ${user.membership} Membership</p>
          <p>${user.education || "Education not added"} · ${user.location || "Location not added"}</p>
        </div>
        <span>Active</span>
      </div>
    `;
  }

  if (employer.companyName) {
    container.innerHTML += `
      <div class="job-card">
        <div>
          <h3>Employer: ${employer.companyName}</h3>
          <p>${employer.industry} · ${employer.location} · ${employer.membership} Membership</p>
          <p>${employer.contact}</p>
        </div>
        <button class="secondary" onclick="clearEmployerProfile()">Remove</button>
      </div>
    `;
  }

  container.innerHTML += `
    <div class="activity-item"><strong>Sample candidate profiles available for employer search:</strong> ${candidates.length}</div>
  `;
}

function clearEmployerProfile() {
  localStorage.removeItem("employerProfile");
  loadManageUsers();
  updateAdminDashboard();
}

function loadManageJobs() {
  const container = document.getElementById("manageJobsList");
  const allJobs = getAllJobs();
  container.innerHTML = "";

  allJobs.forEach(job => {
    const canDelete = job.id ? `<button class="secondary" onclick="deletePostedJobFromAdmin('${job.id}')">Delete</button>` : `<span>Default Job</span>`;
    container.innerHTML += `
      <div class="job-card">
        <div>
          <h3>${job.title}</h3>
          <p>${job.company} · ${job.location} · ${job.mode} · ${job.level}</p>
          <p>${job.description}</p>
        </div>
        ${canDelete}
      </div>
    `;
  });
}

function deletePostedJobFromAdmin(jobId) {
  deletePostedJob(jobId);
  loadManageJobs();
  updateAdminDashboard();
}
