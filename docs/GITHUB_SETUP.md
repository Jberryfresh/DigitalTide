# GitHub Repository Configuration Guide

## Overview

This document provides step-by-step instructions for configuring the DigitalTide GitHub repository with proper settings, branch protection, secrets management, and integrations.

**Repository URL**: https://github.com/Jberryfresh/DigitalTide

---

## Table of Contents

1. [Repository Settings](#repository-settings)
2. [Branch Protection Rules](#branch-protection-rules)
3. [GitHub Secrets Configuration](#github-secrets-configuration)
4. [GitHub Actions Permissions](#github-actions-permissions)
5. [Issue & PR Templates](#issue--pr-templates)
6. [GitHub Projects](#github-projects)
7. [Dependabot Configuration](#dependabot-configuration)
8. [GitHub Pages](#github-pages)
9. [Security Features](#security-features)
10. [GitHub Discussions](#github-discussions)
11. [Verification Checklist](#verification-checklist)

---

## Repository Settings

### General Settings

Navigate to: **Settings > General**

#### Basic Information
- **Repository name**: `DigitalTide`
- **Description**: "AI-powered autonomous news platform with intelligent agent orchestration"
- **Website**: (Add when deployed)
- **Topics**: Add tags for discoverability
  ```
  ai, news, automation, agents, cms, nodejs, postgresql, docker, 
  elasticsearch, machine-learning, content-aggregation, news-api
  ```

#### Features
Enable the following features:
- ✅ **Wikis** - For additional documentation
- ✅ **Issues** - Bug tracking and feature requests
- ✅ **Sponsorships** - (Optional) If seeking funding
- ✅ **Discussions** - Community engagement
- ✅ **Projects** - Project management

#### Pull Requests
Configure PR settings:
- ✅ **Allow merge commits** - Keep full history
- ✅ **Allow squash merging** - Clean linear history
- ✅ **Allow rebase merging** - Alternative merge strategy
- ✅ **Always suggest updating pull request branches**
- ✅ **Allow auto-merge**
- ✅ **Automatically delete head branches** - Keep repo clean

#### Archives
- ❌ **Do not archive** - Active development

---

## Branch Protection Rules

### Main Branch Protection

Navigate to: **Settings > Branches > Add rule**

#### Branch Name Pattern
```
main
```

#### Protect Matching Branches

**Require a pull request before merging**
- ✅ Enabled
- **Required approvals**: `1` (increase to 2 for production)
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require review from Code Owners (if CODEOWNERS file exists)

**Require status checks to pass before merging**
- ✅ Enabled
- ✅ Require branches to be up to date before merging
- **Required status checks**:
  - `Lint & Format Check` (from ci.yml)
  - `Test Suite` (from ci.yml)
  - `Security Audit` (from ci.yml)
  - `Build Check` (from ci.yml)
  - `Validate PR` (from pr-checks.yml)
  - `CodeQL` (from codeql.yml)

**Require conversation resolution before merging**
- ✅ Enabled - All review comments must be resolved

**Require signed commits**
- ⚠️ Optional but recommended for security
- Requires developers to set up GPG keys

**Require linear history**
- ✅ Enabled - Enforce squash or rebase merges

**Require deployments to succeed before merging**
- ❌ Disabled (enable when deployment pipeline is set up)

**Lock branch**
- ❌ Disabled - Allow commits

**Do not allow bypassing the above settings**
- ✅ Enabled - Enforce rules for everyone
- **Exception**: Allow administrators to bypass (for emergency fixes)

**Restrict who can push to matching branches**
- ✅ Enabled
- **Allowed**: Administrators and specific teams only

---

### Phase Branch Protection (phase-*)

Create a second rule for phase branches:

#### Branch Name Pattern
```
phase-*
```

#### Settings (More Lenient)
- ✅ Require pull request reviews: `1` approval
- ✅ Require status checks: All CI checks
- ❌ Require conversation resolution: Optional
- ❌ Require signed commits: Optional
- ❌ Require linear history: Optional
- ❌ Restrict pushes: Allow all team members

---

### Develop Branch Protection

Create a third rule for develop branch:

#### Branch Name Pattern
```
develop
```

#### Settings (Moderate)
- ✅ Require pull request reviews: `1` approval
- ✅ Require status checks: All CI checks
- ✅ Require conversation resolution
- ❌ Require signed commits: Optional
- ✅ Require linear history
- ❌ Restrict pushes: Allow all team members

---

## GitHub Secrets Configuration

Navigate to: **Settings > Secrets and variables > Actions**

> **⚠️ IMPORTANT**: You don't need ALL secrets immediately!  
> See the [When Do You Need These Secrets?](#when-do-you-need-these-secrets) section below.

### Repository Secrets

Click **New repository secret** for each:

#### Database Credentials

**🔍 How to obtain**:
- **Local development**: Already in your `.env` file
  - `POSTGRES_HOST=localhost` or `POSTGRES_HOST=postgres` (Docker)
  - Check your `.env` file - you already have these!
- **Production**: From your cloud database provider
  - Azure: `yourdb.postgres.database.azure.com`
  - AWS RDS: `yourdb.abc123.us-east-1.rds.amazonaws.com`
  - Google Cloud: `yourdb:region:instance-name`

**When needed**: Only for GitHub Actions CI/CD pipeline (can wait)

**⚠️ Important**: Use the EXACT variable names from your `.env` file!

```
POSTGRES_HOST
Value: localhost (for local) or production database host (for deployment)

POSTGRES_PORT
Value: 5432

POSTGRES_DB
Value: digitaltide (local) or digitaltide_production (prod)

POSTGRES_USER
Value: digitaltide (check your .env file)

POSTGRES_PASSWORD
Value: digitaltide_password (check your .env file for local password)
```

#### Redis Configuration

**🔍 How to obtain**:
- **Local development**: Already in your `.env` file
  - `REDIS_HOST=localhost` or `REDIS_HOST=redis` (Docker)
  - Check your `.env` file - you already have these!
- **Production**: From your cloud Redis provider
  - Azure Cache: `yourredis.redis.cache.windows.net`
  - AWS ElastiCache: `yourcluster.abc123.use1.cache.amazonaws.com`

**When needed**: Only for GitHub Actions CI/CD pipeline (can wait)

```
REDIS_HOST
Value: localhost (for local) or production Redis host (for deployment)

REDIS_PORT
Value: 6379

REDIS_PASSWORD
Value: (empty for local, or check your .env file)
```

#### JWT Secrets

**🔍 How to obtain**:
Generate secure random strings using one of these methods:

**Option 1 - PowerShell** (recommended):
```powershell
# Run this script to generate both secrets at once
.\scripts\generate-jwt-secrets.ps1

# Or generate manually:
$bytes = New-Object byte[] 64
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

**Option 2 - Node.js**:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**Option 3 - OpenSSL** (Git Bash):
```bash
openssl rand -base64 64
```

**When needed**: Before testing authentication/login features

**⚠️ Important**: 
- JWT_SECRET and JWT_REFRESH_SECRET must be DIFFERENT
- Use the `generate-jwt-secrets.ps1` script for convenience
- Save these to your `.env` file first, then add to GitHub Secrets later

```
JWT_SECRET
Value: (generate using script above - 64 random bytes in base64)
Example: vH8F2xK9pL3mN7qR5tY1wZ4aB6cD8eG0hJ2kM4nP6qS8uV0xY2zA4bC6dE8fH0jK=

JWT_REFRESH_SECRET
Value: (generate DIFFERENT value using script above)
Example: aB2cD4eF6gH8iJ0kL2mN4oP6qR8sT0uV2wX4yZ6aC8bD0eF2gH4iJ6kL8mN0oP2qR=
```

#### News API Keys

**🔍 How to obtain**:
- See `docs/NEWS_API_SETUP.md` for complete setup instructions
- Create accounts at:
  - SerpAPI: https://serpapi.com/
  - NewsAPI.org: https://newsapi.org/
  - MediaStack: https://mediastack.com/

**When needed**: Before implementing news fetching features (Phase 1.5)

```
GOOGLE_NEWS_API_KEY
Value: (from SerpAPI dashboard - see docs/NEWS_API_SETUP.md)

NEWSAPI_KEY
Value: (from NewsAPI.org account page)

MEDIASTACK_API_KEY
Value: (from MediaStack dashboard)
```

#### AI Service API Keys

**🔍 How to obtain**:
- See `docs/AI_SERVICES_SETUP.md` for complete setup instructions
- Create accounts at:
  - OpenAI: https://platform.openai.com/signup
  - Anthropic: https://console.anthropic.com/

**When needed**: Before implementing AI agent features (Phase 1.5)

```
OPENAI_API_KEY
Value: sk-proj-... (from OpenAI API keys page - see docs/AI_SERVICES_SETUP.md)

ANTHROPIC_API_KEY
Value: sk-ant-api03-... (from Anthropic settings - see docs/AI_SERVICES_SETUP.md)
```

#### Cloud Provider Credentials

**🔍 How to obtain**:
- Will be covered in Phase 1.5 Task 3 - Cloud Provider Setup
- Create AWS/Azure/GCP account
- Set up IAM user with appropriate permissions

**When needed**: Before deploying to production (Phase 2+)

```
AWS_ACCESS_KEY_ID
Value: (AWS IAM access key - Phase 1.5 Task 3)

AWS_SECRET_ACCESS_KEY
Value: (AWS IAM secret key - Phase 1.5 Task 3)

AWS_REGION
Value: us-east-1 (or your preferred region)
```

#### Email Service

**🔍 How to obtain**:
- Create SendGrid account: https://sendgrid.com/
- Generate API key in SendGrid dashboard

**When needed**: Before implementing email notifications (Phase 2+)

```
SENDGRID_API_KEY
Value: (from SendGrid dashboard - will set up in Phase 2)

SMTP_HOST
Value: smtp.sendgrid.net

SMTP_PORT
Value: 587

SMTP_USER
Value: apikey

SMTP_PASSWORD
Value: (SendGrid API key)
```

#### Error Tracking

**🔍 How to obtain**:
- Create Sentry account: https://sentry.io/
- Create new project
- Copy DSN from project settings

**When needed**: Before deploying to production (Phase 2+)

```
SENTRY_DSN
Value: (from Sentry project settings - will set up in Phase 2)
```

#### Other Services

**🔍 How to obtain**:
- Will be set up in later phases
- Elasticsearch: Cloud provider or self-hosted
- Qdrant: https://qdrant.tech/ or self-hosted

**When needed**: Before implementing search features (Phase 2+)

```
ELASTICSEARCH_HOST
Value: (production Elasticsearch URL - Phase 2+)

ELASTICSEARCH_PASSWORD
Value: (Elasticsearch password - Phase 2+)

QDRANT_URL
Value: (Qdrant vector database URL - Phase 2+)

QDRANT_API_KEY
Value: (Qdrant API key - Phase 2+)
```

---

## When Do You Need These Secrets?

Understanding when each secret is required helps you prioritize setup:

### 🟢 Required NOW (Phase 1 - Local Development)
**You already have these in your `.env` file!**
- ✅ `POSTGRES_HOST` → localhost (already configured)
- ✅ `POSTGRES_PORT` → 5432 (already configured)
- ✅ `POSTGRES_DB` → digitaltide (already configured)
- ✅ `POSTGRES_USER` → digitaltide (already configured)
- ✅ `POSTGRES_PASSWORD` → digitaltide_password (already configured)
- ✅ `REDIS_HOST` → localhost (already configured)
- ✅ `REDIS_PORT` → 6379 (already configured)

**Action needed**: None - you're good to go!

### 🟡 Required SOON (Phase 1 - Before Testing Auth)
**Generate these when you're ready to test login features:**
- ⏳ `JWT_SECRET` - Run `.\scripts\generate-jwt-secrets.ps1`
- ⏳ `JWT_REFRESH_SECRET` - Run `.\scripts\generate-jwt-secrets.ps1`

**Action needed**: Run the JWT secret generator script before testing authentication

### 🟠 Required for Phase 1.5 (External Services)
**Create accounts and get API keys when working on:**
- ⏳ **News APIs** (Phase 1.5 Task 1 - in progress):
  - `GOOGLE_NEWS_API_KEY` (SerpAPI)
  - `NEWSAPI_KEY` (NewsAPI.org)
  - `MEDIASTACK_API_KEY` (MediaStack)
  - See: `docs/NEWS_API_SETUP.md`

- ⏳ **AI Services** (Phase 1.5 Task 2 - in progress):
  - `OPENAI_API_KEY` (OpenAI)
  - `ANTHROPIC_API_KEY` (Anthropic)
  - See: `docs/AI_SERVICES_SETUP.md`

- ⏳ **Cloud Provider** (Phase 1.5 Task 3 - upcoming):
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION`

**Action needed**: Create accounts as you reach each task

### 🔴 Required for GitHub Actions CI/CD (When Ready to Deploy)
**Add to GitHub Secrets only when setting up automated deployment:**
- All database credentials
- All Redis credentials
- All JWT secrets
- All API keys
- All cloud provider credentials

**Action needed**: Can wait until Phase 2 deployment

### 🔵 Required for Production (Phase 2+)
**Set up when deploying to production:**
- Production database host (Azure/AWS/GCP)
- Production Redis host (cloud service)
- Email service (SendGrid)
- Error tracking (Sentry)
- Search services (Elasticsearch, Qdrant)

**Action needed**: Will be covered in Phase 2

---

## Quick Start: Minimal Setup

**To start developing RIGHT NOW, you only need:**

1. ✅ **Database credentials** - Already in your `.env` (check with Docker)
2. ⏳ **JWT secrets** - Generate when testing auth:
   ```powershell
   .\scripts\generate-jwt-secrets.ps1
   ```
3. ⏳ **API keys** - Create accounts as needed for each feature

**Everything else can wait!**

---

### Environment Variables

Navigate to: **Settings > Secrets and variables > Actions > Variables**

These are non-sensitive configuration values:

```
NODE_ENV
Value: production

PORT
Value: 3000

LOG_LEVEL
Value: info

RATE_LIMIT_WINDOW_MS
Value: 900000

RATE_LIMIT_MAX_REQUESTS
Value: 100

CORS_ORIGIN
Value: https://digitaltide.com

SESSION_COOKIE_SECURE
Value: true
```

---

## GitHub Actions Permissions

Navigate to: **Settings > Actions > General**

### Actions Permissions
- ✅ **Allow all actions and reusable workflows**
  - Or restrict to: **Allow actions created by GitHub and verified marketplace actions**

### Workflow Permissions
- ⚪ **Read repository contents and packages permissions**
- ✅ **Read and write permissions** (for auto-labeling, issue creation)
- ✅ **Allow GitHub Actions to create and approve pull requests**

### Fork Pull Request Workflows
- ✅ **Require approval for first-time contributors**
- ✅ **Require approval for all outside collaborators**

---

## Issue & PR Templates

### Status: ✅ Already Created

Templates are located in `.github/`:
- ✅ `PULL_REQUEST_TEMPLATE.md`
- ✅ `ISSUE_TEMPLATE/bug_report.md`
- ✅ `ISSUE_TEMPLATE/feature_request.md`

### Verify Templates
Navigate to: **Issues > New Issue** and **Pull Requests > New PR**

You should see:
- 🐛 Bug Report template
- ✨ Feature Request template
- PR template auto-loads when creating PRs

---

## GitHub Projects

### Create Project Board

Navigate to: **Projects > New project**

#### Project: "DigitalTide Development"

**Board Type**: Board (Kanban style)

**Columns**:
1. **📋 Backlog** - Tasks not yet started
2. **📝 To Do** - Ready to work on
3. **🔄 In Progress** - Currently being worked on
4. **👀 In Review** - Pull requests under review
5. **✅ Done** - Completed tasks

**Automation** (Enable these):
- ✅ Auto-add issues and PRs
- ✅ Move to "In Progress" when PR is opened
- ✅ Move to "In Review" when PR is marked for review
- ✅ Move to "Done" when PR is merged or issue is closed

#### Project: "Phase Tracker"

**Board Type**: Table

**Views**:
- **By Phase** - Group by phase (1, 2, 3, 4)
- **By Priority** - Group by priority (P1, P2, P3, P4)
- **By Status** - Group by status (Todo, In Progress, Done)

**Custom Fields**:
- `Phase` (Single select): Phase 1, Phase 2, Phase 3, Phase 4
- `Priority` (Single select): P1-CRITICAL, P2-HIGH, P3-MEDIUM, P4-LOW
- `Estimated Hours` (Number)
- `Actual Hours` (Number)

---

## Dependabot Configuration

### Create Dependabot Config

Create file: `.github/dependabot.yml`

```yaml
version: 2
updates:
  # Enable version updates for npm
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "06:00"
    open-pull-requests-limit: 10
    reviewers:
      - "Jberryfresh"
    assignees:
      - "Jberryfresh"
    commit-message:
      prefix: "[DEPS]"
      include: "scope"
    labels:
      - "dependencies"
      - "automated"
    # Group updates
    groups:
      development-dependencies:
        dependency-type: "development"
        update-types:
          - "minor"
          - "patch"
      production-dependencies:
        dependency-type: "production"
        update-types:
          - "patch"

  # Enable version updates for GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "06:00"
    commit-message:
      prefix: "[CI]"
    labels:
      - "ci/cd"
      - "dependencies"
      - "automated"

  # Enable version updates for Docker
  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "06:00"
    commit-message:
      prefix: "[DOCKER]"
    labels:
      - "docker"
      - "dependencies"
      - "automated"
```

Navigate to: **Settings > Code security and analysis**

Verify:
- ✅ **Dependabot alerts** - Enabled
- ✅ **Dependabot security updates** - Enabled
- ✅ **Dependabot version updates** - Enabled (after creating config file)

---

## GitHub Pages

### Enable GitHub Pages

Navigate to: **Settings > Pages**

#### Source
- **Branch**: `main`
- **Folder**: `/docs`

#### Custom Domain (Optional)
- Add: `docs.digitaltide.com`
- ✅ Enforce HTTPS

#### Build and Deployment
- **Source**: Deploy from a branch
- **Branch**: main / /docs

### Create Documentation Index

Create file: `docs/index.md`

```markdown
# DigitalTide Documentation

Welcome to the DigitalTide documentation site!

## Quick Links

- [Technical Architecture](./TECHNICAL_ARCHITECTURE.md)
- [API Specifications](./API_SPECIFICATIONS.md)
- [Coding Standards](./CODING_STANDARDS.md)
- [UI Wireframes](./UI_WIREFRAMES.md)
- [GitHub Actions](./GITHUB_ACTIONS.md)
- [Legal Compliance](./LEGAL_COMPLIANCE.md)

## Getting Started

1. [Installation Guide](#)
2. [Configuration](#)
3. [Development Workflow](#)
4. [Contributing Guidelines](#)

## Architecture

[Architecture diagrams and system overview](./ARCHITECTURE_DIAGRAMS.md)

## API Documentation

[Complete API reference](./API_SPECIFICATIONS.md)

## Project Status

See our [Project TODO](./../.agents/PROJECT_TODO.md) for current progress.
```

Create file: `docs/_config.yml` (Jekyll configuration)

```yaml
title: DigitalTide Documentation
description: AI-powered autonomous news platform
theme: jekyll-theme-cayman
markdown: kramdown
plugins:
  - jekyll-relative-links
relative_links:
  enabled: true
  collections: true
```

---

## Security Features

Navigate to: **Settings > Code security and analysis**

### Enable All Security Features

#### Dependency Graph
- ✅ **Enabled** - View project dependencies

#### Dependabot Alerts
- ✅ **Enabled** - Get alerts for vulnerable dependencies

#### Dependabot Security Updates
- ✅ **Enabled** - Auto-create PRs to fix vulnerabilities

#### Code Scanning (CodeQL)
- ✅ **Enabled** - Already configured via `.github/workflows/codeql.yml`
- Status: Should show "Active" with weekly scans

#### Secret Scanning
- ✅ **Enabled** - Automatically scans for leaked secrets
- ✅ **Push protection** - Prevents pushes with secrets

#### Security Policy
Create file: `.github/SECURITY.md`

```markdown
# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: security@digitaltide.com

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include:
- Type of issue (e.g., buffer overflow, SQL injection, XSS)
- Full paths of source file(s) related to the issue
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue

## Disclosure Policy

We follow coordinated disclosure:
1. Researcher reports vulnerability privately
2. We confirm and develop a fix
3. We release patched version
4. Public disclosure after 90 days or when patch is available

## Bug Bounty

We currently do not have a bug bounty program, but we greatly appreciate security researchers who report vulnerabilities responsibly.

## Security Best Practices

For developers contributing to DigitalTide:
- Never commit secrets, API keys, or passwords
- Always use environment variables for sensitive data
- Follow OWASP Top 10 guidelines
- Use prepared statements for database queries
- Implement proper input validation
- Keep dependencies up to date
```

---

## GitHub Discussions

Navigate to: **Settings > General > Features**

- ✅ Enable **Discussions**

### Set Up Categories

Navigate to: **Discussions > Categories**

Create categories:

1. **📢 Announcements** (Announcement type)
   - Description: Official updates and releases

2. **💡 Ideas** (Open discussion)
   - Description: Suggest new features or improvements

3. **❓ Q&A** (Q&A type)
   - Description: Ask questions and get help

4. **🐛 Bug Reports** (Open discussion)
   - Description: Report bugs (or use Issues)

5. **🎨 Show and Tell** (Open discussion)
   - Description: Share what you've built with DigitalTide

6. **🤖 AI Agents** (Open discussion)
   - Description: Discuss AI agent development and optimization

7. **🔐 Security** (Open discussion)
   - Description: Security-related discussions (non-sensitive)

---

## Verification Checklist

### ✅ Repository Settings
- [ ] Repository name and description set
- [ ] Topics added for discoverability
- [ ] Wiki, Issues, Discussions enabled
- [ ] Auto-delete head branches enabled

### ✅ Branch Protection
- [ ] Main branch protection configured
  - [ ] Require 1 PR approval
  - [ ] Require CI checks to pass
  - [ ] Require conversation resolution
  - [ ] Require linear history
- [ ] Phase branches protection configured
- [ ] Develop branch protection configured

### ✅ GitHub Secrets
- [ ] Database credentials added (DB_HOST, DB_PASSWORD, etc.)
- [ ] Redis credentials added
- [ ] JWT secrets generated and added
- [ ] News API keys added (will add in Phase 1.5)
- [ ] AI service API keys added (will add in Phase 1.5)
- [ ] Cloud provider credentials added (will add in Phase 1.5)
- [ ] Email service credentials added (future)
- [ ] Error tracking DSN added (future)

### ✅ GitHub Actions
- [ ] Workflow permissions configured
- [ ] Actions permissions set appropriately
- [ ] Fork PR workflows secured

### ✅ Templates
- [ ] PR template verified
- [ ] Bug report template verified
- [ ] Feature request template verified

### ✅ Projects
- [ ] Development Kanban board created
- [ ] Phase Tracker table created
- [ ] Automation rules configured

### ✅ Dependabot
- [ ] dependabot.yml created
- [ ] Dependabot alerts enabled
- [ ] Dependabot security updates enabled

### ✅ GitHub Pages
- [ ] Pages enabled from /docs folder
- [ ] index.md created
- [ ] _config.yml created
- [ ] HTTPS enforced

### ✅ Security Features
- [ ] CodeQL enabled
- [ ] Secret scanning enabled
- [ ] Push protection enabled
- [ ] SECURITY.md created

### ✅ Discussions
- [ ] Discussions enabled
- [ ] Categories created
- [ ] Welcome post created

---

## Testing Configuration

### Test Branch Protection

```bash
# Try to push directly to main (should fail)
git checkout main
git commit --allow-empty -m "Test direct push"
git push origin main
# Expected: Error - branch protection rules

# Create PR instead (correct way)
git checkout -b test/branch-protection
git push origin test/branch-protection
# Create PR via GitHub UI
```

### Test GitHub Secrets

```yaml
# Add to .github/workflows/test-secrets.yml
name: Test Secrets
on: workflow_dispatch
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Test secret access
        run: |
          if [ -z "${{ secrets.DB_PASSWORD }}" ]; then
            echo "❌ Secret not configured"
            exit 1
          fi
          echo "✅ Secret is configured"
```

### Test Dependabot

- Wait for Monday 6 AM or trigger manually
- Check for Dependabot PRs
- Verify labels and commit messages

---

## Maintenance

### Weekly Tasks
- Review Dependabot PRs
- Check security alerts
- Monitor CI/CD failures
- Review discussion activity

### Monthly Tasks
- Review branch protection rules
- Audit secrets and rotate if needed
- Update documentation
- Check storage usage

### Quarterly Tasks
- Review and update security policy
- Audit team access and permissions
- Update templates if needed
- Review project board organization

---

## Troubleshooting

### CI Checks Not Running
1. Check Actions permissions in Settings
2. Verify workflow files are in `.github/workflows/`
3. Check workflow run history for errors

### Secrets Not Accessible
1. Verify secret name matches exactly (case-sensitive)
2. Check if secret is in correct scope (repo vs environment)
3. Verify Actions has permission to access secrets

### Branch Protection Not Working
1. Verify rule is saved and enabled
2. Check if user has bypass permissions
3. Verify status check names match workflow job names

### Dependabot Not Creating PRs
1. Check if dependabot.yml syntax is correct
2. Verify Dependabot is enabled in settings
3. Check if PR limit is reached (default: 5)

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Dependabot Configuration](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file)
- [GitHub Pages](https://docs.github.com/en/pages)

---

**Last Updated**: October 26, 2024  
**Version**: 1.0  
**Maintainer**: DigitalTide DevOps Team
