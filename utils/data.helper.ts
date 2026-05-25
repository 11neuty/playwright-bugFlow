export function generateProjectName() {
  return `AUTO-PROJECT-${Date.now()}`;
}

export function generateUserName() {
  return `AUTO-USER-${Date.now()}`;
}

export function generateUserEmail() {
  return `auto-${Date.now()}@mail.com`;
}

export function generateIssueTitle() {
  return `AUTO-ISSUE-${Date.now()}`;
}

export function generateCommentText() {
  return `AUTO-COMMENT-${Date.now()}`;
}

export function generateLongText(length: number) {
  return 'X'.repeat(length);
}