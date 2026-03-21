const STEPS = [
  { key: 'code_review', label: 'Code Review Approved' },
  { key: 'tests_passing', label: 'All Tests Passing' },
  { key: 'staging_deploy', label: 'Deployed to Staging' },
  { key: 'qa_sign_off', label: 'QA Sign-off' },
  { key: 'changelog_updated', label: 'Changelog Updated' },
  { key: 'db_migrations_ready', label: 'DB Migrations Ready' },
  { key: 'dependencies_audited', label: 'Dependencies Audited' },
  { key: 'production_deploy', label: 'Deployed to Production' },
  { key: 'smoke_tests', label: 'Smoke Tests Passed' },
  { key: 'notify_team', label: 'Team Notified' },
];

function computeStatus(steps) {
  const completed = steps.filter((s) => s.completed).length;
  if (completed === 0) return 'planned';
  if (completed === steps.length) return 'done';
  return 'ongoing';
}

module.exports = { STEPS, computeStatus };
