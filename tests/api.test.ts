import { db } from '../server/db.js';
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  getSessionExpirationDate,
  isValidEmail,
  isValidPassword,
  sanitizeString,
  toClientUser,
} from '../server/auth.js';
import { computeNextRecommendedAction } from '../server/ai.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAILED: ${testName}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('\n--- NORTHSTAR AI COMPREHENSIVE SECURITY & AUDIT SUITE ---\n');

  // 1. Password Hashing & Constant-Time Verification
  console.log('1. Password Hashing & Cryptographic Verification:');
  const password = 'SuperSecretPassword2026!';
  const { hash: hash1, salt: salt1 } = hashPassword(password);
  const { hash: hash2, salt: salt2 } = hashPassword(password);

  assert(Boolean(hash1 && salt1), 'Password successfully hashed with salt');
  assert(salt1 !== salt2, 'Salts are cryptographically unique per hash invocation');
  assert(hash1 !== hash2, 'Hashes differ due to unique salting');
  assert(verifyPassword(password, hash1, salt1) === true, 'Valid password successfully verified');
  assert(verifyPassword('WrongPassword123!', hash1, salt1) === false, 'Invalid password strictly rejected');
  assert(verifyPassword(password, hash1, salt2) === false, 'Hash with mismatched salt rejected');

  // 2. Input Validation & String Sanitization
  console.log('\n2. Input Validation & Sanitization Boundaries:');
  assert(isValidEmail('valid.user@northstar.ai') === true, 'Valid email recognized');
  assert(isValidEmail('invalid-email-address') === false, 'Malformed email rejected');
  assert(isValidEmail('') === false, 'Empty email rejected');
  assert(isValidPassword('short').valid === false, 'Password under 8 characters rejected');
  assert(isValidPassword('validLengthPassword123!').valid === true, 'Strong password accepted');
  assert(
    sanitizeString('   <script>alert("xss")</script> Clean Content   ', 20) === '<script>alert("xss")',
    'Sanitizer trims and enforces length boundary'
  );

  // 3. User Authentication & Session Management
  console.log('\n3. User Creation, Roles & Secure Sessions:');
  const userA = db.createUser({
    email: 'operator_alpha@test.com',
    name: 'Operator Alpha',
    passwordHash: hash1,
    passwordSalt: salt1,
  });

  const userB = db.createUser({
    email: 'operator_beta@test.com',
    name: 'Operator Beta',
    passwordHash: hash2,
    passwordSalt: salt2,
  });

  assert(Boolean(userA.id && userB.id), 'Users provisioned with distinct IDs');
  assert(userA.id !== userB.id, 'Users have distinct unique identifiers');
  assert(userA.role === 'user', 'Public registration defaults to standard user role');

  const clientUser = toClientUser(userA);
  assert(!('passwordHash' in clientUser), 'Client-facing user object never contains passwordHash');
  assert(!('passwordSalt' in clientUser), 'Client-facing user object never contains passwordSalt');

  const sessionToken = generateSessionToken();
  const futureExpiration = getSessionExpirationDate();
  const session = db.createSession(userA.id, sessionToken, futureExpiration);

  assert(sessionToken.length === 64, 'Session token is 256-bit cryptographically secure hex');
  assert(db.getSessionByToken(sessionToken)?.userId === userA.id, 'Session retrieved by valid token');

  // Expired session handling
  const expiredToken = generateSessionToken();
  const pastDate = new Date(Date.now() - 3600000).toISOString();
  db.createSession(userA.id, expiredToken, pastDate);
  assert(db.getSessionByToken(expiredToken) === undefined, 'Expired session is automatically rejected and deleted');

  // Session revocation
  db.deleteSession(sessionToken);
  assert(db.getSessionByToken(sessionToken) === undefined, 'Session successfully invalidated upon logout');

  // 4. Goal Isolation & Ownership Verification
  console.log('\n4. Multi-Tenant Goal Isolation & Ownership Enforcement:');
  const goalA = db.createGoal({
    userId: userA.id,
    title: 'Run a sub-4 hour marathon',
    whyItMatters: 'Endurance and physical discipline',
    measurableCriteria: 'Official race time < 3:59:59',
    currentBaseline: 'Can run 10k in 55 mins',
    targetDeadline: '2026-11-30',
    weeklyCommitmentHours: 10,
    resourcesBudget: 'Running shoes, GPS watch',
    knownObstacles: 'Shin splints',
    constraints: 'Must sleep 8 hours',
    coachingStyle: 'direct',
    status: 'active',
    immediateNextAction: 'Buy proper running shoes',
  });

  assert(db.isGoalOwnedByUser(goalA.id, userA.id) === true, 'User A confirmed as owner of Goal A');
  assert(db.isGoalOwnedByUser(goalA.id, userB.id) === false, 'User B denied ownership check on Goal A');

  const goalsForB = db.getGoals(userB.id);
  assert(!goalsForB.some((g) => g.id === goalA.id), 'Cross-Tenant: User B cannot query User A goal');

  const goalsForA = db.getGoals(userA.id);
  assert(goalsForA.some((g) => g.id === goalA.id), 'Authorized: User A queries their own goal');

  // 5. Milestone Isolation & Recalculation
  console.log('\n5. Milestone Engine & Data Isolation:');
  const ms1 = db.createMilestone({
    userId: userA.id,
    goalId: goalA.id,
    title: 'Base aerobic building (20km/week)',
    description: 'Establish consistent running habit',
    targetDate: '2026-09-30',
    completed: false,
    order: 1,
    successMetric: '3 consecutive weeks of 20km logged',
  });

  assert(Boolean(ms1), 'Milestone 1 created successfully');
  if (ms1) {
    const milestonesForA = db.getMilestones(goalA.id, userA.id);
    const milestonesForB = db.getMilestones(goalA.id, userB.id);
    assert(milestonesForA.length === 1, 'User A accesses their goal milestones');
    assert(milestonesForB.length === 0, 'User B receives empty list when querying User A goal milestones');
  }

  // 6. Task Management, Subtasks & Recalculation
  console.log('\n6. Task Isolation & Progress Calculation:');
  const task1 = db.createTask({
    userId: userA.id,
    goalId: goalA.id,
    milestoneId: ms1?.id,
    title: 'Complete 5km morning zone-2 run',
    priority: 'high',
    estimatedMinutes: 35,
    actualMinutesSpent: 0,
    status: 'todo',
    dueDate: '2026-09-15',
    order: 1,
    subtasks: [
      { id: 'st-1', title: 'Dynamic stretch', completed: false },
      { id: 'st-2', title: '5km steady pace', completed: false },
    ],
  });

  assert(Boolean(task1), 'Task 1 created successfully');
  if (task1) {
    assert(task1.status === 'todo', 'Initial task state is todo');

    // Cross-tenant task update prevention
    const unauthorizedUpdate = db.updateTask(task1.id, userB.id, { status: 'completed' });
    assert(unauthorizedUpdate === null, 'User B forbidden from updating User A task');

    // Authorized task completion
    const authorizedUpdate = db.updateTask(task1.id, userA.id, {
      status: 'completed',
      actualMinutesSpent: 35,
    });
    assert(authorizedUpdate?.status === 'completed', 'User A successfully completes task');

    const updatedGoal = db.getGoalById(goalA.id, userA.id);
    assert(
      (updatedGoal?.progressPercent ?? 0) > 0,
      `Goal progress recalculated on task completion (${updatedGoal?.progressPercent}%)`
    );
  }

  // 7. "What Should I Do Right Now?" Algorithm
  console.log('\n7. Immediate Leverage Next-Action Algorithm:');
  const rec = computeNextRecommendedAction({
    goalTitle: goalA.title,
    tasks: [
      {
        id: 't-urgent',
        title: 'Sign up for race lottery before deadline',
        priority: 'urgent',
        estimatedMinutes: 10,
        status: 'todo',
        dueDate: '2026-09-01',
      },
      {
        id: 't-low',
        title: 'Browse running playlist options',
        priority: 'low',
        estimatedMinutes: 20,
        status: 'todo',
        dueDate: '2026-09-30',
      },
    ],
  });

  assert(rec.recommendedTaskId === 't-urgent', 'Highest leverage urgent task prioritized');
  assert(rec.urgencyLevel === 'high', 'Urgency level accurately detected as high');

  // 8. Coach Messages, Reviews, and Resources Isolation
  console.log('\n8. Coach Messages, Retrospectives, and Resources Isolation:');
  db.addCoachMessage({
    userId: userA.id,
    goalId: goalA.id,
    sender: 'user',
    text: 'Feeling sore after running.',
    coachingStyle: 'direct',
  });

  assert(db.getCoachMessages(goalA.id, userA.id).length === 1, 'User A accesses own coach messages');
  assert(db.getCoachMessages(goalA.id, userB.id).length === 0, 'User B blocked from User A coach conversation');

  const reviewA = db.createReview({
    userId: userA.id,
    goalId: goalA.id,
    weekEndingDate: '2026-09-14',
    accomplishedText: 'Ran 3 times',
    struggledText: 'Shin splints',
    learnedText: 'Pace slower',
    wastedTimeText: 'Phone browsing',
    needsToChangeText: 'Earlier bedtime',
    prioritiesNextWeek: ['Foam roll', 'Tempo run', 'Rest day'],
    tasksCompletedCount: 3,
    tasksMissedCount: 1,
    aiFeedbackSummary: 'Strong consistency despite friction.',
    proposedNextWeekTasks: [],
  });

  assert(db.getReviews(goalA.id, userA.id).length === 1, 'User A accesses own weekly reviews');
  assert(db.getReviews(goalA.id, userB.id).length === 0, 'User B blocked from User A weekly reviews');

  const resItemA = db.createResource({
    userId: userA.id,
    goalId: goalA.id,
    title: 'Marathon pacing handbook',
    type: 'article',
    url: 'https://example.com/pacing',
    notes: 'Zone 2 heart rate is key',
    keyTakeaways: ['Slow down on hills'],
    aiActionSteps: ['Monitor HR monitor strap'],
  });

  assert(db.getResources(goalA.id, userA.id).length === 1, 'User A accesses own research items');
  assert(db.getResources(goalA.id, userB.id).length === 0, 'User B blocked from User A research vault');

  // Plan versions isolation
  const planVerA = db.addPlanVersion(
    {
      goalId: goalA.id,
      reason: 'Recalibrated weekly cadence',
      summary: 'Added 2 recovery days',
      changes: ['Adjusted target dates'],
    },
    userA.id
  );
  assert(Boolean(planVerA), 'User A adds plan version');
  assert(db.getPlanVersions(goalA.id, userA.id).length === 1, 'User A queries own plan versions');
  assert(db.getPlanVersions(goalA.id, userB.id).length === 0, 'User B blocked from User A plan versions');

  // 9. Cascade Deletion & Right to Erasure
  console.log('\n9. Account Deletion & Right-To-Erasure Cascade Compliance:');
  db.deleteUser(userA.id);
  assert(!db.getUserById(userA.id), 'User record permanently erased');
  assert(db.getGoals(userA.id).length === 0, 'User goals completely deleted');
  assert(db.getAllUserTasks(userA.id).length === 0, 'User tasks completely deleted');
  assert(db.getReviews(goalA.id, userA.id).length === 0, 'User reviews completely deleted');
  assert(db.getResources(goalA.id, userA.id).length === 0, 'User resources completely deleted');
  assert(db.getCoachMessages(goalA.id, userA.id).length === 0, 'User coach messages completely deleted');
  assert(db.getPlanVersions(goalA.id, userA.id).length === 0, 'User plan versions completely deleted');

  // Cleanup test user B
  db.deleteUser(userB.id);

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passedTests} passed, ${failedTests} failed.`);
  console.log(`========================================\n`);

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
