const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'data.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function publicUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

function fuzzyMatch(keyword, text) {
  const typoMap = {
    'sofware enginer': 'software engineer',
    'software enginer': 'software engineer',
    programmer: 'developer',
    coder: 'developer',
    js: 'javascript',
    'web dev': 'web developer'
  };
  return Boolean(typoMap[keyword] && text.includes(typoMap[keyword]));
}

function scoreJobForCandidate(job, candidate) {
  let score = Number(job.match || 60);
  if (candidate.location && job.location?.toLowerCase().includes(candidate.location.toLowerCase().split('/')[0].trim())) score += 5;
  if (candidate.workMode && job.mode === candidate.workMode) score += 5;
  if (candidate.major && job.description?.toLowerCase().includes(candidate.major.toLowerCase())) score += 3;
  if (candidate.skills) {
    candidate.skills.toLowerCase().split(',').map(s => s.trim()).forEach(skill => {
      if (skill && (`${job.skills} ${job.description}`.toLowerCase().includes(skill))) score += 3;
    });
  }
  return Math.min(score, 99);
}

function scoreCandidateForJob(candidate, job) {
  let score = Number(candidate.match || 70);
  if (job.location && candidate.location?.toLowerCase().includes(job.location.toLowerCase())) score += 5;
  if (job.mode && candidate.workMode === job.mode) score += 5;
  if (job.skills && candidate.skills) {
    const required = job.skills.toLowerCase().split(/[ ,]+/).filter(Boolean);
    required.forEach(skill => {
      if (candidate.skills.toLowerCase().includes(skill)) score += 3;
    });
  }
  return Math.min(score, 99);
}

app.post('/api/register', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ error: 'name, email, password and role are required' });

  const data = readData();
  const exists = data.users.find(user => user.email === email && user.role === role);
  if (exists) return res.status(409).json({ error: 'Account already exists for this role' });

  const user = { id: createId('user'), name, email, password, role, membership: 'Free' };
  data.users.push(user);

  if (role === 'candidate') {
    data.candidateProfiles.push({ userId: user.id, name, contact: '', education: '', major: '', experience: '', skills: '', workMode: '', location: '' });
  }
  if (role === 'employer') {
    data.employerProfiles.push({ userId: user.id, companyName: '', industry: '', contact: '', location: '', membership: 'Free' });
  }

  writeData(data);
  res.status(201).json({ user: publicUser(user) });
});

app.post('/api/login', (req, res) => {
  const { email, password, role } = req.body;
  const data = readData();
  const user = data.users.find(item => item.email === email && item.password === password && item.role === role);
  if (!user) return res.status(401).json({ error: 'Invalid email, password or role' });

  res.json({ user: publicUser(user), token: user.id });
});

app.get('/api/users', (req, res) => {
  const data = readData();
  res.json(data.users.map(publicUser));
});

app.get('/api/candidates', (req, res) => {
  const data = readData();
  res.json(data.candidateProfiles);
});

app.put('/api/candidates/:userId', (req, res) => {
  const data = readData();
  let profile = data.candidateProfiles.find(item => item.userId === req.params.userId);
  if (!profile) {
    profile = { userId: req.params.userId };
    data.candidateProfiles.push(profile);
  }
  Object.assign(profile, req.body);
  const user = data.users.find(item => item.id === req.params.userId);
  if (user) user.name = req.body.name || user.name;
  writeData(data);
  res.json(profile);
});

app.get('/api/employers', (req, res) => {
  const data = readData();
  res.json(data.employerProfiles);
});

app.put('/api/employers/:userId', (req, res) => {
  const data = readData();
  let profile = data.employerProfiles.find(item => item.userId === req.params.userId);
  if (!profile) {
    profile = { userId: req.params.userId, membership: 'Free' };
    data.employerProfiles.push(profile);
  }
  Object.assign(profile, req.body);
  writeData(data);
  res.json(profile);
});

app.put('/api/membership/:userId', (req, res) => {
  const { membership } = req.body;
  const data = readData();
  const user = data.users.find(item => item.id === req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.membership = membership === 'Premium' ? 'Premium' : 'Free';
  const employerProfile = data.employerProfiles.find(item => item.userId === user.id);
  if (employerProfile) employerProfile.membership = user.membership;
  writeData(data);
  res.json({ user: publicUser(user) });
});

app.get('/api/jobs', (req, res) => {
  const { keyword = '', location = '', mode = '', level = '' } = req.query;
  const data = readData();
  const lowerKeyword = keyword.toLowerCase().trim();
  const filtered = data.jobs.filter(job => {
    const combinedText = `${job.title} ${job.company} ${job.description} ${job.skills} ${job.location} ${job.mode} ${job.level}`.toLowerCase();
    const keywordMatch = !lowerKeyword || combinedText.includes(lowerKeyword) || fuzzyMatch(lowerKeyword, combinedText);
    const locationMatch = !location || job.location === location;
    const modeMatch = !mode || job.mode === mode;
    const levelMatch = !level || job.level === level;
    return keywordMatch && locationMatch && modeMatch && levelMatch;
  });
  res.json(filtered);
});

app.post('/api/jobs', (req, res) => {
  const { title, company, location, mode, level, description, skills, employerId } = req.body;
  if (!title || !company || !location || !mode || !level || !description || !skills) {
    return res.status(400).json({ error: 'All job fields are required' });
  }
  const data = readData();
  const job = { id: createId('job'), title, company, location, mode, level, description, skills, employerId, match: 75 };
  data.jobs.push(job);
  writeData(data);
  res.status(201).json(job);
});

app.delete('/api/jobs/:jobId', (req, res) => {
  const data = readData();
  data.jobs = data.jobs.filter(job => job.id !== req.params.jobId);
  writeData(data);
  res.json({ success: true });
});

app.get('/api/recommendations/jobs/:candidateId', (req, res) => {
  const data = readData();
  const user = data.users.find(item => item.id === req.params.candidateId);
  const candidate = data.candidateProfiles.find(item => item.userId === req.params.candidateId) || {};
  let recommendations = data.jobs.map(job => ({ ...job, finalMatch: scoreJobForCandidate(job, candidate) }));
  recommendations.sort((a, b) => b.finalMatch - a.finalMatch);
  if (!user || user.membership !== 'Premium') recommendations = recommendations.slice(0, 10);
  res.json(recommendations);
});

app.get('/api/recommendations/candidates/:jobId', (req, res) => {
  const data = readData();
  const job = data.jobs.find(item => item.id === req.params.jobId) || data.jobs[0] || {};
  let recommendations = data.candidateProfiles.map(candidate => ({ ...candidate, finalMatch: scoreCandidateForJob(candidate, job) }));
  recommendations.sort((a, b) => b.finalMatch - a.finalMatch);
  res.json(recommendations.slice(0, 10));
});

app.get('/api/search/candidates', (req, res) => {
  const { keyword = '', location = '', workMode = '' } = req.query;
  const data = readData();
  const lowerKeyword = keyword.toLowerCase().trim();
  const results = data.candidateProfiles.filter(candidate => {
    const combinedText = `${candidate.name} ${candidate.education} ${candidate.major} ${candidate.experience} ${candidate.skills} ${candidate.location} ${candidate.workMode}`.toLowerCase();
    const keywordMatch = !lowerKeyword || combinedText.includes(lowerKeyword) || fuzzyMatch(lowerKeyword, combinedText);
    const locationMatch = !location || candidate.location === location;
    const workModeMatch = !workMode || candidate.workMode === workMode;
    return keywordMatch && locationMatch && workModeMatch;
  });
  res.json(results);
});

app.post('/api/applications', (req, res) => {
  const { candidateId, jobId, jobTitle } = req.body;
  if (!candidateId || !jobTitle) return res.status(400).json({ error: 'candidateId and jobTitle are required' });
  const data = readData();
  const duplicate = data.applications.find(item => item.candidateId === candidateId && item.jobTitle === jobTitle);
  if (duplicate) return res.status(409).json({ error: 'Candidate has already applied for this job' });
  const application = { id: createId('app'), candidateId, jobId: jobId || '', jobTitle, date: new Date().toLocaleDateString(), status: 'Submitted' };
  data.applications.push(application);
  writeData(data);
  res.status(201).json(application);
});

app.get('/api/applications/:candidateId', (req, res) => {
  const data = readData();
  res.json(data.applications.filter(item => item.candidateId === req.params.candidateId));
});

app.get('/api/admin/stats', (req, res) => {
  const data = readData();
  res.json({
    candidates: data.users.filter(user => user.role === 'candidate').length,
    employers: data.users.filter(user => user.role === 'employer').length,
    jobs: data.jobs.length,
    applications: data.applications.length,
    premiumUsers: data.users.filter(user => user.membership === 'Premium').length
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`TalentMatch server running at http://localhost:${PORT}`);
});
