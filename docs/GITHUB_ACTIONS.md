# GitHub Actions CI/CD Documentation

## Overview

DigitalTide uses GitHub Actions for automated continuous integration and continuous deployment. This document describes all workflows, their purposes, and how to work with them.

## 📋 Table of Contents

1. [Workflow Overview](#workflow-overview)
2. [Continuous Integration](#continuous-integration)
3. [Pull Request Checks](#pull-request-checks)
4. [Security Scanning](#security-scanning)
5. [Database Migrations](#database-migrations)
6. [Release Management](#release-management)
7. [Scheduled Maintenance](#scheduled-maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Workflow Overview

### Active Workflows

| Workflow | Trigger | Purpose | Status Required |
|----------|---------|---------|-----------------|
| **CI** | Push, PR | Lint, test, build validation | ✅ Required |
| **PR Checks** | PR open/update | PR validation, sizing, labeling | ✅ Required |
| **CodeQL** | Push, PR, Schedule | Security code analysis | ⚠️ Recommended |
| **Dependency Review** | PR | Dependency vulnerability check | ✅ Required |
| **Migrations** | Push/PR to migrations/ | Database migration validation | ✅ Required |
| **Release** | Tag push | Create releases and artifacts | N/A |
| **Scheduled Maintenance** | Weekly | Dependency updates, cleanup | N/A |
| **Agent Rules Check** | PR | Validate AGENTS.md presence | ✅ Required |

---

## Continuous Integration

**File**: `.github/workflows/ci.yml`

### Jobs

#### 1. Lint & Format Check
- Runs ESLint on all source files
- Validates Prettier formatting
- Checks for console.log statements
- **Fail Condition**: Any lint errors or console.logs found

#### 2. Test Suite
- Spins up PostgreSQL and Redis services
- Runs database migrations
- Executes Jest test suite with coverage
- **Coverage Threshold**: 80% overall
- **Artifacts**: Coverage reports (30-day retention)

#### 3. Security Audit
- Runs `npm audit` for high/critical vulnerabilities
- Performs basic secret detection
- **Fail Condition**: High/critical vulnerabilities found

#### 4. Build Check
- Validates the build process
- Verifies Node.js/npm versions
- **Fail Condition**: Build fails

#### 5. Docker Build Test
- Validates docker-compose.yml configuration
- Tests Docker image build (if Dockerfile exists)
- **Fail Condition**: Configuration invalid

### Triggers
```yaml
on:
  push:
    branches: [main, phase-*, develop]
  pull_request:
    branches: [main, phase-*, develop]
```

### Example Output
```bash
✅ All CI checks passed successfully!
✓ Linting passed
✓ Tests passed (Coverage: 85%)
✓ Security audit passed
✓ Build succeeded
✓ Docker validation passed
```

---

## Pull Request Checks

**File**: `.github/workflows/pr-checks.yml`

### Validations

#### PR Title Format
Must follow convention:
```
[PHASE-X] Type: Description - Priority

Examples:
✅ [PHASE-1] feat: Add user authentication - P1
✅ [PHASE-2] fix: Resolve API timeout issue - P2
✅ [PHASE-3] docs: Update API documentation - P3
❌ Add authentication feature
❌ Fix bug in API
```

**Valid Types**: feat, fix, docs, style, refactor, test, chore, perf, ci, build

**Valid Priorities**: P1, P2, P3, P4, CRITICAL, HIGH, MEDIUM, LOW

#### Branch Naming
Recommended format:
```
phase-N-description
feature/description
fix/description
hotfix/description
docs/description
refactor/description

Examples:
✅ phase-1-foundation
✅ feature/user-authentication
✅ fix/security-vulnerability
✅ docs/api-documentation
```

#### Code Quality Checks
- ⚠️ Warns about TODO/FIXME comments
- ⚠️ Warns about large files (>500KB)
- ❌ Fails on merge conflict markers
- ⚠️ Warns about package-lock changes without package.json

#### PR Size Analysis
```
Small PR:     < 500 lines changed  ✓ Easy to review
Medium PR:    500-1000 lines       ℹ️ Moderate size
Large PR:     > 1000 lines         ⚠️ Consider splitting
```

### Auto-Labeling
PRs are automatically labeled based on:
- Changed file paths
- Branch name patterns
- Content type (docs, tests, etc.)

---

## Security Scanning

### CodeQL Analysis

**File**: `.github/workflows/codeql.yml`

- **Triggers**: Push, PR, Weekly schedule (Monday 6 AM UTC)
- **Language**: JavaScript
- **Queries**: Security-extended + Quality
- **Results**: GitHub Security tab

#### Detected Issues
- SQL injection vulnerabilities
- Cross-site scripting (XSS)
- Command injection
- Path traversal
- Insecure cryptography
- Authentication bypasses
- Hardcoded credentials

### Dependency Review

**File**: `.github/workflows/dependency-review.yml`

- Runs on every PR
- Checks for vulnerable dependencies
- Validates package-lock.json integrity
- Reports outdated packages
- **Fail Severity**: High or above

---

## Database Migrations

**File**: `.github/workflows/migrations.yml`

### Validations

#### 1. File Naming Convention
```
Format: YYYYMMDDHHMMSS_description.js

✅ 20241026120000_create_users_table.js
✅ 20241026123000_add_email_to_users.js
❌ create_users_table.js
❌ migration_001.js
```

#### 2. No Duplicate Timestamps
Ensures unique timestamps for migration ordering.

#### 3. Forward & Rollback Testing
- Runs migrations forward on test database
- Tests rollback functionality
- Re-runs migrations to ensure repeatability

#### 4. Schema Verification
- Lists all tables and indexes
- Verifies schema structure
- Checks for breaking changes

#### 5. Documentation Check
Warns if migrations lack JSDoc comments:
```javascript
/**
 * Migration: Create users table
 * Description: Initial users table with authentication fields
 * Author: Team DigitalTide
 * Date: 2024-10-26
 */
export const up = async (db) => {
  // Migration code
};
```

### Breaking Change Detection
Alerts on potentially breaking schema changes:
- `DROP COLUMN`
- `DROP TABLE`
- `ALTER COLUMN` (type changes)

---

## Release Management

**File**: `.github/workflows/release.yml`

### Triggers
1. **Tag Push**: `v*.*.*` (e.g., v1.0.0)
2. **Manual Dispatch**: Workflow dispatch with version input

### Process
1. ✅ Run full test suite
2. 🔨 Build release artifacts
3. 📝 Generate changelog from git history
4. 🚀 Create GitHub release
5. 📦 Create tarball with source code
6. ⬆️ Upload artifacts (90-day retention)

### Creating a Release
```bash
# Tag the release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Or trigger manually from GitHub Actions UI
```

### Release Artifacts
```
digitaltide-v1.0.0.tar.gz
├── src/
├── database/
├── scripts/
├── docs/
├── package*.json
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Scheduled Maintenance

**File**: `.github/workflows/scheduled-maintenance.yml`

### Schedule
**Weekly**: Every Sunday at 2:00 AM UTC

### Tasks

#### 1. Dependency Updates
- Checks for outdated packages
- Identifies available updates
- **Output**: JSON report of outdated dependencies

#### 2. Security Vulnerabilities
- Runs `npm audit`
- Counts critical/high vulnerabilities
- **Action**: Creates GitHub issue if vulnerabilities found

#### 3. Artifact Cleanup
- Removes artifacts older than 30 days
- Frees up storage space
- **Target**: Workflow artifacts only

#### 4. Repository Health Check
- Counts open issues and PRs
- Lists total branches (warns if >20)
- Shows last commit date
- Counts contributors

### Example Issue Created
```markdown
## 🔒 Security Vulnerabilities Detected

**Critical:** 2
**High:** 5
**Moderate:** 3
**Low:** 1

### Action Required

Please run:
```bash
npm audit
npm audit fix
```

Review and address all critical and high vulnerabilities.
```

---

## Configuration Files

### Labeler Configuration

**File**: `.github/labeler.yml`

Auto-applies labels based on changed files:
- `documentation` - docs/, *.md files
- `database` - database/, models/
- `api` - routes/, controllers/
- `agents` - src/agents/, .agents/
- `security` - auth, security middleware
- `tests` - test files
- `ci/cd` - .github/, docker files
- `dependencies` - package.json changes
- `phase-X` - Based on branch name

### PR Template

**File**: `.github/PULL_REQUEST_TEMPLATE.md`

Comprehensive checklist including:
- Description and related issues
- Type of change
- Phase and priority
- Code quality checklist
- Testing requirements
- Database changes
- Security considerations
- Documentation updates
- Deployment notes

### Issue Templates

**Files**:
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`

---

## Best Practices

### ✅ Do's

1. **Always run tests locally before pushing**
   ```bash
   npm run lint
   npm test
   ```

2. **Keep PRs small and focused**
   - Target: < 500 lines changed
   - One feature/fix per PR

3. **Follow PR title convention**
   - `[PHASE-X] type: description - priority`

4. **Write meaningful commit messages**
   ```bash
   [PHASE-1] feat: Add user authentication endpoint - P1
   
   - Implement JWT token generation
   - Add password hashing with bcrypt
   - Create login/logout routes
   ```

5. **Check CI status before requesting review**
   - All checks should be green ✅

6. **Add tests for new features**
   - Maintain 80%+ coverage

7. **Document breaking changes**
   - In PR description
   - In migration comments

### ❌ Don'ts

1. **Don't commit console.log statements**
   - CI will fail
   - Use logger instead

2. **Don't hardcode secrets**
   - Security scan will catch it
   - Use environment variables

3. **Don't skip the PR template**
   - Fill out all relevant sections

4. **Don't merge with failing checks**
   - Fix issues first
   - Get approvals

5. **Don't create large PRs**
   - Split into smaller chunks
   - Easier to review

6. **Don't modify package-lock without package.json**
   - CI will warn about this

7. **Don't ignore security vulnerabilities**
   - Address high/critical immediately

---

## Troubleshooting

### CI Failures

#### Lint Errors
```bash
# Fix automatically
npm run lint:fix

# Check manually
npm run lint
```

#### Test Failures
```bash
# Run tests locally
npm test

# Run with coverage
npm run test -- --coverage

# Run specific test
npm test -- path/to/test.spec.js
```

#### Build Errors
```bash
# Clean and rebuild
rm -rf node_modules
npm ci
npm run build
```

#### Docker Issues
```bash
# Validate docker-compose
docker-compose config

# Check syntax
yamllint docker-compose.yml
```

### PR Check Failures

#### Invalid PR Title
```bash
# Bad
Add authentication

# Good
[PHASE-1] feat: Add JWT authentication - P1
```

#### Merge Conflicts
```bash
# Update your branch
git fetch origin
git merge origin/main

# Or rebase
git rebase origin/main
```

### Security Scan Issues

#### Vulnerable Dependencies
```bash
# Check vulnerabilities
npm audit

# Auto-fix
npm audit fix

# Force fix (breaking changes possible)
npm audit fix --force
```

#### Hardcoded Secrets
```bash
# Search for potential secrets
git grep -i "password\|secret\|api_key" src/

# Use environment variables
const apiKey = process.env.API_KEY;
```

### Migration Issues

#### Invalid Naming
```bash
# Bad
create_users.js

# Good
20241026120000_create_users_table.js
```

#### Rollback Fails
- Ensure `down` function reverses `up` changes
- Test locally first:
```bash
npm run db:migrate
npm run db:rollback
npm run db:migrate
```

---

## Workflow Artifacts

### Coverage Reports
- **Retention**: 30 days
- **Location**: Actions > CI > Artifacts
- **Format**: HTML, JSON, LCOV

### Release Artifacts
- **Retention**: 90 days
- **Location**: Releases page
- **Format**: .tar.gz

---

## Monitoring & Notifications

### GitHub Checks
View status at: `Pull Request > Checks tab`

### Security Alerts
View at: `Security tab > Code scanning alerts`

### Workflow Runs
View at: `Actions tab > All workflows`

---

## Updating Workflows

### Testing Workflow Changes

1. Create a feature branch:
   ```bash
   git checkout -b ci/update-workflows
   ```

2. Modify workflow files

3. Push and create PR

4. Workflows will run on the PR itself

5. Verify all checks pass

### Workflow Syntax

Validate YAML syntax:
```bash
# Using yamllint
yamllint .github/workflows/*.yml

# Using actionlint
actionlint .github/workflows/*.yml
```

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [GitHub Security Features](https://docs.github.com/en/code-security)
- [DigitalTide Coding Standards](./CODING_STANDARDS.md)
- [Project TODO](../.agents/PROJECT_TODO.md)

---

## Support

For questions or issues with CI/CD:
1. Check this documentation
2. Review workflow run logs
3. Open an issue with `ci/cd` label
4. Tag the DevOps team

---

**Last Updated**: October 26, 2024  
**Version**: 1.0  
**Maintainer**: DigitalTide DevOps Team
