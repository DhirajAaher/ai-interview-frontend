import { useState } from "react";
import "./App.css";
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

function App() {
  // =========================
  // AUTH STATE
  // =========================
// =========================
// DASHBOARD STATE
// =========================
// =========================
// RESUME MANAGEMENT STATE
// =========================

const [resumes, setResumes] = useState([]);
const [resumeLoading, setResumeLoading] = useState(false);
const [resumeMessage, setResumeMessage] = useState("");
const [resumeError, setResumeError] = useState("");
const [jobFitHistory, setJobFitHistory] = useState([]);
const [selectedJobFit, setSelectedJobFit] = useState(null);
const [jobFitHistoryLoading, setJobFitHistoryLoading] = useState(false);
const [jobFitResumeId, setJobFitResumeId] = useState("");
const [jobDescription, setJobDescription] = useState("");
const [jobFitResult, setJobFitResult] = useState(null);
const [jobFitLoading, setJobFitLoading] = useState(false);
const [jobFitError, setJobFitError] = useState("");
const [dashboard, setDashboard] = useState(null);
const [dashboardLoading, setDashboardLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const [user, setUser] = useState(null);

  const [authData, setAuthData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const loadResumes = async () => {
  if (!user?.userId) return;

  setResumeLoading(true);
  setResumeError("");

  try {
    const response = await fetch(
      `${API_BASE_URL}/resumes`
    );

    if (!response.ok) {
      throw new Error("Failed to load resumes.");
    }

    const data = await response.json();

    const userResumes = data.filter(
      (resume) =>
        resume.user?.userId === user.userId
    );

    setResumes(userResumes);

  } catch (error) {
    console.error(
      "Resume loading error:",
      error
    );

    setResumeError(
      error.message ||
        "Unable to load resumes."
    );
  } finally {
    setResumeLoading(false);
  }
};
 const uploadResume = async (file) => {
  if (!file) return;

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    setResumeError(
      "Only PDF resumes are allowed."
    );
    return;
  }

  if (!user?.userId) {
    setResumeError(
      "User session not found."
    );
    return;
  }

  setResumeLoading(true);
  setResumeMessage("");
  setResumeError("");

  try {
    const formData = new FormData();

    formData.append("file", file);
    formData.append(
      "userId",
      user.userId
    );

    const response = await fetch(
      `${API_BASE_URL}/resumes/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof data === "string"
          ? data
          : "Resume upload failed."
      );
    }

    setResumeMessage(
      "Resume uploaded successfully."
    );

    await loadResumes();

  } catch (error) {
    console.error(
      "Resume upload error:",
      error
    );

    setResumeError(
      error.message ||
        "Resume upload failed."
    );
  } finally {
    setResumeLoading(false);
  }
};

const renderResumeManagement = () => {
  return (
    <main className="resume-page">

      <div className="resume-header">
        <div>
          <div className="badge">
            📄 RESUME MANAGEMENT
          </div>

          <h1>Manage Your Resumes</h1>

          <p>
            Upload and manage your resumes for
            AI-powered job analysis.
          </p>
        </div>
      </div>

      {/* UPLOAD CARD */}

      <div className="resume-upload-card">

        <h2>Upload Resume</h2>

        <p>
          Upload your latest resume in PDF format.
        </p>

        <label
          className="resume-upload-button"
          htmlFor="resume-upload"
        >
          {resumeLoading
            ? "Uploading..."
            : "Choose PDF Resume"}
        </label>

        <input
          id="resume-upload"
          type="file"
          accept=".pdf,application/pdf"
          style={{ display: "none" }}
          disabled={resumeLoading}
          onChange={(e) => {
            const file =
              e.target.files?.[0];

            if (file) {
              uploadResume(file);
            }

            e.target.value = "";
          }}
        />

        {resumeMessage && (
          <div className="resume-success">
            {resumeMessage}
          </div>
        )}

        {resumeError && (
          <div className="resume-error">
            {resumeError}
          </div>
        )}

      </div>

      {/* RESUME LIST */}

      <div className="resume-list-section">

        <div className="resume-list-header">
          <h2>Your Resumes</h2>

          <span>
            {resumes.length} resume
            {resumes.length !== 1
              ? "s"
              : ""}
          </span>
        </div>

        {resumeLoading &&
        resumes.length === 0 ? (
          <div className="resume-empty-card">
            Loading resumes...
          </div>
        ) : resumes.length === 0 ? (
          <div className="resume-empty-card">

            <div className="resume-empty-icon">
              📄
            </div>

            <h3>
              No resumes uploaded yet
            </h3>

            <p>
              Upload your first PDF resume
              to use it with Job Fit Analyzer.
            </p>

          </div>
        ) : (
          <div className="resume-grid">

            {resumes.map((resume) => (
              <div
                className="resume-card"
                key={resume.resumeId}
              >

                <div className="resume-card-icon">
                  📄
                </div>

                <div className="resume-card-content">

                  <h3>
                    {resume.resumeName}
                  </h3>

                  <p>
                    PDF Resume
                  </p>

                </div>

                <button
                  className="resume-use-button"
                  onClick={() => {
                    setJobFitResumeId(
                      String(
                        resume.resumeId
                      )
                    );

                    setActivePage(
                      "job-fit"
                    );
                  }}
                >
                  Use for Job Fit
                </button>

              </div>
            ))}

          </div>
        )}

      </div>

    </main>
  );
};


// =========================
// JOB FIT ANALYSIS
// =========================

const analyzeJobFit = async () => {
  if (!jobFitResumeId) {
    setJobFitError("Please select a resume.");
    return;
  }

  if (!jobDescription.trim()) {
    setJobFitError("Please enter a job description.");
    return;
  }

  setJobFitLoading(true);
  setJobFitError("");
  setJobFitResult(null);

  try {
    const response = await fetch(
      `${API_BASE_URL}/job-fit/analyze`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeId: Number(jobFitResumeId),
          jobDescription: jobDescription,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data || "Job fit analysis failed."
      );
    }

    setJobFitResult(data);

  } catch (error) {
    setJobFitError(
      error.message ||
        "Something went wrong while analyzing the job."
    );
  } finally {
    setJobFitLoading(false);
  }
};


// =========================
// LOAD JOB FIT HISTORY
// =========================

const loadJobFitHistory = async () => {
  if (!user?.userId) return;

  setJobFitHistoryLoading(true);

  try {
    const response = await fetch(
      `${API_BASE_URL}/job-fit/history/${user.userId}`
    );

    if (!response.ok) {
      throw new Error(
        "Failed to load Job Fit history."
      );
    }

    const data = await response.json();

    setJobFitHistory(data);

  } catch (error) {
    console.error(
      "Job Fit history error:",
      error
    );
  } finally {
    setJobFitHistoryLoading(false);
  }
};


// =========================
// PARSE JOB FIT RESULT
// =========================

const parseJobFitResult = (result) => {
  if (!result) return {};

  const lines = result.split("\n");
  const data = {};

  lines.forEach((line) => {
    const index = line.indexOf(":");

    if (index === -1) return;

    const key = line
      .substring(0, index)
      .trim();

    const value = line
      .substring(index + 1)
      .trim();

    data[key] = value;
  });

  return data;
};


// =========================
// JOB FIT HISTORY SCREEN
// =========================
const renderJobFitHistory = () => {
  return (
    <div className="job-fit-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="job-fit-header">
        <div>
          <div className="job-fit-eyebrow">
            ✨ AI CAREER INSIGHTS
          </div>

          <h1>
            Job Fit <span>History</span>
          </h1>

          <p>
            Review your previous AI-powered job fit analyses
            and track how well your profile matches different roles.
          </p>
        </div>
      </div>


      {/* =========================
          LOADING
      ========================= */}

      {jobFitHistoryLoading ? (

        <div className="job-fit-empty-card">
          <div className="job-fit-loading-icon">
            ✨
          </div>

          <h2>Loading your analyses</h2>

          <p>
            Please wait while we retrieve your Job Fit history...
          </p>
        </div>

      ) : jobFitHistory.length === 0 ? (

        /* =========================
           EMPTY STATE
        ========================= */

        <div className="job-fit-empty-card">

          <div className="job-fit-empty-icon">
            📊
          </div>

          <h2>No analyses yet</h2>

          <p>
            Your completed Job Fit analyses will appear here.
          </p>

          <button
            className="job-fit-primary-btn"
            onClick={() => setActivePage("job-fit")}
          >
            Start Job Fit Analysis →
          </button>

        </div>

      ) : (

        /* =========================
           HISTORY CARDS
        ========================= */

        <div className="job-fit-history-grid">

          {jobFitHistory.map((analysis) => {

            const score = analysis.matchScore ?? 0;

            return (
              <div
                className="job-fit-history-card"
                key={analysis.analysisId}
              >

                {/* Card top */}

                <div className="job-fit-card-header">

                  <div className="job-fit-card-icon">
                    🤖
                  </div>

                  <div className="job-fit-card-date">
                    {analysis.createdAt
                      ? new Date(
                          analysis.createdAt
                        ).toLocaleString()
                      : "Date unavailable"}
                  </div>

                </div>


                {/* Job title */}

                <h3 className="job-fit-history-title">

                  {analysis.jobDescription
                    ? analysis.jobDescription.substring(0, 90)
                    : "Job Fit Analysis"}

                  {analysis.jobDescription &&
                  analysis.jobDescription.length > 90
                    ? "..."
                    : ""}

                </h3>


                {/* Resume */}

                <div className="job-fit-resume-badge">
                  📄

                  <span>
                    {analysis.resume?.resumeName ||
                      "Resume"}
                  </span>
                </div>


                {/* Score */}

                <div className="job-fit-match-section">

                  <div className="job-fit-mini-ring">

                    <div
                      className="job-fit-mini-ring-fill"
                      style={{
                        "--score":
                          `${score * 3.6}deg`,
                      }}
                    />

                    <div className="job-fit-mini-ring-inner">
                      <strong>{score}%</strong>
                    </div>

                  </div>


                  <div className="job-fit-match-text">

                    <span>
                      AI Match Score
                    </span>

                    <strong>
                      {score}% Match
                    </strong>

                    <small>
                      Resume vs Job Requirements
                    </small>

                  </div>

                </div>


                {/* Button */}

                <button
                  className="job-fit-history-btn"
                  onClick={() =>
                    setSelectedJobFit(analysis)
                  }
                >
                  View Full Analysis
                  <span>→</span>
                </button>

              </div>
            );
          })}

        </div>
      )}


      {/* =========================
          SELECTED ANALYSIS
      ========================= */}

      {selectedJobFit && (

        <div className="job-fit-selected-analysis">

          {/* Header */}

          <div className="selected-analysis-header">

            <div>

              <div className="job-fit-eyebrow">
                🤖 AI ANALYSIS
              </div>

              <h2>
                Saved Job Fit Analysis
              </h2>

              <div className="selected-resume">
                📄{" "}
                {selectedJobFit.resume?.resumeName ||
                  "Resume"}
              </div>

            </div>


            <button
              className="close-analysis-btn"
              onClick={() => setSelectedJobFit(null)}
            >
              ✕
            </button>

          </div>


          {/* Score */}

          <div className="job-fit-score-hero">

            <div
              className="job-fit-score-circle"
              style={{
                "--score":
                  `${selectedJobFit.matchScore || 0}%`,
              }}
            >
              <div className="score-circle-content">

                <strong>
                  {selectedJobFit.matchScore || 0}%
                </strong>

                <span>
                  Match
                </span>

              </div>
            </div>


            <div className="score-hero-content">

              <span className="score-label">
                AI PROFILE MATCH
              </span>

              <h3>
                Resume compatibility analysis
              </h3>

              <p>
                AI analyzed your resume against the
                requirements of this job description.
              </p>

            </div>

          </div>


          {/* Analysis cards */}

          <div className="job-fit-analysis-grid">

            <div className="job-fit-analysis-card matching-card">

              <div className="analysis-card-icon">
                ✓
              </div>

              <div>
                <span className="analysis-card-label">
                  MATCHING SKILLS
                </span>

                <h3>
                  Skills You Have
                </h3>
              </div>

              <p>
                {selectedJobFit.matchingSkills ||
                  "Not available"}
              </p>

            </div>


            <div className="job-fit-analysis-card missing-card">

              <div className="analysis-card-icon">
                !
              </div>

              <div>
                <span className="analysis-card-label">
                  SKILL GAPS
                </span>

                <h3>
                  Skills to Develop
                </h3>
              </div>

              <p>
                {selectedJobFit.missingSkills ||
                  "Not available"}
              </p>

            </div>


            <div className="job-fit-analysis-card experience-card">

              <div className="analysis-card-icon">
                💼
              </div>

              <div>
                <span className="analysis-card-label">
                  EXPERIENCE
                </span>

                <h3>
                  Relevant Experience
                </h3>
              </div>

              <p>
                {selectedJobFit.relevantExperience ||
                  "Not available"}
              </p>

            </div>


            <div className="job-fit-analysis-card education-card">

              <div className="analysis-card-icon">
                🎓
              </div>

              <div>
                <span className="analysis-card-label">
                  EDUCATION
                </span>

                <h3>
                  Education Match
                </h3>
              </div>

              <p>
                {selectedJobFit.educationMatch ||
                  "Not available"}
              </p>

            </div>

          </div>


          {/* Recommendations */}

          <div className="job-fit-recommendations">

            <div className="recommendation-icon">
              💡
            </div>

            <div>

              <span className="analysis-card-label">
                AI RECOMMENDATIONS
              </span>

              <h3>
                How to improve your match
              </h3>

              <p>
                {selectedJobFit.recommendations ||
                  "Not available"}
              </p>

            </div>

          </div>


          {/* AI Summary */}

          <div className="job-fit-summary">

            <div className="summary-icon">
              ✨
            </div>

            <div>

              <span className="analysis-card-label">
                AI SUMMARY
              </span>

              <h3>
                Overall Analysis
              </h3>

              <p>
                {selectedJobFit.summary ||
                  "Not available"}
              </p>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};
  // =========================
  // UI STATE
  // =========================

  const [showForm, setShowForm] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  // =========================
  // HISTORY STATE
  // =========================

  const [activePage, setActivePage] = useState("dashboard");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);

  // =========================
  // INTERVIEW STATE
  // =========================

  const [interviewId, setInterviewId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);

  // AI evaluation for current question
  const [evaluation, setEvaluation] = useState(null);

  // =========================
  // INTERVIEW FORM STATE
  // =========================

  const [formData, setFormData] = useState({
    jobRole: "",
    experienceLevel: "Fresher",
    jobDescription: "",
    numberOfQuestions: 10,
  });

  // =========================
  // COMMON STATE
  // =========================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // AUTH INPUT CHANGE
  // =========================

  const handleAuthChange = (e) => {
    const { name, value } = e.target;

    setAuthData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };  



  // =========================
// DASHBOARD SCREEN
// =========================

const renderJobFit = () => {
  const parsedResult = parseJobFitResult(jobFitResult);
  const matchingSkills = parsedResult.MATCHING_SKILLS
  ? parsedResult.MATCHING_SKILLS
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean)
  : [];

const missingSkills = parsedResult.MISSING_SKILLS
  ? parsedResult.MISSING_SKILLS
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean)
  : [];
  return (
    <div className="job-fit-page">

      <div className="job-fit-header">
        <div>
          <h1>AI Job Fit Analyzer</h1>
          <p>
            Compare your resume with a job description using AI.
          </p>
        </div>
      </div>

      <div className="job-fit-card">

        <div className="job-fit-field">
          <label>Select Resume</label>

          <select
            value={jobFitResumeId}
            onChange={(e) => setJobFitResumeId(e.target.value)}
          >
            <option value="">Select your resume</option>

            {resumes.map((resume) => (
              <option
                key={resume.resumeId}
                value={resume.resumeId}
              >
                {resume.resumeName}
              </option>
            ))}
          </select>
        </div>

        <div className="job-fit-field">
          <label>Job Description</label>

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the complete job description here..."
          />
        </div>

        {jobFitError && (
          <div className="job-fit-error">
            {jobFitError}
          </div>
        )}

        <button
          className="job-fit-analyze-btn"
          onClick={analyzeJobFit}
          disabled={jobFitLoading}
        >
          {jobFitLoading
            ? "Analyzing with AI..."
            : "Analyze Job Fit"}
        </button>
<button
  onClick={() => {
    setActivePage("job-fit");
    setJobFitResult(null);
    setJobFitError("");
  }}
>
  Job Fit Analyzer
</button>
      </div>

{jobFitResult && (
  <div className="job-fit-result">

    <div className="job-fit-score-section">
    <div
  className="job-fit-score-circle"
  style={{
    "--score": `${Number(parsedResult.MATCH_SCORE) || 0}%`,
  }}
>
  <span>
    {parsedResult.MATCH_SCORE || 0}%
  </span>
</div>

      <div>
        <h2>Job Fit Analysis</h2>
        <p>AI-powered comparison of your resume and the job description.</p>
      </div>
    </div>

    <div className="job-fit-analysis-grid">

      <div className="job-fit-analysis-card">
        <h3>✅ Matching Skills</h3>
        <div className="job-fit-skill-list">
  {matchingSkills.length > 0 ? (
    matchingSkills.map((skill, index) => (
      <span
        className="job-fit-skill-chip matching"
        key={index}
      >
        {skill}
      </span>
    ))
  ) : (
    <span className="job-fit-empty">
      No matching skills identified
    </span>
  )}
</div>
      </div>

      <div className="job-fit-analysis-card">
        <h3>⚠️ Missing Skills</h3>
       <div className="job-fit-skill-list">
  {missingSkills.length > 0 ? (
    missingSkills.map((skill, index) => (
      <span
        className="job-fit-skill-chip missing"
        key={index}
      >
        {skill}
      </span>
    ))
  ) : (
    <span className="job-fit-empty">
      No major missing skills identified
    </span>
  )}
</div>
      </div>

      <div className="job-fit-analysis-card">
        <h3>💼 Relevant Experience</h3>
        <p>
          {parsedResult.RELEVANT_EXPERIENCE || "Not available"}
        </p>
      </div>

      <div className="job-fit-analysis-card">
        <h3>🎓 Education Match</h3>
        <p>
          {parsedResult.EDUCATION_MATCH || "Not available"}
        </p>
      </div>

    </div>

    <div className="job-fit-recommendations">
      <h3>💡 Recommendations</h3>
      <p>
        {parsedResult.RECOMMENDATIONS || "Not available"}
      </p>
    </div>

    <div className="job-fit-summary">
      <h3>🤖 AI Summary</h3>
      <p>
        {parsedResult.SUMMARY || "Not available"}
      </p>
    </div>

  </div>
)}

    </div>
  );
};
const renderDashboard = () => {
  if (dashboardLoading) {
    return (
      <main className="form-page">
        <div className="form-header">
          <div className="badge">
            📊 PERFORMANCE DASHBOARD
          </div>

          <h1>
            Your <span>Performance</span>
          </h1>

          <p>
            Loading your interview performance...
          </p>
        </div>

        <div className="form-card">
          <div
            style={{
              textAlign: "center",
              padding: "50px 20px",
            }}
          >
            <h2>Loading Dashboard...</h2>

            <p>
              Please wait while we calculate your performance.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!dashboard) {
    return (
      <main className="form-page">
        <div className="form-header">
          <div className="badge">
            📊 PERFORMANCE DASHBOARD
          </div>

          <h1>
            Your <span>Performance</span>
          </h1>

          <p>
            Track your interview practice and AI evaluation
            performance.
          </p>
        </div>

        <div className="form-card">
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
            }}
          >
            <h2>No Dashboard Data Yet</h2>

            <p>
              Start an interview to begin tracking your
              performance.
            </p>

            <button
              className="primary-btn"
              onClick={() => {
                setShowForm(true);
                setActivePage("dashboard");
                setError("");
              }}
              style={{ marginTop: "20px" }}
            >
              Start Interview →
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="form-page">

      {/* HEADER */}
      <div className="form-header">

        <div className="badge">
          📊 PERFORMANCE DASHBOARD
        </div>

        <h1>
          Your <span>Performance</span>
        </h1>

        <p>
          Track your interview practice, answers and
          AI-evaluated performance.
        </p>

      </div>


      {/* DASHBOARD CARDS */}
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >

        {/* TOTAL INTERVIEWS */}
        <div
          style={{
            padding: "25px",
            borderRadius: "18px",
            border:
              "1px solid rgba(255,255,255,0.10)",
            background:
              "rgba(255,255,255,0.04)",
          }}
        >
          <div
            style={{
              fontSize: "30px",
              marginBottom: "12px",
            }}
          >
            🎤
          </div>

          <small>Total Interviews</small>

          <h2
            style={{
              fontSize: "36px",
              marginTop: "8px",
            }}
          >
            {dashboard.totalInterviews}
          </h2>

          <p>
            Interviews practiced
          </p>
        </div>


        {/* COMPLETED INTERVIEWS */}
        <div
          style={{
            padding: "25px",
            borderRadius: "18px",
            border:
              "1px solid rgba(255,255,255,0.10)",
            background:
              "rgba(255,255,255,0.04)",
          }}
        >
          <div
            style={{
              fontSize: "30px",
              marginBottom: "12px",
            }}
          >
            ✅
          </div>

          <small>Completed Interviews</small>

          <h2
            style={{
              fontSize: "36px",
              marginTop: "8px",
            }}
          >
            {dashboard.completedInterviews}
          </h2>

          <p>
            Successfully completed
          </p>
        </div>


        {/* TOTAL QUESTIONS */}
        <div
          style={{
            padding: "25px",
            borderRadius: "18px",
            border:
              "1px solid rgba(255,255,255,0.10)",
            background:
              "rgba(255,255,255,0.04)",
          }}
        >
          <div
            style={{
              fontSize: "30px",
              marginBottom: "12px",
            }}
          >
            📝
          </div>

          <small>Total Questions</small>

          <h2
            style={{
              fontSize: "36px",
              marginTop: "8px",
            }}
          >
            {dashboard.totalQuestions}
          </h2>

          <p>
            AI-generated questions
          </p>
        </div>


        {/* ANSWERED QUESTIONS */}
        <div
          style={{
            padding: "25px",
            borderRadius: "18px",
            border:
              "1px solid rgba(255,255,255,0.10)",
            background:
              "rgba(255,255,255,0.04)",
          }}
        >
          <div
            style={{
              fontSize: "30px",
              marginBottom: "12px",
            }}
          >
            💬
          </div>

          <small>Answered Questions</small>

          <h2
            style={{
              fontSize: "36px",
              marginTop: "8px",
            }}
          >
            {dashboard.answeredQuestions}
          </h2>

          <p>
            Questions answered
          </p>
        </div>

      </div>


      {/* AVERAGE SCORE */}
      <div
        className="form-card"
        style={{
          maxWidth: "1100px",
          width: "100%",
          marginBottom: "30px",
          textAlign: "center",
        }}
      >

        <div className="badge">
          ⭐ OVERALL PERFORMANCE
        </div>

        <h2
          style={{
            marginTop: "15px",
          }}
        >
          Average AI Score
        </h2>

        <div
          style={{
            fontSize: "64px",
            fontWeight: "800",
            marginTop: "10px",
          }}
        >
          {Number(
            dashboard.averageScore || 0
          ).toFixed(1)}
          <span
            style={{
              fontSize: "28px",
              marginLeft: "5px",
            }}
          >
            /10
          </span>
        </div>

        <p>
          Based on your evaluated interview answers.
        </p>

      </div>


      {/* QUICK ACTIONS */}
      <div
        className="form-card"
        style={{
          maxWidth: "1100px",
          width: "100%",
        }}
      >

        <h2>
          Continue Practicing
        </h2>

        <p>
          Keep practicing interviews and improve your
          technical performance with AI feedback.
        </p>

        <div
          className="form-actions"
          style={{
            marginTop: "25px",
          }}
        >

          <button
            className="primary-btn"
            onClick={() => {
              setShowForm(true);
              setActivePage("dashboard");
              setError("");
            }}
          >
            + New Interview
          </button>

          <button
            className="back-btn"
            onClick={loadHistory}
          >
            View History →
          </button>

        </div>

      </div>

    </main>
  );
};






  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!authData.email.trim() || !authData.password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: authData.email,
          password: authData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      console.log("Login successful:", data);

      setUser(data);
      setIsAuthenticated(true);
      setActivePage("dashboard");

      setAuthData({
        name: "",
        email: "",
        password: "",
      });

      setError("");
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.message || "Unable to login. Please check the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // REGISTER
  // =========================

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");

    if (
      !authData.name.trim() ||
      !authData.email.trim() ||
      !authData.password.trim()
    ) {
      setError("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: authData.name,
          email: authData.email,
          password: authData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      console.log("Registration successful:", data);

      setUser(data);
      setIsAuthenticated(true);
      setActivePage("dashboard");

      setAuthData({
        name: "",
        email: "",
        password: "",
      });

      setError("");
    } catch (err) {
      console.error("Registration error:", err);

      setError(
        err.message || "Unable to register. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);

    setShowForm(false);
    setInterviewStarted(false);
    setInterviewCompleted(false);

    setInterviewId(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswer("");
    setAnswers([]);
    setEvaluation(null);

    setHistory([]);
    setSelectedHistory(null);
    setActivePage("dashboard");

    setError("");
  };

  // =========================
  // INTERVIEW FORM CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]:
        name === "numberOfQuestions" ? Number(value) : value,
    }));
  };

  // =========================
  // START INTERVIEW
  // =========================

  const startInterview = async () => {
    setError("");

    if (!formData.jobRole.trim()) {
      setError("Please enter a job role.");
      return;
    }

    if (!formData.jobDescription.trim()) {
      setError("Please enter a job description.");
      return;
    }

    if (!user || !user.userId) {
      setError("User session not found. Please login again.");
      return;
    }

    try {
      setLoading(true);

      // Create interview
      const interviewResponse = await fetch(
        `${API_BASE_URL}/interviews/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.userId,
            jobRole: formData.jobRole,
            experienceLevel: formData.experienceLevel,
            jobDescription: formData.jobDescription,
            numberOfQuestions: formData.numberOfQuestions,
          }),
        }
      );

      if (!interviewResponse.ok) {
        throw new Error("Failed to create interview.");
      }

      const interview = await interviewResponse.json();

      console.log("Interview created:", interview);

      setInterviewId(interview.interviewId);

      // Fetch questions
      const questionResponse = await fetch(
        `${API_BASE_URL}/questions/interview/${interview.interviewId}`
      );

      if (!questionResponse.ok) {
        throw new Error("Failed to fetch interview questions.");
      }

      const generatedQuestions = await questionResponse.json();

      console.log("Generated questions:", generatedQuestions);

      if (
        !generatedQuestions ||
        generatedQuestions.length === 0
      ) {
        throw new Error("No questions were generated.");
      }

      // Initialize interview
      setQuestions(generatedQuestions);
      setCurrentQuestion(0);
      setAnswer("");
      setAnswers([]);
      setEvaluation(null);

      setShowForm(false);
      setInterviewStarted(true);
      setInterviewCompleted(false);
      setActivePage("dashboard");
    } catch (err) {
      console.error("Start interview error:", err);

      setError(
        err.message ||
          "Unable to start interview. Make sure Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SUBMIT ANSWER
  // =========================

  const submitAnswer = async () => {
    setError("");

    if (!answer.trim()) {
      setError("Please enter your answer before submitting.");
      return;
    }

    const question = questions[currentQuestion];

    if (!question) {
      setError("Question not found.");
      return;
    }

    try {
      setLoading(true);

      // Send answer to backend for AI evaluation
      const response = await fetch(
        `${API_BASE_URL}/answers/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            questionId: question.questionId,
            answerText: answer,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to submit and evaluate answer.";

        try {
          const errorData = await response.json();

          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(errorMessage);
      }

      const evaluatedAnswer = await response.json();

      console.log("AI Evaluation:", evaluatedAnswer);

      // Save evaluation for display
     setEvaluation({
  answerId: evaluatedAnswer.answerId,
  score: evaluatedAnswer.score,
  feedback: evaluatedAnswer.feedback,
  improvedAnswer: evaluatedAnswer.improvedAnswer,
  correctAnswer: evaluatedAnswer.correctAnswer,
  explanation: evaluatedAnswer.explanation,
  keyPoints: evaluatedAnswer.keyPoints,
  interviewTip: evaluatedAnswer.interviewTip,
});
      // Store complete answer locally
   const newAnswer = {
  answerId: evaluatedAnswer.answerId,
  questionId: question.questionId,
  questionText: question.questionText,
  answerText: answer,
  score: evaluatedAnswer.score,
  feedback: evaluatedAnswer.feedback,
  improvedAnswer: evaluatedAnswer.improvedAnswer,
  correctAnswer: evaluatedAnswer.correctAnswer,
  explanation: evaluatedAnswer.explanation,
  keyPoints: evaluatedAnswer.keyPoints,
  interviewTip: evaluatedAnswer.interviewTip,
};

      setAnswers((previousAnswers) => [
        ...previousAnswers,
        newAnswer,
      ]);
    } catch (err) {
      console.error("Submit answer error:", err);

      setError(
        err.message ||
          "Unable to submit answer. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // NEXT QUESTION
  // =========================
const nextQuestion = async () => {
  setError("");

  // Move to next question
  if (currentQuestion < questions.length - 1) {
    setCurrentQuestion(
      (previousQuestion) => previousQuestion + 1
    );

    setAnswer("");
    setEvaluation(null);
    setError("");

    return;
  }

  // Final question → complete interview in backend
  try {
    setLoading(true);

    if (!interviewId) {
      throw new Error("Interview ID not found.");
    }

    const response = await fetch(
      `${API_BASE_URL}/interviews/${interviewId}/complete`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      let errorMessage = "Failed to complete interview.";

      try {
        const errorData = await response.json();

        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // Ignore JSON parsing error
      }

      throw new Error(errorMessage);
    }

    const completedInterview = await response.json();

    console.log(
      "Interview completed:",
      completedInterview
    );

    // Show completion screen
    setInterviewCompleted(true);
    setInterviewStarted(false);
    setAnswer("");
    setEvaluation(null);
    setError("");

  } catch (err) {
    console.error(
      "Complete interview error:",
      err
    );

    setError(
      err.message ||
        "Unable to complete interview."
    );
  } finally {
    setLoading(false);
  }
};
  // =========================
  // PREVIOUS QUESTION
  // =========================

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(
        (previous) => previous - 1
      );

      setAnswer("");
      setEvaluation(null);
      setError("");
    }
  };

  // =========================
  // RESTART INTERVIEW
  // =========================

  const restartInterview = () => {
    setInterviewId(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswer("");
    setAnswers([]);
    setEvaluation(null);

    setInterviewStarted(false);
    setInterviewCompleted(false);

    setShowForm(true);
    setActivePage("dashboard");
    setSelectedHistory(null);
    setError("");
  };

  // =========================
  // CALCULATE TOTAL SCORE
  // =========================

  const calculateTotalScore = () => {
    if (answers.length === 0) {
      return 0;
    }

    const total = answers.reduce(
      (sum, item) => sum + (Number(item.score) || 0),
      0
    );

    return (total / answers.length).toFixed(1);
  };

  // =========================================================
  // HISTORY FUNCTIONALITY
  // =========================================================

  // =========================
  // LOAD HISTORY
  // =========================

  const loadHistory = async () => {
    if (!user || !user.userId) {
      setError("User session not found. Please login again.");
      return;
    }

    try {
      setHistoryLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/interviews/user/${user.userId}`
      );

      if (!response.ok) {
        throw new Error("Failed to load interview history.");
      }

      const data = await response.json();

      console.log("Interview history:", data);

      setHistory(data);
      setSelectedHistory(null);

      setInterviewStarted(false);
      setInterviewCompleted(false);
      setShowForm(false);

      setActivePage("history");
    } catch (err) {
      console.error("History error:", err);

      setError(
        err.message || "Unable to load interview history."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  // =========================
  // VIEW HISTORY RESULT
  // =========================

  const viewHistoryResult = async (interview) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/interviews/${interview.interviewId}/result`
      );

      if (!response.ok) {
        throw new Error("Failed to load interview result.");
      }

      const result = await response.json();

      console.log("Interview result:", result);

      setSelectedHistory({
        interview,
        result,
      });

      setActivePage("history-result");
    } catch (err) {
      console.error("History result error:", err);

      setError(
        err.message || "Unable to load interview result."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // HISTORY SCREEN
  // =========================

  const renderHistory = () => {
    return (
      <main className="form-page">
        <div className="form-header">
          <div className="badge">
            📋 INTERVIEW HISTORY
          </div>

          <h1>
            Your Interview
            <span> History</span>
          </h1>

          <p>
            Review your previous AI mock interviews,
            scores, answers and feedback.
          </p>
        </div>

        <div
          className="form-card"
          style={{
            maxWidth: "1100px",
            width: "100%",
          }}
        >
          {historyLoading ? (
            <div
              style={{
                textAlign: "center",
                padding: "50px 20px",
              }}
            >
              <h2>Loading History...</h2>

              <p>
                Please wait while we fetch your
                previous interviews.
              </p>
            </div>
          ) : history.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "50px 20px",
              }}
            >
              <div
                style={{
                  fontSize: "50px",
                  marginBottom: "20px",
                }}
              >
                📋
              </div>

              <h2>No Interviews Yet</h2>

              <p>
                Start your first AI mock interview
                to see your history here.
              </p>

              <button
                className="primary-btn"
                onClick={() => {
                  setShowForm(true);
                  setActivePage("dashboard");
                  setError("");
                }}
                style={{ marginTop: "20px" }}
              >
                Start Interview →
              </button>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "25px",
                  gap: "15px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h2 style={{ marginBottom: "5px" }}>
                    Previous Interviews
                  </h2>

                  <p style={{ margin: 0 }}>
                    {history.length} interview
                    {history.length !== 1 ? "s" : ""} found
                  </p>
                </div>

                <button
                  className="primary-btn"
                  onClick={() => {
                    setShowForm(true);
                    setActivePage("dashboard");
                    setError("");
                  }}
                >
                  + New Interview
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                }}
              >
                {history.map((interview) => {
                  const completed =
                    interview.status === "COMPLETED";

                  return (
                    <div
                      key={interview.interviewId}
                      style={{
                        padding: "24px",
                        borderRadius: "18px",
                        border:
                          "1px solid rgba(255,255,255,0.10)",
                        background:
                          "rgba(255,255,255,0.035)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "18px",
                        }}
                      >
                        <span
                          className="badge"
                          style={{
                            margin: 0,
                            fontSize: "11px",
                          }}
                        >
                          #{interview.interviewId}
                        </span>

                        <span
                          style={{
                            padding: "6px 10px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            background: completed
                              ? "rgba(34,197,94,0.15)"
                              : "rgba(251,191,36,0.15)",
                            color: completed
                              ? "#86efac"
                              : "#fcd34d",
                          }}
                        >
                          {completed
                            ? "COMPLETED"
                            : interview.status ||
                              "IN PROGRESS"}
                        </span>
                      </div>

                      <h2
                        style={{
                          marginBottom: "8px",
                        }}
                      >
                        {interview.jobRole}
                      </h2>

                      <p
                        style={{
                          marginBottom: "20px",
                        }}
                      >
                        {interview.experienceLevel}
                      </p>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "1fr 1fr",
                          gap: "12px",
                          marginBottom: "20px",
                        }}
                      >
                        <div
                          style={{
                            padding: "12px",
                            borderRadius: "10px",
                            background:
                              "rgba(255,255,255,0.035)",
                          }}
                        >
                          <small>Date</small>

                          <div
                            style={{
                              marginTop: "5px",
                              fontWeight: "600",
                            }}
                          >
                            {interview.createdAt ||
                              "N/A"}
                          </div>
                        </div>

                        <div
                          style={{
                            padding: "12px",
                            borderRadius: "10px",
                            background:
                              "rgba(255,255,255,0.035)",
                          }}
                        >
                          <small>Experience</small>

                          <div
                            style={{
                              marginTop: "5px",
                              fontWeight: "600",
                            }}
                          >
                            {interview.experienceLevel ||
                              "N/A"}
                          </div>
                        </div>
                      </div>

                      <button
                        className="primary-btn"
                        style={{
                          width: "100%",
                        }}
                        onClick={() =>
                          viewHistoryResult(interview)
                        }
                      >
                        View Result →
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    );
  };

  // =========================
  // HISTORY RESULT SCREEN
  // =========================

  const renderHistoryResult = () => {
    if (!selectedHistory) {
      return null;
    }

    const interview = selectedHistory.interview;
    const result = selectedHistory.result;

    return (
      <main className="form-page">
        <div className="form-header">
          <button
            className="back-btn"
            onClick={() => {
              setSelectedHistory(null);
              setActivePage("history");
            }}
            style={{
              marginBottom: "20px",
            }}
          >
            ← Back to History
          </button>

          <div className="badge">
            📊 INTERVIEW RESULT
          </div>

          <h1>
            {result.jobRole}
            <span> Result</span>
          </h1>

          <p>
            Interview #{result.interviewId} •{" "}
            {interview.createdAt || "N/A"}
          </p>
        </div>

        <div
          className="form-card"
          style={{
            maxWidth: "1100px",
            width: "100%",
          }}
        >
          {/* Summary */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "15px",
              marginBottom: "35px",
            }}
          >
            <div
              style={{
                padding: "22px",
                borderRadius: "15px",
                background:
                  "rgba(255,255,255,0.04)",
                textAlign: "center",
              }}
            >
              <small>Average Score</small>

              <div
                style={{
                  fontSize: "34px",
                  fontWeight: "700",
                  marginTop: "8px",
                }}
              >
                {Number(
                  result.averageScore || 0
                ).toFixed(1)}
                /10
              </div>
            </div>

            <div
              style={{
                padding: "22px",
                borderRadius: "15px",
                background:
                  "rgba(255,255,255,0.04)",
                textAlign: "center",
              }}
            >
              <small>Total Questions</small>

              <div
                style={{
                  fontSize: "34px",
                  fontWeight: "700",
                  marginTop: "8px",
                }}
              >
                {result.totalQuestions}
              </div>
            </div>

            <div
              style={{
                padding: "22px",
                borderRadius: "15px",
                background:
                  "rgba(255,255,255,0.04)",
                textAlign: "center",
              }}
            >
              <small>Answered</small>

              <div
                style={{
                  fontSize: "34px",
                  fontWeight: "700",
                  marginTop: "8px",
                }}
              >
                {result.answeredQuestions}
              </div>
            </div>

            <div
              style={{
                padding: "22px",
                borderRadius: "15px",
                background:
                  "rgba(255,255,255,0.04)",
                textAlign: "center",
              }}
            >
              <small>Status</small>

              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  marginTop: "14px",
                }}
              >
                {interview.status ||
                  "IN PROGRESS"}
              </div>
            </div>
          </div>

          {/* Questions */}

          <h2
            style={{
              marginBottom: "20px",
            }}
          >
            Question Analysis
          </h2>

          {result.questions &&
          result.questions.length > 0 ? (
            result.questions.map(
              (question, index) => (
                <div
                  key={question.questionId}
                  style={{
                    padding: "25px",
                    marginBottom: "18px",
                    borderRadius: "16px",
                    border:
                      "1px solid rgba(255,255,255,0.10)",
                    background:
                      "rgba(255,255,255,0.03)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      gap: "15px",
                      marginBottom: "15px",
                    }}
                  >
                    <span className="badge">
                      Question {index + 1}
                    </span>

                    <strong
                      style={{
                        fontSize: "20px",
                      }}
                    >
                      {question.score !== null &&
                      question.score !== undefined
                        ? `${question.score}/10`
                        : "Not Answered"}
                    </strong>
                  </div>

                  <h3
                    style={{
                      fontSize: "20px",
                      lineHeight: "1.5",
                      marginBottom: "20px",
                    }}
                  >
                    {question.question}
                  </h3>

                  {question.answer ? (
                    <>
                      <div
                        style={{
                          padding: "18px",
                          borderRadius: "12px",
                          background:
                            "rgba(255,255,255,0.035)",
                          marginBottom: "15px",
                        }}
                      >
                        <strong>
                          Your Answer
                        </strong>

                        <p
                          style={{
                            marginTop: "10px",
                            lineHeight: "1.7",
                            fontSize: "16px",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {question.answer}
                        </p>
                      </div>

                      <div
                        style={{
                          padding: "18px",
                          borderRadius: "12px",
                          background:
                            "rgba(255,255,255,0.035)",
                        }}
                      >
                        <strong>
                          AI Feedback
                        </strong>

                        <p
                          style={{
                            marginTop: "10px",
                            lineHeight: "1.7",
                            fontSize: "16px",
                          }}
                        >
                          {question.feedback ||
                            "No feedback available."}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p>
                      This question was not answered.
                    </p>
                  )}
                </div>
              )
            )
          ) : (
            <p>No question results available.</p>
          )}

          <div
            className="form-actions"
            style={{
              marginTop: "30px",
            }}
          >
            <button
              className="back-btn"
              onClick={() => {
                setSelectedHistory(null);
                setActivePage("history");
              }}
            >
              ← Back to History
            </button>

            <button
              className="primary-btn"
              onClick={() => {
                setSelectedHistory(null);
                setShowForm(true);
                setActivePage("dashboard");
              }}
            >
              Start New Interview →
            </button>
          </div>
        </div>
      </main>
    );
  };

  // =========================
  // LOGIN / REGISTER SCREEN
  // =========================

  const renderAuth = () => {
    return (
      <main className="form-page">
        <div className="form-header">
          <div className="badge">
            ✨ AI INTERVIEW PLATFORM
          </div>

          <h1>
            {authMode === "login"
              ? "Welcome Back"
              : "Create Your Account"}
          </h1>

          <p>
            {authMode === "login"
              ? "Login to continue your interview preparation."
              : "Create an account to start practicing with AI."}
          </p>
        </div>

        <div className="form-card">
          <form
            onSubmit={
              authMode === "login"
                ? handleLogin
                : handleRegister
            }
          >
            {authMode === "register" && (
              <div className="field">
                <label>Full Name</label>

                <input
                  name="name"
                  type="text"
                  value={authData.name}
                  onChange={handleAuthChange}
                  placeholder="Enter your name"
                />
              </div>
            )}

            <div className="field">
              <label>Email</label>

              <input
                name="email"
                type="email"
                value={authData.email}
                onChange={handleAuthChange}
                placeholder="Enter your email"
              />
            </div>

            <div className="field">
              <label>Password</label>

              <input
                name="password"
                type="password"
                value={authData.password}
                onChange={handleAuthChange}
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="error-message">
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              className="primary-btn"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : authMode === "login"
                ? "Login →"
                : "Create Account →"}
            </button>
          </form>

          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
            }}
          >
            {authMode === "login" ? (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setAuthMode("register");
                    setError("");
                  }}
                >
                  Register
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setAuthMode("login");
                    setError("");
                  }}
                >
                  Login
                </button>
              </p>
            )}
          </div>
        </div>
      </main>
    );
  };

  // =========================
  // HOME SCREEN
  // =========================

  const renderHome = () => {
    return (
      <main className="hero">
        <div className="hero-content">
          <div className="badge">
            ✨ AI-Powered Interview Practice
          </div>

          <h1>
            Master Your Next
            <span> Technical Interview</span>
          </h1>

          <p>
            Practice realistic interviews with
            AI-generated questions, intelligent answer
            evaluation, and personalized feedback.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={() => {
                setShowForm(true);
                setActivePage("dashboard");
                setError("");
              }}
            >
              Start Interview →
            </button>

            <button
              className="secondary-btn"
              onClick={loadHistory}
            >
              View History
            </button>
          </div>

          <div className="stats">
            <div>
              <strong>AI</strong>
              <span>Powered</span>
            </div>

            <div>
              <strong>100+</strong>
              <span>Questions</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>Practice</span>
            </div>
          </div>
        </div>

        <div className="preview-card">
          <div className="preview-header">
            <div>
              <small>LIVE INTERVIEW</small>
              <h3>Java Developer</h3>
            </div>

            <span className="live-dot">
              ● LIVE
            </span>
          </div>

          <div className="question-card">
            <div className="question-number">
              Question 03 / 10
            </div>

            <h2>
              What is the difference between
              JDK, JRE and JVM?
            </h2>

            <div className="answer-lines">
              <div></div>
              <div></div>
              <div></div>
            </div>

            <div className="ai-status">
              ✦ AI is analyzing your response...
            </div>
          </div>

          <div className="preview-footer">
            <span>Difficulty</span>

            <span className="difficulty">
              Medium
            </span>

            <span className="timer">
              ⏱ 01:42
            </span>
          </div>
        </div>
      </main>
    );
  };
    




  // =========================
  // INTERVIEW FORM
  // =========================

  const renderForm = () => {
    return (
      <main className="form-page">
        <div className="form-header">
          <div className="badge">
            ✨ CREATE INTERVIEW
          </div>

          <h1>
            Configure Your
            <span> AI Interview</span>
          </h1>

          <p>
            Tell us about the role you're preparing for.
            Our AI will generate questions tailored to you.
          </p>
        </div>

        <div className="form-card">
          <div className="form-grid">
            <div className="field">
              <label>Job Role</label>

              <input
                name="jobRole"
                type="text"
                value={formData.jobRole}
                onChange={handleChange}
                placeholder="e.g. Java Developer"
              />
            </div>

            <div className="field">
              <label>Experience Level</label>

              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
              >
                <option value="Fresher">
                  Fresher
                </option>

                <option value="0-1 Years">
                  0-1 Years
                </option>

                <option value="1-3 Years">
                  1-3 Years
                </option>

                <option value="3+ Years">
                  3+ Years
                </option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Job Description</label>

            <textarea
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleChange}
              placeholder="Paste the job description here..."
              rows="6"
            />

            <small>
              💡 AI will use this information to generate
              relevant interview questions.
            </small>
          </div>

          <div className="field">
            <label>Number of Questions</label>

            <select
              name="numberOfQuestions"
              value={formData.numberOfQuestions}
              onChange={handleChange}
            >
              <option value={5}>
                5 Questions
              </option>

              <option value={10}>
                10 Questions
              </option>

              <option value={15}>
                15 Questions
              </option>

              <option value={20}>
                20 Questions
              </option>
            </select>
          </div>

          {error && (
            <div className="error-message">
              ⚠ {error}
            </div>
          )}

          <div className="form-actions">
            <button
              className="back-btn"
              onClick={() => {
                setShowForm(false);
                setActivePage("dashboard");
                setError("");
              }}
              disabled={loading}
            >
              ← Back
            </button>

            <button
              className="primary-btn"
              onClick={startInterview}
              disabled={loading}
            >
              {loading
                ? "Generating Interview..."
                : "Generate AI Interview →"}
            </button>
          </div>
        </div>
      </main>
    );
  };

  // =========================
  // INTERVIEW SCREEN
  // =========================

  const renderInterview = () => {
    const question = questions[currentQuestion];

    if (!question) {
      return (
        <main className="form-page">
          <div className="form-card">
            <h2>No question available.</h2>

            <button
              className="primary-btn"
              onClick={restartInterview}
            >
              Restart Interview
            </button>
          </div>
        </main>
      );
    }

    const questionNumber = currentQuestion + 1;
    const totalQuestions = questions.length;

    return (
      <main className="interview-page">
        <div className="interview-header">
          <div>
            <div className="badge">
              ✨ AI INTERVIEW
            </div>

            <h1>{formData.jobRole}</h1>

            <p>{formData.experienceLevel}</p>
          </div>

          <div className="progress-info">
            <span>
              Question {questionNumber} / {totalQuestions}
            </span>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${
                    (questionNumber / totalQuestions) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="interview-card">
          <div className="question-number">
            QUESTION {questionNumber}
          </div>

          <h2>{question.questionText}</h2>

          {question.questionType && (
            <span className="question-type">
              {question.questionType}
            </span>
          )}

          {question.difficulty && (
            <span className="difficulty">
              {question.difficulty}
            </span>
          )}

          {!evaluation ? (
            <>
              <div className="answer-section">
                <label>Your Answer</label>

                <textarea
                  value={answer}
                  onChange={(e) => {
                    setAnswer(e.target.value);
                    setError("");
                  }}
                  placeholder="Type your answer here..."
                  rows="10"
                />

                <div className="answer-info">
                  <span>
                    {answer.length} characters
                  </span>

                  <span>
                    💡 Explain your answer clearly
                  </span>
                </div>
              </div>

              {error && (
                <div className="error-message">
                  ⚠ {error}
                </div>
              )}

                     <div className="interview-actions">
                <button
                  className="back-btn"
                  onClick={previousQuestion}
                  disabled={
                    currentQuestion === 0 || loading
                  }
                >
                  ← Previous
                </button>

                <button
                  className="primary-btn"
                  onClick={submitAnswer}
                  disabled={loading}
                >
                  {loading
                    ? "AI is evaluating..."
                    : "Submit Answer →"}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* =========================
                  AI EVALUATION
              ========================= */}

              <div
                className="ai-evaluation"
                style={{
                  marginTop: "30px",
                  padding: "25px",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                }}
              >

                {/* SCORE */}
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: "30px",
                  }}
                >
                  <div className="badge">
                    ✨ AI EVALUATION
                  </div>

                  <h2 style={{ marginTop: "15px" }}>
                    Your Score
                  </h2>

                  <div
                    style={{
                      fontSize: "48px",
                      fontWeight: "700",
                      margin: "10px 0",
                    }}
                  >
                    {evaluation.score ?? 0}/10
                  </div>
                </div>

                {/* AI FEEDBACK */}
                <div
                  style={{
                    marginBottom: "25px",
                    padding: "20px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <h3>🤖 AI Feedback</h3>

                  <p
                    style={{
                      lineHeight: "1.7",
                      marginTop: "10px",
                    }}
                  >
                    {evaluation.feedback ||
                      "No feedback was provided."}
                  </p>
                </div>

                {/* IMPROVED ANSWER */}
                <div
                  style={{
                    marginBottom: "25px",
                    padding: "20px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <h3>✏️ Improved Answer</h3>

                  <p
                    style={{
                      lineHeight: "1.7",
                      marginTop: "10px",
                    }}
                  >
                    {evaluation.improvedAnswer ||
                      "No improved answer was generated."}
                  </p>
                </div>

                {/* CORRECT ANSWER */}
                <div
                  style={{
                    marginBottom: "25px",
                    padding: "20px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <h3>💡 Correct Answer</h3>

                  <p
                    style={{
                      lineHeight: "1.7",
                      marginTop: "10px",
                    }}
                  >
                    {evaluation.correctAnswer ||
                      "No correct answer was generated."}
                  </p>
                </div>

                {/* EXPLANATION */}
                <div
                  style={{
                    marginBottom: "25px",
                    padding: "20px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <h3>📚 Explanation</h3>

                  <p
                    style={{
                      lineHeight: "1.7",
                      marginTop: "10px",
                    }}
                  >
                    {evaluation.explanation ||
                      "No explanation was generated."}
                  </p>
                </div>

                {/* KEY POINTS */}
                <div
                  style={{
                    marginBottom: "25px",
                    padding: "20px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <h3>🎯 Key Points</h3>

                  {evaluation.keyPoints ? (
                    <ul
                      style={{
                        lineHeight: "1.8",
                        marginTop: "10px",
                        paddingLeft: "25px",
                      }}
                    >
                      {evaluation.keyPoints
                        .split("|")
                        .map((point, index) => (
                          <li key={index}>
                            {point.trim()}
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p>No key points were generated.</p>
                  )}
                </div>

                {/* INTERVIEW TIP */}
                <div
                  style={{
                    padding: "20px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <h3>💬 Interview Tip</h3>

                  <p
                    style={{
                      lineHeight: "1.7",
                      marginTop: "10px",
                    }}
                  >
                    {evaluation.interviewTip ||
                      "No interview tip was generated."}
                  </p>
                </div>
                {/* NEXT QUESTION / FINISH INTERVIEW */}
              <div
                className="interview-actions"
                style={{
                  marginTop: "30px",
                }}
              >
                <button
                  className="primary-btn"
                  onClick={nextQuestion}
                  disabled={loading}
                >
                  {currentQuestion < questions.length - 1
                    ? "Next Question →"
                    : "Finish Interview ✓"}
                </button>
              </div>

              </div>
            </> 
          )}
        </div>
      </main>
    );
  };

  // =========================
  // COMPLETION SCREEN
  // =========================

  const renderCompleted = () => {
    return (
      <main className="form-page">
        <div className="form-card completion-card">
          <div className="completion-icon">
            ✓
          </div>

          <div className="badge">
            🎉 INTERVIEW COMPLETED
          </div>

          <h1>Great Job!</h1>

          <p>
            You completed your{" "}
            <strong>{formData.jobRole}</strong>{" "}
            interview.
          </p>

          <div className="completion-stats">
            <div>
              <strong>{questions.length}</strong>

              <span>Questions</span>
            </div>

            <div>
              <strong>{answers.length}</strong>

              <span>Answers</span>
            </div>

            <div>
              <strong>
                {calculateTotalScore()}/10
              </strong>

              <span>Average Score</span>
            </div>
          </div>

          {/* ANSWER RESULTS */}

          <div
            style={{
              marginTop: "30px",
              textAlign: "left",
            }}
          >
            <h2>Interview Results</h2>

            {answers.map((item, index) => (
              <div
                key={item.answerId || index}
                style={{
                  marginTop: "20px",
                  padding: "20px",
                  borderRadius: "14px",
                  border:
                    "1px solid rgba(255,255,255,0.1)",
                  background:
                    "rgba(255,255,255,0.03)",
                }}
              >
                <h3>
                  Question {index + 1}
                </h3>

                <p>
                  <strong>
                    {item.questionText}
                  </strong>
                </p>

                <p>
                  <strong>Your Answer:</strong>{" "}
                  {item.answerText}
                </p>

                <p>
                  <strong>Score:</strong>{" "}
                  {item.score ?? 0}/10
                </p>

                <p>
                  <strong>AI Feedback:</strong>{" "}
                  {item.feedback ||
                    "No feedback available."}
                </p>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button
              className="back-btn"
              onClick={() => {
                setInterviewCompleted(false);
                setShowForm(false);
                setActivePage("dashboard");
              }}
            >
              ← Home
            </button>

            <button
              className="primary-btn"
              onClick={restartInterview}
            >
              Start New Interview →
            </button>
          </div>
        </div>
      </main>
    );
  };
// =========================
// LOAD DASHBOARD
// =========================

const loadDashboard = async () => {
  if (!user || !user.userId) {
    return;
  }

  try {
    setDashboardLoading(true);
    setError("");

    const response = await fetch(
      `${API_BASE_URL}/dashboard/${user.userId}`
    );

    if (!response.ok) {
      throw new Error("Failed to load dashboard");
    }

    const data = await response.json();

    console.log("Dashboard data:", data);

    setDashboard(data);

  } catch (error) {
    console.error("Dashboard error:", error);

    setError(
      error.message || "Unable to load dashboard."
    );
  } finally {
    setDashboardLoading(false);
  }
};
  // =========================
  // AUTHENTICATION CHECK
  // =========================

 if (!isAuthenticated) {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">
          <img
            src="/aiinterviewai-logo.png"
            alt="AI Interview"
            className="logo-image"
          />
        </div>
      </nav>

      {renderAuth()}
    </div>
  );
}

  
     // =========================
  // MAIN APPLICATION
  // =========================

  return (
    <div className="app">

      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="navbar">

        {/* LOGO */}
<div
  className="logo"
  onClick={() => {
    setInterviewStarted(false);
    setInterviewCompleted(false);
    setShowForm(false);
    setEvaluation(null);
    setActivePage("dashboard");
    setSelectedHistory(null);
    setError("");

    loadDashboard();
  }}
  style={{ cursor: "pointer" }}
>
  <img
    src="/aiinterviewai-logo.png"
    alt="AI Interview"
    className="logo-image"
  />
</div>


        {/* NAVIGATION */}

        <div className="nav-links">

          {/* DASHBOARD */}

          <span
            onClick={() => {
              setInterviewStarted(false);
              setInterviewCompleted(false);
              setShowForm(false);
              setEvaluation(null);
              setActivePage("dashboard");
              setSelectedHistory(null);
              setError("");

              loadDashboard();
            }}
            style={{ cursor: "pointer" }}
          >
            Dashboard
          </span>


          {/* PRACTICE */}

          <span
            onClick={() => {
              setShowForm(true);
              setInterviewCompleted(false);
              setInterviewStarted(false);
              setEvaluation(null);
              setActivePage("dashboard");
              setSelectedHistory(null);
              setError("");
            }}
            style={{ cursor: "pointer" }}
          >
            Practice
          </span>


          {/* HISTORY */}

          <span
            onClick={() => {
              loadHistory();
            }}
            style={{ cursor: "pointer" }}
          >
            History
          </span>


          {/* JOB FIT */}

          <span
            onClick={() => {
              setInterviewStarted(false);
              setInterviewCompleted(false);
              setShowForm(false);
              setEvaluation(null);
              setSelectedHistory(null);
              setError("");

              setActivePage("job-fit");

              loadResumes();
            }}
            style={{ cursor: "pointer" }}
          >
            Job Fit
          </span>


          {/* JOB FIT HISTORY */}

          <span
            onClick={() => {
              setInterviewStarted(false);
              setInterviewCompleted(false);
              setShowForm(false);
              setEvaluation(null);
              setSelectedHistory(null);
              setError("");

              setActivePage("job-fit-history");

              loadJobFitHistory();
            }}
            style={{ cursor: "pointer" }}
          >
            Job Fit History
          </span>


          {/* RESUMES */}

          <span
            onClick={() => {
              setInterviewStarted(false);
              setInterviewCompleted(false);
              setShowForm(false);
              setEvaluation(null);
              setSelectedHistory(null);
              setError("");

              setActivePage("resumes");

              loadResumes();
            }}
            style={{ cursor: "pointer" }}
          >
            Resumes
          </span>


          {/* USER NAME */}

          <span>
            {user?.name || "User"}
          </span>


          {/* LOGOUT */}

          <button
            className="profile-btn"
            onClick={handleLogout}
            title="Logout"
          >
            {user?.name
              ? user.name
                  .split(" ")
                  .map((name) => name[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()
              : "U"}
          </button>

        </div>

      </nav>


      {/* =========================
          PAGE ROUTING
      ========================= */}

      {interviewCompleted ? (

        renderCompleted()

      ) : interviewStarted ? (

        renderInterview()

      ) : activePage === "history-result" ? (

        renderHistoryResult()

      ) : activePage === "history" ? (

        renderHistory()

      ) : showForm ? (

        renderForm()

      ) : activePage === "dashboard" ? (

        renderDashboard()

      ) : activePage === "job-fit" ? (

        renderJobFit()

      ) : activePage === "job-fit-history" ? (

        renderJobFitHistory()

      ) : activePage === "resumes" ? (

        renderResumeManagement()

      ) : (

        renderHome()

      )}

    </div>
  );
}

export default App;