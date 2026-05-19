import os
import re
import httpx
from groq import Groq
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Regression Suite Generator API", version="1.0.0")

FRONTEND_URL = os.getenv("FRONTEND_URL", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL] if FRONTEND_URL != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class GenerateRequest(BaseModel):
    pr_url: str
    pr_url2: str = ""
    github_token: str = ""
    framework: str = "auto"
    scope: str = "functional"
    coverage: str = "full"

class FileInfo(BaseModel):
    filename: str
    status: str
    additions: int
    deletions: int

class GenerateResponse(BaseModel):
    tests: str
    framework: str
    framework_label: str
    pr_title: str
    files_changed: int
    additions: int
    deletions: int
    files: list[FileInfo]

FRAMEWORK_LABELS = {
    "junit5":  "Java / JUnit 5",
    "testng":  "Java / TestNG",
    "pytest":  "Python / pytest",
    "jest":    "JavaScript / Jest",
    "vitest":  "TypeScript / Vitest",
    "go":      "Go / testing package",
}

SCOPE_MAP = {
    "functional":  "functional regression",
    "unit":        "unit",
    "integration": "integration",
    "e2e":         "end-to-end / API",
}

COVERAGE_MAP = {
    "changed":  "only the changed logic",
    "full":     "changed logic plus meaningful edge cases",
    "edge":     "boundary conditions and edge cases",
    "security": "security vulnerabilities and input validation",
}

def parse_pr_url(url: str) -> tuple[str, str, str]:
    match = re.match(r"https://github\.com/([^/]+)/([^/]+)/pull/(\d+)", url.strip())
    if not match:
        raise ValueError("Invalid GitHub PR URL. Expected: https://github.com/owner/repo/pull/42")
    return match.group(1), match.group(2), match.group(3)

def detect_framework(files: list[dict]) -> str:
    exts = {f["filename"].rsplit(".", 1)[-1].lower() for f in files if "." in f["filename"]}
    if "java" in exts:
        return "junit5"
    if "py" in exts:
        return "pytest"
    if "ts" in exts or "tsx" in exts:
        return "vitest"
    if "go" in exts:
        return "go"
    return "jest"

def strip_markdown_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        inner = lines[1:] if len(lines) > 1 else lines
        if inner and inner[-1].strip() == "```":
            inner = inner[:-1]
        text = "\n".join(inner)
    return text.strip()

def build_prompt(owner, repo, pr_data, files_data, owner2, repo2, pr_data2, files_data2, fw_label, scope, coverage) -> str:
    diff_text1 = "\n\n".join(
        f"--- {f['filename']} ({f['status']}) ---\n{(f.get('patch') or '')[:2000]}"
        for f in files_data
    )[:7000]

    has_second_pr = bool(pr_data2 and files_data2)

    if has_second_pr:
        diff_text2 = "\n\n".join(
            f"--- {f['filename']} ({f['status']}) ---\n{(f.get('patch') or '')[:2000]}"
            for f in files_data2
        )[:7000]

        return f"""You are a senior QA engineer and test automation expert.

You are given two GitHub PR diffs. Generate {SCOPE_MAP.get(scope, scope)} regression tests in {fw_label} that cover both PRs.
Focus on: {COVERAGE_MAP.get(coverage, coverage)}.

Rules:
1. Return ONLY compilable, runnable test code. No explanations, no markdown fences.
2. Include all necessary imports at the top.
3. Use descriptive test names that explain the scenario clearly.
4. Add a short comment above each test explaining which PR it covers and what regression it guards.
5. Use mocking where external dependencies are involved.
6. Cover at least one happy path and one failure path per changed function.
7. If both PRs touch the same file or function, write tests that cover both changes together.
8. Follow {fw_label} best practices.

PR #1 Title: {pr_data.get('title', 'N/A')}
PR #1 Repository: {owner}/{repo}
PR #1 Description: {(pr_data.get('body') or 'No description.')[:400]}

PR #1 Diff:
{diff_text1}

PR #2 Title: {pr_data2.get('title', 'N/A')}
PR #2 Repository: {owner2}/{repo2}
PR #2 Description: {(pr_data2.get('body') or 'No description.')[:400]}

PR #2 Diff:
{diff_text2}
"""

    return f"""You are a senior QA engineer and test automation expert.

Analyze the GitHub PR diff below and generate {SCOPE_MAP.get(scope, scope)} tests in {fw_label}.
Focus on: {COVERAGE_MAP.get(coverage, coverage)}.

Rules:
1. Return ONLY compilable, runnable test code. No explanations, no markdown fences.
2. Include all necessary imports at the top.
3. Use descriptive test names that explain the scenario clearly.
4. Add a short comment above each test explaining what regression it covers.
5. Use mocking where external dependencies are involved.
6. Cover at least one happy path and one failure path per changed function.
7. Follow {fw_label} best practices.

PR Title: {pr_data.get('title', 'N/A')}
Repository: {owner}/{repo}
Description: {(pr_data.get('body') or 'No description.')[:600]}

Diff:
{diff_text1}
"""

async def fetch_pr(client, owner, repo, pr_number, headers):
    pr_resp = await client.get(
        f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}",
        headers=headers,
    )
    if pr_resp.status_code != 200:
        detail = pr_resp.json().get("message", f"GitHub API returned {pr_resp.status_code}")
        raise HTTPException(status_code=pr_resp.status_code, detail=detail)

    files_resp = await client.get(
        f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}/files",
        headers=headers,
    )
    if files_resp.status_code != 200:
        detail = files_resp.json().get("message", f"GitHub API returned {files_resp.status_code}")
        raise HTTPException(status_code=files_resp.status_code, detail=detail)

    return pr_resp.json(), files_resp.json()


@app.get("/api/health")
def health():
    return {"status": "ok", "model": "llama-3.1-8b-instant"}


@app.post("/api/generate-tests", response_model=GenerateResponse)
async def generate_tests(req: GenerateRequest):
    try:
        owner, repo, pr_number = parse_pr_url(req.pr_url)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"PR #1: {str(exc)}")

    gh_headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    token = req.github_token or os.getenv("GITHUB_TOKEN", "")
    if token:
        gh_headers["Authorization"] = f"Bearer {token}"

    async with httpx.AsyncClient(timeout=20) as client:
        pr_data, files_data = await fetch_pr(client, owner, repo, pr_number, gh_headers)

    pr_data2 = {}
    files_data2 = []
    owner2, repo2 = owner, repo

    if req.pr_url2:
        try:
            owner2, repo2, pr_number2 = parse_pr_url(req.pr_url2)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=f"PR #2: {str(exc)}")

        async with httpx.AsyncClient(timeout=20) as client:
            pr_data2, files_data2 = await fetch_pr(client, owner2, repo2, pr_number2, gh_headers)

    fw = req.framework if req.framework != "auto" else detect_framework(files_data + files_data2)
    fw_label = FRAMEWORK_LABELS.get(fw, fw)

    prompt = build_prompt(
        owner, repo, pr_data, files_data,
        owner2, repo2, pr_data2, files_data2,
        fw_label, req.scope, req.coverage
    )

    try:
        chat = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2048,
        )
        test_code = strip_markdown_fences(chat.choices[0].message.content)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Groq API error: {str(exc)}")

    all_files = files_data + files_data2
    pr_title = pr_data.get("title", "")
    if pr_data2:
        pr_title = f"{pr_title}  +  {pr_data2.get('title', '')}"

    return GenerateResponse(
        tests=test_code,
        framework=fw,
        framework_label=fw_label,
        pr_title=pr_title,
        files_changed=len(all_files),
        additions=sum(f.get("additions", 0) for f in all_files),
        deletions=sum(f.get("deletions", 0) for f in all_files),
        files=[
            FileInfo(
                filename=f["filename"],
                status=f["status"],
                additions=f.get("additions", 0),
                deletions=f.get("deletions", 0),
            )
            for f in all_files[:12]
        ],
    )
