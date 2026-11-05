---
name: tailor-resume
description: Tailor the candidate's one-page HTML resume (and optionally a cover letter or application email) to a specific job ad, verify every claim against real project evidence, check layout, and export PDFs ready to send. Use this whenever the user wants to apply for a job, shares a job ad, Platsbanken/LinkedIn link or job ID, asks to "tailor", "adapt", "customize" or "update" a resume/CV/cover letter for a role, or asks to prepare an application package — even if they don't say "tailor".
---

# Tailor resume

Produce an application package for one job ad: a tailored one-page resume, an optional cover
letter or email, exported PDFs, and a short note explaining what changed and why. The aim is a
resume a recruiter scans in seconds and an interviewer can probe line by line without surprises.

## Where things live

- Candidate facts and verified evidence: `private/job-search/candidate-evidence.md`. Read it first,
  every time — it carries caveats (claims to soften, skills not to list) that override the base resumes.
- Base resumes (one per track): `private/resume/{software-engineer,data-engineer,ai-engineer}/*.html`.
  When several versions exist in a track, use the newest by file date unless told otherwise.
- Cover-letter template: `private/cv/cv_template.html` (latest real example: newest file in `private/cv/`).
- Outputs:
  - resume → `private/resume/tailored/<Company>_<Role>.html`
  - letter → `private/cv/<company>_<role>.html`
  - PDFs → `private/job-search/applications/pdf/<First>_<Last>_<Resume|Cover_Letter>_<Company>.pdf`
  - note → `private/job-search/applications/<YYYY-MM-DD>-<company>.md`
- Everything under `private/` is git-ignored. Never copy personal data into tracked files.

## Workflow

1. **Read the ad closely.** Get the full text (Platsbanken ID → `https://jobsearch.api.jobtechdev.se/ad/<id>`;
   otherwise the page or pasted text). List must-haves, nice-to-haves, the words the ad repeats, the
   language requirement, seniority signals, the deadline, and how to apply.
2. **Pick the base track** whose emphasis is closest (software / data / AI).
3. **Choose content from evidence.** Select the internship bullets and projects that best answer the ad.
   Prefer three projects; if one doesn't fit, two strong ones beat three thin ones.
4. **Write the tailored resume** by copying the base file and replacing the body (skills → end). Update the
   header comment and `<title>` to name the target role.
5. **Write the letter or email** if the role asks for one (see `references/cover-letter.md`).
6. **Verify** with `scripts/check_resume.sh` and look at the preview image (see Layout checks).
7. **Write the application note** and report back with links, deadlines, open questions.

## Resume rules (from the candidate's own review — each one has a reason)

- **Reverse-chronological order, always.** Sort projects by end date, newest first ("Present" first), then
  by start date. Show relevance through *which* entries and bullets appear, never by moving an older entry
  up — out-of-order dates look confusing to a recruiter.
- **At least two bullets per project.** A one-bullet project looks like filler; drop it or give it a
  second real bullet.
- **Every claim traces to evidence.** Rephrase freely in the ad's vocabulary, but don't add scope, numbers,
  tools or outcomes that aren't in the evidence file or the repo. If unsure, check the repo or ask. Honest
  wording ("prototyped", "designed") is better than a claim that falls apart in an interview.
- **Skills section: one line per category, and only evidenced skills.** If a category wraps, split it
  (e.g. separate `GCP:` and `AWS:` lines) or cut weaker items. Every listed skill should appear in a
  bullet or a project's tech line, because interviewers ask about anything on the page.
- **Bold the ad's key technologies** inside bullets (one or two per bullet), as the base resumes do.
- **No summary section.**
- **Header name and contact details** come from the base file and the evidence file (display name, not legal name).

## Layout checks

The resume CSS keeps `--page-top` and `--page-bottom` equal (0.5in) and centers content vertically
(`.resume-page { display: flex; flex-direction: column; justify-content: center; }`), so top and bottom
whitespace match automatically. Keep that CSS intact when copying a base file.

Run:

```bash
.claude/skills/tailor-resume/scripts/check_resume.sh <resume.html> <out.pdf> <preview.png>
```

- Top and bottom must be within ~0.03in of each other and each **≥ 0.45in**. `overflow=true` alone is fine
  when both margins clear 0.45in (content just uses part of the padding); below that, the page is too full.
- Fix a too-full page by cutting or shortening the least relevant bullet (aim for one-line bullets), never
  by shrinking fonts or margins.
- Read the preview PNG: no wrapped skill lines, no orphan single words on a bullet's last line if a small
  rewording avoids it, dates aligned.
- Cover letters are top-aligned by convention; only check they fit on one page.

## Application note

Write `private/job-search/applications/<date>-<company>.md` with: ad link, apply link or email, deadline,
files to send, a "what was tailored and why" list (3–5 bullets mapping changes to the ad), honest gaps,
and a checklist (export → send/submit → add to tracker). This note teaches the pattern as much as it
records the work.

## Boundaries

- Never send an email or submit a form without the user's explicit OK for that specific application.
  Drafts are fine (the Outlook connector can create drafts but cannot attach files — tell the user to
  attach the PDF).
- Don't change base resumes unless the user asks; tailored copies are where edits go.
- When the user corrects something, update `candidate-evidence.md` (facts) or this skill (rules) so the
  next application benefits.
